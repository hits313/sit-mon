import { useState, useEffect } from 'react';
import * as satellite from 'satellite.js';

export interface Satellite {
  satId: number;
  name: string;
  lat: number;
  lng: number;
  alt: number; // Normalized altitude (Earth Radius = 1)
  type: 'MILITARY' | 'COMMERCIAL' | 'GPS' | 'UNKNOWN';
}

const TLE_SOURCES = [
  { url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle', type: 'MILITARY' }, // ISS, Tiangong
  { url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle', type: 'GPS' },
  { url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle', type: 'COMMERCIAL' }
];

export function useSatellites() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [satRecords, setSatRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTLEs = async () => {
      try {
        const allRecords: any[] = [];

        for (const source of TLE_SOURCES) {
          try {
            const response = await fetch(source.url);
            if (!response.ok) throw new Error(`Failed to fetch ${source.url}`);
            
            const text = await response.text();
            // Split by line and remove empty lines
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

            // TLE Format: 3 lines per satellite (Name, Line 1, Line 2)
            for (let i = 0; i < lines.length; i++) {
              // Look for a line that starts with '1 ' (Line 1) and '2 ' (Line 2)
              // The line before '1 ' is usually the name
              if (lines[i].startsWith('1 ') && lines[i+1]?.startsWith('2 ')) {
                const name = lines[i-1] || 'Unknown Satellite';
                const line1 = lines[i];
                const line2 = lines[i+1];
                
                try {
                    const satrec = satellite.twoline2satrec(line1, line2);
                    allRecords.push({
                      satrec,
                      name: name,
                      type: source.type
                    });
                } catch (e) {
                    // Invalid TLE
                }
                i++; // Skip next line (Line 2)
              }
            }
          } catch (err) {
            console.warn(`Error fetching TLE from ${source.url}:`, err);
          }
        }

        if (isMounted) {
          // Limit total satellites for performance
          // Prioritize Military/GPS, then fill with Commercial
          const priority = allRecords.filter(r => r.type !== 'COMMERCIAL');
          const commercial = allRecords.filter(r => r.type === 'COMMERCIAL').slice(0, 300); // Limit Starlink to 300
          
          setSatRecords([...priority, ...commercial]);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load satellite data", err);
          setError("Failed to load satellite data");
          setLoading(false);
        }
      }
    };

    fetchTLEs();

    return () => { isMounted = false; };
  }, []);

  // Propagate positions every second
  useEffect(() => {
    if (satRecords.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newSats: Satellite[] = [];

      satRecords.forEach((rec, idx) => {
        try {
          const positionAndVelocity = satellite.propagate(rec.satrec, now);
          
          if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
            const positionGd = satellite.eciToGeodetic(positionAndVelocity.position as satellite.EciVec3<number>, satellite.gstime(now));
            
            const lng = satellite.degreesLong(positionGd.longitude);
            const lat = satellite.degreesLat(positionGd.latitude);
            const alt = positionGd.height / 6371; // Normalize altitude

            if (!isNaN(lat) && !isNaN(lng)) {
              newSats.push({
                satId: idx,
                name: rec.name,
                lat,
                lng,
                alt: Math.max(0.05, alt), // Ensure visible
                type: rec.type as any
              });
            }
          }
        } catch (e) {
          // Propagation error
        }
      });

      setSatellites(newSats);
    }, 1000);

    return () => clearInterval(interval);
  }, [satRecords]);

  return { satellites, loading, error };
}
