import { useState, useEffect } from 'react';

export interface CablePath {
  id: string;
  name: string;
  coords: { lat: number; lng: number; alt: number }[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'FAULT';
  capacity: string;
}

// Simplified paths for major submarine cables
const MAJOR_CABLES = [
  // Atlantic
  {
    id: 'ac-1', name: 'Apollo', status: 'ACTIVE', capacity: '120 Tbps',
    path: [[50.0, -5.0], [45.0, -20.0], [40.0, -40.0], [40.0, -74.0]] // UK to US
  },
  {
    id: 'ac-2', name: 'MAREA', status: 'ACTIVE', capacity: '200 Tbps',
    path: [[43.0, -2.0], [40.0, -20.0], [36.0, -50.0], [36.0, -75.0]] // Spain to US
  },
  // Pacific
  {
    id: 'pc-1', name: 'Faster', status: 'ACTIVE', capacity: '60 Tbps',
    path: [[45.0, -124.0], [40.0, -160.0], [35.0, 140.0]] // US to Japan
  },
  {
    id: 'pc-2', name: 'Southern Cross', status: 'ACTIVE', capacity: '20 Tbps',
    path: [[34.0, -118.0], [21.0, -157.0], [-18.0, 178.0], [-33.0, 151.0]] // US -> Hawaii -> Fiji -> Aus
  },
  // Europe - Asia (SEA-ME-WE)
  {
    id: 'ea-1', name: 'SEA-ME-WE 5', status: 'ACTIVE', capacity: '24 Tbps',
    path: [[43.0, 6.0], [37.0, 15.0], [31.0, 32.0], [12.0, 45.0], [6.0, 80.0], [1.0, 103.0]] // France -> Italy -> Egypt -> Yemen -> Sri Lanka -> Singapore
  },
  // Intra-Asia
  {
    id: 'ia-1', name: 'APG', status: 'FAULT', capacity: '54 Tbps',
    path: [[35.0, 140.0], [31.0, 121.0], [22.0, 114.0], [16.0, 108.0], [1.0, 104.0]] // Japan -> China -> HK -> Vietnam -> Singapore
  },
  // Africa
  {
    id: 'af-1', name: '2Africa', status: 'ACTIVE', capacity: '180 Tbps',
    path: [[50.0, -5.0], [35.0, -10.0], [15.0, -20.0], [0.0, 8.0], [-30.0, 15.0], [-25.0, 35.0], [10.0, 50.0], [25.0, 35.0]] // Loop around Africa
  }
];

export function useSubmarineCables() {
  const [cables, setCables] = useState<CablePath[]>([]);

  useEffect(() => {
    // Interpolate points for smoother globe lines
    const processedCables = MAJOR_CABLES.map(cable => {
      const coords = [];
      const path = cable.path;
      for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i+1];
        const steps = 20;
        for (let j = 0; j <= steps; j++) {
          const lat = start[0] + (end[0] - start[0]) * (j / steps);
          const lng = start[1] + (end[1] - start[1]) * (j / steps);
          coords.push({ lat, lng, alt: 0.001 }); // Slightly above surface
        }
      }
      return {
        id: cable.id,
        name: cable.name,
        status: cable.status as any,
        capacity: cable.capacity,
        coords
      };
    });
    setCables(processedCables);
  }, []);

  return { cables };
}
