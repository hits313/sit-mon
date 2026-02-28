import { useState, useEffect, useRef } from 'react';

export interface Flight {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  velocity: number;
  true_track: number;
  altitude: number;
  category: string;
  isSimulated?: boolean;
}

// Mock flight data generator (Fallback)
const generateMockFlights = (count: number): Flight[] => {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    const zones = [
      { lat: 32, lng: 35 }, // Israel/Lebanon
      { lat: 50, lng: 30 }, // Ukraine
      { lat: 24, lng: 121 }, // Taiwan
      { lat: 26, lng: 56 }, // Strait of Hormuz
      { lat: 15, lng: 42 }, // Red Sea
    ];
    const zone = zones[i % zones.length];
    
    const startLat = zone.lat + (Math.random() - 0.5) * 10;
    const startLng = zone.lng + (Math.random() - 0.5) * 10;
    
    flights.push({
      icao24: Math.random().toString(36).substring(7),
      callsign: `SIM${Math.floor(Math.random() * 900) + 100}`,
      origin_country: 'SIMULATION',
      longitude: startLng,
      latitude: startLat,
      altitude: 15000 + Math.random() * 25000,
      velocity: 300 + Math.random() * 300,
      true_track: Math.random() * 360,
      category: 'A0',
      isSimulated: true
    });
  }
  return flights;
};

export function useOpenSky() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    const fetchFlights = async () => {
      const now = Date.now();
      // Rate limit: OpenSky anonymous is 10s. Let's do 15s to be safe.
      if (now - lastFetchRef.current < 15000) return;
      
      lastFetchRef.current = now;

      try {
        // Fetch all states (heavy, but gives global coverage)
        // We handle the volume by slicing the result
        const response = await fetch('https://opensky-network.org/api/states/all');
        
        if (!response.ok) {
           throw new Error(`OpenSky API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.states && Array.isArray(data.states)) {
          // Map raw array to Flight object
          // Index 0: icao24, 1: callsign, 2: origin_country, 5: longitude, 6: latitude, 
          // 7: baro_altitude, 9: velocity, 10: true_track, 17: category
          
          const realFlights: Flight[] = data.states
            .slice(0, 1000) // Limit to 1000 flights for performance
            .map((state: any[]) => ({
              icao24: state[0],
              callsign: state[1]?.trim() || 'N/A',
              origin_country: state[2],
              longitude: state[5],
              latitude: state[6],
              altitude: state[7] || 0,
              velocity: state[9] || 0,
              true_track: state[10] || 0,
              category: state[17] || 'Unknown',
              isSimulated: false
            }))
            .filter((f: Flight) => f.longitude !== null && f.latitude !== null); // Filter invalid positions

          if (isMounted) {
            setFlights(realFlights);
            setLoading(false);
            setError(null);
          }
        } else {
            throw new Error('Invalid data format');
        }

      } catch (err) {
        console.warn('OpenSky fetch failed, falling back to simulation:', err);
        if (isMounted) {
            // Only fallback if we have NO data yet
            setFlights(prev => prev.length > 0 ? prev : generateMockFlights(50));
            setError('Live flight data unavailable (Rate Limit/Error)');
            setLoading(false);
        }
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 15000); // 15s interval

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { flights, loading, error };
}
