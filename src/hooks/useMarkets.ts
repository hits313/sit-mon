import { useState, useEffect } from 'react';

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  history: number[];
}

export function useMarkets() {
  const [markets, setMarkets] = useState<MarketData[]>([
    { symbol: 'BTC/USD', price: 64200, change: 2.4, history: [] },
    { symbol: 'ETH/USD', price: 3450, change: 1.8, history: [] },
    { symbol: 'GOLD', price: 2034, change: 0.5, history: [] },
    { symbol: 'BRENT', price: 82.40, change: -1.2, history: [] },
    { symbol: 'S&P 500', price: 5100, change: 0.8, history: [] },
  ]);

  useEffect(() => {
    // Initialize history
    setMarkets(prev => prev.map(m => ({
      ...m,
      history: Array.from({ length: 20 }, () => m.price * (1 + (Math.random() * 0.02 - 0.01)))
    })));

    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const volatility = m.symbol.includes('BTC') || m.symbol.includes('ETH') ? 0.002 : 0.0005;
        const change = (Math.random() * volatility * 2) - volatility;
        const newPrice = m.price * (1 + change);
        const newHistory = [...m.history.slice(1), newPrice];
        
        return {
          ...m,
          price: newPrice,
          change: ((newPrice - newHistory[0]) / newHistory[0]) * 100,
          history: newHistory
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { markets };
}
