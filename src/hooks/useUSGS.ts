import { useState, useEffect } from 'react';

export interface Earthquake {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    alert: string | null;
    status: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // lon, lat, depth
  };
}

export type TimeRange = '1H' | '6H' | '24H' | '7D';

export function useUSGS(timeRange: TimeRange = '24H') {
  const [data, setData] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Switch to 'all' feeds to show more data (1.0+ magnitude)
        let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
        
        if (timeRange === '1H') {
          url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';
        } else if (timeRange === '7D') {
          url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch earthquake data');
        }
        const json = await response.json();
        
        let features = json.features;
        
        // Client-side filtering for 6H
        if (timeRange === '6H') {
          const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
          features = features.filter((f: any) => f.properties.time > sixHoursAgo);
        }

        setData(features);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [timeRange]);

  return { data, loading, error };
}
