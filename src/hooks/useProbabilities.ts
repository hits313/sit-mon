import { useState, useEffect } from 'react';

export interface ProbabilityEvent {
  id: string;
  name: string;
  probability: number; // 0-100
  trend: 'UP' | 'DOWN' | 'STABLE';
  category: 'GEOPOLITICAL' | 'CYBER' | 'MILITARY' | 'ECONOMIC';
  region: string;
}

const INITIAL_EVENTS: ProbabilityEvent[] = [
  { id: '1', name: 'Taiwan Strait Escalation', probability: 34, trend: 'UP', category: 'MILITARY', region: 'ASIA' },
  { id: '2', name: 'Hormuz Strait Closure', probability: 12, trend: 'STABLE', category: 'GEOPOLITICAL', region: 'MIDDLE EAST' },
  { id: '3', name: 'Global Cyber Grid Failure', probability: 8, trend: 'UP', category: 'CYBER', region: 'GLOBAL' },
  { id: '4', name: 'North Sea Cable Sabotage', probability: 21, trend: 'DOWN', category: 'MILITARY', region: 'EUROPE' },
  { id: '5', name: 'Arctic Resource Conflict', probability: 15, trend: 'STABLE', category: 'ECONOMIC', region: 'ARCTIC' },
  { id: '6', name: 'Satellite Collision Cascade', probability: 5, trend: 'UP', category: 'MILITARY', region: 'SPACE' },
];

export function useProbabilities() {
  const [events, setEvents] = useState<ProbabilityEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => prev.map(event => {
        const change = Math.random() > 0.7 ? (Math.random() - 0.5) * 2 : 0; // Small random change
        let newProb = Math.max(0, Math.min(100, event.probability + change));
        
        let newTrend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (change > 0.1) newTrend = 'UP';
        if (change < -0.1) newTrend = 'DOWN';

        return {
          ...event,
          probability: Number(newProb.toFixed(1)),
          trend: newTrend
        };
      }).sort((a, b) => b.probability - a.probability));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return { events };
}
