import { useState, useEffect } from 'react';

export interface CountryNetStatus {
  countryCode: string;
  countryName: string;
  connectivity: number; // 0-100%
  latency: number; // ms
  status: 'ONLINE' | 'DEGRADED' | 'RESTRICTED' | 'OFFLINE';
  coords: [number, number]; // Lat/Lng for marker
}

const INITIAL_STATUS: CountryNetStatus[] = [
  { countryCode: 'IR', countryName: 'Iran', connectivity: 45, latency: 180, status: 'RESTRICTED', coords: [32.0, 53.0] },
  { countryCode: 'CN', countryName: 'China', connectivity: 88, latency: 120, status: 'RESTRICTED', coords: [35.0, 104.0] },
  { countryCode: 'RU', countryName: 'Russia', connectivity: 75, latency: 95, status: 'DEGRADED', coords: [61.0, 105.0] },
  { countryCode: 'UA', countryName: 'Ukraine', connectivity: 62, latency: 110, status: 'DEGRADED', coords: [48.0, 31.0] },
  { countryCode: 'IL', countryName: 'Israel', connectivity: 98, latency: 45, status: 'ONLINE', coords: [31.0, 35.0] },
  { countryCode: 'PS', countryName: 'Gaza', connectivity: 12, latency: 400, status: 'OFFLINE', coords: [31.4, 34.4] },
  { countryCode: 'SD', countryName: 'Sudan', connectivity: 5, latency: 0, status: 'OFFLINE', coords: [12.0, 30.0] },
  { countryCode: 'MM', countryName: 'Myanmar', connectivity: 30, latency: 250, status: 'RESTRICTED', coords: [21.0, 96.0] },
  { countryCode: 'US', countryName: 'USA', connectivity: 99, latency: 20, status: 'ONLINE', coords: [38.0, -97.0] },
  { countryCode: 'GB', countryName: 'UK', connectivity: 99, latency: 15, status: 'ONLINE', coords: [55.0, -3.0] },
];

export function useInternetStatus() {
  const [netStatus, setNetStatus] = useState<CountryNetStatus[]>(INITIAL_STATUS);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetStatus(prev => prev.map(item => {
        // Simulate real-time fluctuations
        const fluctuation = (Math.random() - 0.5) * 2;
        let newConn = Math.max(0, Math.min(100, item.connectivity + fluctuation));
        
        // Specific logic for conflict zones to stay low
        if (item.status === 'OFFLINE') newConn = Math.min(newConn, 15);
        if (item.status === 'RESTRICTED') newConn = Math.min(newConn, 60);

        return {
          ...item,
          connectivity: parseFloat(newConn.toFixed(1)),
          latency: Math.max(10, Math.floor(item.latency + (Math.random() - 0.5) * 10))
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { netStatus };
}
