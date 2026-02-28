import { useState, useEffect, useRef } from 'react';
import { TimeRange } from './useUSGS';

export interface ConflictEvent {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    name: string;
    url: string;
    shareimage?: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp: number;
    source?: string;
  };
}

// Static conflict zones for "Red/Yellow/Green" mapping
export const CONFLICT_ZONES = [
  { name: 'Israel - Iran Axis', coords: [32.0, 53.0], severity: 'CRITICAL', type: 'MISSILE_THREAT' },
  { name: 'Gaza Strip', coords: [34.4, 31.4], severity: 'CRITICAL', type: 'WAR_ZONE' },
  { name: 'Southern Lebanon', coords: [35.4, 33.1], severity: 'CRITICAL', type: 'CONFLICT_ZONE' },
  { name: 'Persian Gulf', coords: [51.0, 26.5], severity: 'HIGH', type: 'NAVAL_THREAT' },
  { name: 'Red Sea / Bab el-Mandeb', coords: [43.5, 12.6], severity: 'HIGH', type: 'NAVAL_THREAT' },
  { name: 'Eastern Ukraine', coords: [37.8, 48.0], severity: 'CRITICAL', type: 'WAR_ZONE' },
  { name: 'Khartoum, Sudan', coords: [32.5, 15.5], severity: 'HIGH', type: 'CIVIL_WAR' },
  { name: 'LAC (Ladakh) - India/China', coords: [78.5, 34.5], severity: 'MEDIUM', type: 'BORDER_TENSION' },
  { name: 'Arunachal Pradesh', coords: [93.0, 28.0], severity: 'MEDIUM', type: 'BORDER_TENSION' },
  { name: 'Taiwan Strait', coords: [119.5, 24.5], severity: 'MEDIUM', type: 'NAVAL_TENSION' },
  { name: 'Korean DMZ', coords: [127.0, 38.3], severity: 'MEDIUM', type: 'MILITARIZED_ZONE' },
];

// Fallback data (Real recent events, updated manually)
const FALLBACK_EVENTS: ConflictEvent[] = [
  {
    id: 'fallback-ukr-1',
    type: 'CONFLICT_REPORT',
    geometry: { type: 'Point', coordinates: [37.8, 48.0] }, // Donetsk
    properties: {
      name: 'Ongoing artillery exchanges in Donetsk region',
      url: 'https://liveuamap.com/',
      severity: 'CRITICAL',
      timestamp: Date.now() - 3600000 * 2,
      source: 'FALLBACK_INTEL'
    }
  },
  {
    id: 'fallback-gaza-1',
    type: 'CONFLICT_REPORT',
    geometry: { type: 'Point', coordinates: [34.4, 31.4] }, // Gaza
    properties: {
      name: 'Active military operations reported in Gaza Strip',
      url: 'https://israelpalestine.liveuamap.com/',
      severity: 'CRITICAL',
      timestamp: Date.now() - 3600000 * 4,
      source: 'FALLBACK_INTEL'
    }
  },
  {
    id: 'fallback-sudan-1',
    type: 'CONFLICT_REPORT',
    geometry: { type: 'Point', coordinates: [32.5, 15.6] }, // Khartoum
    properties: {
      name: 'Clashes between SAF and RSF in Khartoum',
      url: 'https://sudan.liveuamap.com/',
      severity: 'HIGH',
      timestamp: Date.now() - 3600000 * 12,
      source: 'FALLBACK_INTEL'
    }
  },
  {
    id: 'fallback-redsea-1',
    type: 'CONFLICT_REPORT',
    geometry: { type: 'Point', coordinates: [42.5, 15.0] }, // Red Sea
    properties: {
      name: 'Maritime security alert: Vessel reported suspicious approach',
      url: '#',
      severity: 'HIGH',
      timestamp: Date.now() - 3600000 * 6,
      source: 'FALLBACK_INTEL'
    }
  }
];

export function useIntelFeed(timeRange: TimeRange) {
  const [data, setData] = useState<ConflictEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Use 7 days by default to ensure we get data, unless specific range is requested
        let timespan = '7d';
        if (timeRange === '1H') timespan = '60min';
        if (timeRange === '6H') timespan = '360min';
        
        // Fetch GDELT Conflict Data
        const gdeltUrl = `https://api.gdeltproject.org/api/v2/geo/geo?query=(theme:ARMEDCONFLICT OR theme:TERROR OR theme:MILITARY)&format=geojson&timespan=${timespan}`;
        const res = await fetch(gdeltUrl);
        const json = await res.json();
        
        let gdeltEvents = (json.features || [])
          .filter((f: any) => f && f.geometry && f.geometry.type && f.geometry.coordinates) // Strict validation
          .map((f: any, idx: number) => {
            const name = (f.properties.name || '').toUpperCase();
            let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
            
            if (name.includes('MISSILE') || name.includes('NUCLEAR') || name.includes('WAR') || name.includes('ATTACK')) {
                severity = 'CRITICAL';
            } else if (name.includes('STRIKE') || name.includes('BOMB') || name.includes('CASUALTY')) {
                severity = 'HIGH';
            } else if (name.includes('PROTEST') || name.includes('RIOT')) {
                severity = 'LOW';
            }

            return {
              id: `gdelt-${idx}-${Date.now()}`,
              type: 'CONFLICT_REPORT',
              geometry: f.geometry,
              properties: {
                name: f.properties.name || 'Unspecified Conflict Event',
                url: f.properties.url || '#',
                shareimage: f.properties.shareimage,
                severity: severity,
                timestamp: Date.now(), 
                source: 'GDELT_INTEL'
              }
            };
          });

        // If GDELT returns nothing (rare but possible), use fallback
        if (gdeltEvents.length === 0) {
            console.warn("GDELT returned no events, using fallback data.");
            gdeltEvents = FALLBACK_EVENTS;
        }

        setData(gdeltEvents);
        setLoading(false);
        loadedRef.current = true;

      } catch (e) {
        console.error('Failed to fetch conflict data, using fallback', e);
        setData(FALLBACK_EVENTS);
        setLoading(false);
      }
    };

    fetchData();
    
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);

  }, [timeRange]);

  return { data, loading, zones: CONFLICT_ZONES };
}
