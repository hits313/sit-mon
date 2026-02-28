import React, { useState, useMemo } from 'react';
import { Search, Zap, Activity, Shield, Twitter, Hash, Terminal, ExternalLink, CheckCircle2, Rss } from 'lucide-react';
import { useNewsAPI, NewsCategory } from '../hooks/useNewsAPI';
import { TimeRange } from '../hooks/useUSGS';

interface NewsPanelProps {
  timeRange: TimeRange;
  selectedCountry: string | null;
}

export default function NewsPanel({ timeRange, selectedCountry }: NewsPanelProps) {
  const [activeTab, setActiveTab] = useState<NewsCategory>('WIRE');
  const { news, loading } = useNewsAPI(activeTab, timeRange);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);
  
  // Extract unique sources for filter
  const outlets = useMemo(() => {
    if (activeTab !== 'WIRE') return [];
    const sources = new Set(news.map(n => n.source));
    return Array.from(sources);
  }, [news, activeTab]);

  const filteredData = useMemo(() => {
    let data = news;

    // Filter by Country
    if (selectedCountry) {
      data = data.filter((item) => {
        const text = `${item.title} ${item.content}`.toUpperCase();
        return text.includes(selectedCountry);
      });
    }

    // Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter((item) => {
        return item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query);
      });
    }

    // Filter by Outlet (News only)
    if (activeTab === 'WIRE' && selectedOutlet) {
      data = data.filter((item) => item.source === selectedOutlet);
    }

    return data;
  }, [news, selectedCountry, activeTab, searchQuery, selectedOutlet]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] font-mono text-xs w-full border-r border-[#333]">
      
      {/* Header / Search */}
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-bold tracking-wider">
            <Zap size={14} className="text-[#ef4444]" /> PULSE FEED
          </div>
          <div className="flex items-center gap-2 text-[#666]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff41] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff41]"></span>
            </span>
            <span className="text-[#00ff41] font-bold">LIVE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-[#333] mb-4 overflow-x-auto scrollbar-hide">
          {[
            { id: 'WIRE', icon: Hash, color: 'text-[#F72585]', label: 'NEWS' },
            { id: 'OSINT', icon: Twitter, color: 'text-[#1DA1F2]', label: 'OSINT' },
            { id: 'INTEL', icon: Shield, color: 'text-[#ef4444]', label: 'INTEL' },
            { id: 'CYBER', icon: Terminal, color: 'text-[#00ff41]', label: 'CYBER' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as NewsCategory);
                setSelectedOutlet(null); // Reset filter on tab change
              }}
              className={`flex-1 min-w-[60px] py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                activeTab === tab.id 
                  ? `bg-[#111] ${tab.color} border-b-2 border-current` 
                  : 'text-[#666] hover:text-white'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters Area */}
        <div className="space-y-2 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#666]" size={14} />
            <input 
              type="text" 
              placeholder="Search feed..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-white pl-9 pr-4 py-2 rounded-sm focus:outline-none focus:border-[#666] placeholder-[#444]"
            />
          </div>

          {/* Outlet Filter for News */}
          {activeTab === 'WIRE' && outlets.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setSelectedOutlet(null)}
                className={`px-2 py-1 rounded-sm text-[9px] font-bold whitespace-nowrap border ${
                  !selectedOutlet ? 'bg-[#333] text-white border-[#666]' : 'bg-[#111] text-[#666] border-[#333]'
                }`}
              >
                ALL
              </button>
              {outlets.map(outlet => (
                <button
                  key={outlet}
                  onClick={() => setSelectedOutlet(outlet === selectedOutlet ? null : outlet)}
                  className={`px-2 py-1 rounded-sm text-[9px] font-bold whitespace-nowrap border ${
                    selectedOutlet === outlet ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]' : 'bg-[#111] text-[#666] border-[#333]'
                  }`}
                >
                  {outlet}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {loading ? (
          <div className="space-y-3">
             {[1,2,3].map(i => <div key={i} className="h-20 bg-[#111] animate-pulse rounded-sm border border-[#333]"></div>)}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">NO DATA FOUND</div>
        ) : (
          filteredData.map((item, idx) => {
            const isOsint = activeTab === 'OSINT';
            
            return (
              <div key={`${idx}-${item.id}`} className={`group border border-[#333] bg-[#0f0f0f] hover:border-[#666] transition-all p-3 rounded-sm relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500 ${isOsint ? 'border-l-4 border-l-[#1DA1F2]' : ''}`}>
                
                {/* Severity Stripe for Intel/Wire */}
                {!isOsint && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.priority === 'CRITICAL' ? 'bg-[#ef4444]' : 
                    item.priority === 'HIGH' ? 'bg-[#f97316]' : 'bg-[#00ff41]'
                  }`}></div>
                )}

                <div className={!isOsint ? "pl-3" : ""}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {isOsint ? (
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                             <Twitter size={12} fill="white" />
                           </div>
                           <div className="flex flex-col">
                             <span className="text-white font-bold text-[10px] flex items-center gap-1">
                               {item.author || item.source} <CheckCircle2 size={10} className="text-[#1DA1F2]" fill="black" />
                             </span>
                             <span className="text-[#666] text-[9px] flex items-center gap-1">
                               {item.source} • <Rss size={8} />
                             </span>
                           </div>
                        </div>
                      ) : (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm border ${
                          activeTab === 'INTEL' ? 'bg-[#333] text-[#999] border-[#444]' :
                          'bg-[#111] text-[#00ff41] border-[#00ff41]/30'
                        }`}>
                          {item.source || 'UNKNOWN'}
                        </span>
                      )}
                    </div>
                    <span className="text-[#666] text-[10px] whitespace-nowrap ml-2">{getTimeAgo(item.timestamp)}</span>
                  </div>

                  <h3 className={`font-bold mb-2 leading-snug group-hover:text-white transition-colors text-[11px] ${isOsint ? 'text-gray-300 font-normal' : 'text-gray-200'}`}>
                    {item.title}
                  </h3>
                  
                  {/* Footer Actions / Tags */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#222] mt-2">
                    <div className="flex items-center gap-2">
                      {activeTab === 'INTEL' && (
                        <div className="flex items-center gap-1 text-[#00ff41] bg-[#00ff41]/10 px-1.5 py-0.5 rounded-sm border border-[#00ff41]/20">
                          <Shield size={10} />
                          <span className="text-[9px] font-bold">CONFIDENCE 85%</span>
                        </div>
                      )}
                      {isOsint && (
                         <div className="flex gap-3 text-[#666] text-[10px]">
                           <span className="hover:text-[#1DA1F2] cursor-pointer">Reply</span>
                           <span className="hover:text-[#00ff41] cursor-pointer">Retweet</span>
                           <span className="hover:text-[#ef4444] cursor-pointer">Like</span>
                         </div>
                      )}
                    </div>
                    {item.link && item.link !== '#' && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-[#666] hover:text-white">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateInput: string | number) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'UNKNOWN'; 
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'JUST NOW';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
