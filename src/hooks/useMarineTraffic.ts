import { useState, useEffect } from 'react';

export interface Vessel {
  id: string;
  name: string;
  type: 'CARGO' | 'TANKER' | 'MILITARY' | 'OTHER';
  coordinates: [number, number];
  heading: number;
  destination: string;
}

// Major shipping lanes coordinates for simulation
const LANES = [
  { start: [30.0, 32.5], end: [12.5, 43.5], name: 'Suez-Red Sea' }, // Suez to Aden
  { start: [1.2, 103.8], end: [6.0, 95.0], name: 'Malacca Strait' }, // Singapore to Aceh
  { start: [36.0, -5.5], end: [45.0, 15.0], name: 'Mediterranean' }, // Gibraltar to Italy
  { start: [25.0, -80.0], end: [50.0, -5.0], name: 'Trans-Atlantic' }, // US to UK
  { start: [35.0, 140.0], end: [45.0, -130.0], name: 'Trans-Pacific' }, // Japan to US
  { start: [25.0, 55.0], end: [15.0, 65.0], name: 'Hormuz-Arabian Sea' }, // Persian Gulf out
  { start: [-34.0, 18.0], end: [-10.0, 40.0], name: 'Cape of Good Hope' },
  { start: [51.0, 1.5], end: [54.0, 8.0], name: 'English Channel' }
];

const SHIP_NAMES = [
  'EVER GIVEN', 'MAERSK ALABAMA', 'MSC OSCAR', 'HMM ALGECIRAS', 'CMA CGM JACQUES SAADE',
  'COSCO SHIPPING UNIVERSE', 'OOCL HONG KONG', 'ONE INTEGRITY', 'EVER ACE', 'HAPAG-LLOYD HAMBURG',
  'USS GERALD R. FORD', 'HMS QUEEN ELIZABETH', 'CHARLES DE GAULLE', 'SHANDONG', 'LIAONING',
  'ADMIRAL KUZNETSOV', 'INS VIKRANT', 'CAVOUR', 'JUAN CARLOS I', 'TCG ANADOLU'
];

const SHIP_TYPES = ['CARGO', 'TANKER', 'MILITARY', 'FISHING', 'PASSENGER', 'TUG'];
const COUNTRIES = ['PANAMA', 'LIBERIA', 'MARSHALL ISLANDS', 'HONG KONG', 'SINGAPORE', 'MALTA', 'BAHAMAS', 'CHINA', 'GREECE', 'JAPAN', 'USA', 'UK', 'RUSSIA'];

export function useMarineTraffic() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate initial vessels
    const initialVessels: Vessel[] = [];
    
    LANES.forEach((lane, laneIdx) => {
      // Create 8-15 ships per lane
      const count = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const progress = Math.random();
        const lat = lane.start[0] + (lane.end[0] - lane.start[0]) * progress;
        const lon = lane.start[1] + (lane.end[1] - lane.start[1]) * progress;
        
        // Add some noise
        const noiseLat = (Math.random() - 0.5) * 2.0;
        const noiseLon = (Math.random() - 0.5) * 2.0;

        const type = Math.random() > 0.9 ? 'MILITARY' : SHIP_TYPES[Math.floor(Math.random() * (SHIP_TYPES.length - 1))];
        const name = Math.random() > 0.9 ? SHIP_NAMES[Math.floor(Math.random() * SHIP_NAMES.length)] : `VESSEL ${Math.floor(Math.random() * 90000) + 10000}`;
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];

        initialVessels.push({
          id: `vessel-${laneIdx}-${i}`,
          name: `${name} [${country}]`,
          type: type as any,
          coordinates: [lat + noiseLat, lon + noiseLon],
          heading: Math.random() * 360,
          destination: 'IN TRANSIT'
        });
      }
    });

    setVessels(initialVessels);
    setLoading(false);

    // Animate vessels
    const interval = setInterval(() => {
      setVessels(prev => prev.map(v => ({
        ...v,
        coordinates: [
          v.coordinates[0] + (Math.random() - 0.5) * 0.02,
          v.coordinates[1] + (Math.random() - 0.5) * 0.02
        ],
        heading: v.heading + (Math.random() - 0.5) * 2
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { vessels, loading };
}
