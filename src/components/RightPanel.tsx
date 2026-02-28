import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, BarChart3, Hash, ChevronRight, MoreHorizontal, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useProbabilities } from '../hooks/useProbabilities';

interface RightPanelProps {
  selectedCountry: string | null;
}

export default function RightPanel({ selectedCountry }: RightPanelProps) {
  const { events } = useProbabilities();

  const [marketData, setMarketData] = useState([
    { name: 'S&P 500', region: 'US', value: 6878.88, change: -0.97 },
    { name: 'NASDAQ', region: 'US', value: 22668.21, change: -2.09 },
    { name: 'Dow Jones', region: 'US', value: 48977.92, change: -1.02 },
    { name: 'DAX', region: 'EU', value: 25284.26, change: 0.43 },
    { name: 'Brent Crude', region: 'OIL', value: 82.45, change: 1.2 },
    { name: 'Nikkei 225', region: 'ASIA', value: 38921.00, change: -0.5 },
    { name: 'FTSE 100', region: 'UK', value: 7654.32, change: 0.12 },
  ]);

  const [keywords, setKeywords] = useState([
    { rank: 1, word: 'Iran', count: 154 },
    { rank: 2, word: 'Israel', count: 62 },
    { rank: 3, word: 'Bahrain', count: 33 },
    { rank: 4, word: 'Ballistic', count: 28 },
    { rank: 5, word: 'Strait of Hormuz', count: 21 },
    { rank: 6, word: 'Cyberattack', count: 19 },
    { rank: 7, word: 'Ukraine', count: 18 },
    { rank: 8, word: 'Russia', count: 15 },
    { rank: 9, word: 'Taiwan', count: 12 },
    { rank: 10, word: 'China', count: 10 },
  ]);

  // Filter Events based on selectedCountry
  const filteredEvents = useMemo(() => {
    if (!selectedCountry) return events;
    return events.filter(e => {
      // Map regions to countries roughly or check name
      const regionMap: Record<string, string[]> = {
        'ASIA': ['CHINA', 'TAIWAN', 'JAPAN', 'NORTH KOREA', 'INDIA'],
        'MIDDLE EAST': ['IRAN', 'ISRAEL', 'BAHRAIN', 'SAUDI ARABIA'],
        'EUROPE': ['UK', 'GERMANY', 'FRANCE', 'UKRAINE', 'RUSSIA'],
        'US': ['US', 'USA', 'AMERICA'],
        'GLOBAL': [], // Show global for everyone? Or only when no country selected? Let's show global always or maybe not.
      };
      
      const countriesInRegion = regionMap[e.region] || [];
      const isRegionMatch = countriesInRegion.includes(selectedCountry);
      const isNameMatch = e.name.toUpperCase().includes(selectedCountry);
      
      return isRegionMatch || isNameMatch || e.region === 'GLOBAL';
    });
  }, [events, selectedCountry]);

  // Filter Markets
  const filteredMarkets = useMemo(() => {
    if (!selectedCountry) return marketData;
    return marketData.filter(m => {
       if (selectedCountry === 'US' && m.region === 'US') return true;
       if (['UK', 'GERMANY', 'FRANCE'].includes(selectedCountry) && m.region === 'EU') return true;
       if (selectedCountry === 'UK' && m.region === 'UK') return true;
       if (['CHINA', 'JAPAN', 'TAIWAN'].includes(selectedCountry) && m.region === 'ASIA') return true;
       if (m.region === 'OIL') return true; // Always show commodities
       return false;
    });
  }, [marketData, selectedCountry]);


  // Simulate Live Market Ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => {
        const fluctuation = (Math.random() - 0.5) * 0.5; // Small random change
        return {
          ...item,
          value: parseFloat((item.value + fluctuation).toFixed(2)),
          change: parseFloat((item.change + (fluctuation / 10)).toFixed(2))
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate Live Keyword Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setKeywords(prev => {
        const newKeywords = [...prev];
        const idx = Math.floor(Math.random() * newKeywords.length);
        newKeywords[idx].count += Math.floor(Math.random() * 3); // Random increment
        return newKeywords.sort((a, b) => b.count - a.count).map((k, i) => ({ ...k, rank: i + 1 }));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-[#333] w-80 flex-shrink-0 overflow-y-auto font-mono text-xs">
      
      {/* Real-time Probabilities */}
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#ef4444] font-bold flex items-center gap-2 tracking-wider">
            <AlertTriangle size={14} /> THREAT PROBABILITIES
          </h3>
          <div className="flex items-center gap-1">
             <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
             <span className="text-[9px] text-[#666]">LIVE</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-gray-500 text-center py-4">NO ACTIVE THREATS IN REGION</div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="group cursor-pointer">
                <div className="flex justify-between text-[#666] mb-1 text-[10px]">
                  <span>{event.category} • {event.region}</span>
                  <span className={`flex items-center ${event.trend === 'UP' ? 'text-red-500' : event.trend === 'DOWN' ? 'text-green-500' : 'text-gray-500'}`}>
                    {event.trend === 'UP' && <ArrowUp size={10} className="mr-1" />}
                    {event.trend === 'DOWN' && <ArrowDown size={10} className="mr-1" />}
                    {event.trend === 'STABLE' && <Minus size={10} className="mr-1" />}
                    {event.trend}
                  </span>
                </div>
                <p className="text-gray-300 font-bold mb-2 leading-tight group-hover:text-white transition-colors">
                  {event.name}
                </p>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${event.probability > 50 ? 'text-[#ef4444]' : 'text-[#f97316]'}`}>
                    {event.probability}% LIKELIHOOD
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#333] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${event.probability > 50 ? 'bg-[#ef4444]' : 'bg-[#f97316]'}`} 
                    style={{ width: `${event.probability}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Markets */}
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#eab308] font-bold flex items-center gap-2 tracking-wider">
            <TrendingUp size={14} /> MARKETS
          </h3>
          <span className="bg-[#eab308] text-black px-1.5 py-0.5 text-[9px] font-bold rounded">MIXED</span>
        </div>

        <div className="space-y-3">
          {filteredMarkets.map((m) => (
            <div key={m.name} className="flex justify-between items-center">
              <span className="text-gray-400">{m.name} <span className="text-[#666] text-[9px]">{m.region}</span></span>
              <span className={`${m.change < 0 ? 'text-[#ef4444]' : 'text-[#00ff41]'} transition-colors duration-500`}>
                {m.value.toLocaleString()} {m.change < 0 ? '▼' : '▲'} {m.change > 0 ? '+' : ''}{m.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Keywords */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#ef4444] font-bold flex items-center gap-2 tracking-wider">
            <Hash size={14} /> TOP KEYWORDS (24H)
          </h3>
        </div>

        <div className="space-y-2">
          {keywords.map((item) => (
            <div key={item.word} className="flex items-center justify-between p-2 hover:bg-[#333]/30 rounded cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-[#ef4444] font-bold">#{item.rank}</span>
                <span className="text-gray-300">{item.word}</span>
              </div>
              <span className="text-[#666] transition-all duration-300">{item.count} mentions</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
