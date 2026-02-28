import React from 'react';
import { Menu, Layout, Globe, Clock, User, Bell, Search, Filter } from 'lucide-react';
import { TimeRange } from '../hooks/useUSGS';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (isOpen: boolean) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  currentTime: Date;
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
}

const COUNTRIES = [
  'US', 'UK', 'RUSSIA', 'CHINA', 'IRAN', 'ISRAEL', 'UKRAINE', 'GERMANY', 'FRANCE', 'NORTH KOREA', 'INDIA', 'JAPAN', 'TAIWAN', 'AUSTRALIA', 'CANADA', 'BRAZIL'
];

export default function Header({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isRightPanelOpen, 
  setIsRightPanelOpen,
  timeRange,
  setTimeRange,
  currentTime,
  selectedCountry,
  setSelectedCountry
}: HeaderProps) {
  return (
    <header className="h-14 bg-[#0a0a0a] border-b border-[#333] flex items-center justify-between px-4 z-50 flex-shrink-0">
      
      {/* LEFT: Logo & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded hover:bg-[#333] transition-colors ${isSidebarOpen ? 'text-[#ef4444]' : 'text-gray-400'}`}
        >
          <Layout size={18} />
        </button>
        
        <div className="flex items-center gap-2 select-none">
          <Globe className="text-[#ef4444] animate-pulse" size={20} />
          <h1 className="text-xl font-bold tracking-tighter">
            <span className="text-white">CONFLICT</span>
            <span className="text-[#ef4444]">LY</span>
          </h1>
          <span className="text-[10px] bg-[#333] text-gray-300 px-1.5 py-0.5 rounded font-mono ml-2">v2.4.0-BETA</span>
        </div>
      </div>

      {/* CENTER: Time & Filters */}
      <div className="hidden md:flex items-center gap-6">
        {/* Time Range Selector */}
        <div className="flex items-center bg-[#111] border border-[#333] rounded p-1">
          {(['1H', '24H', '7D'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                timeRange === range 
                  ? 'bg-[#ef4444] text-black' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Country Filter */}
        <div className="flex items-center bg-[#111] border border-[#333] rounded px-2 py-1 gap-2">
          <Filter size={12} className="text-gray-500" />
          <select 
            value={selectedCountry || ''} 
            onChange={(e) => setSelectedCountry(e.target.value || null)}
            className="bg-transparent text-[10px] font-bold text-gray-300 focus:outline-none uppercase cursor-pointer"
          >
            <option value="">GLOBAL VIEW</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2 text-[#ef4444] font-mono text-sm font-bold bg-[#ef4444]/10 px-3 py-1 rounded border border-[#ef4444]/20">
          <Clock size={14} />
          <span>{currentTime.toLocaleTimeString('en-US', { hour12: false })} UTC</span>
        </div>
      </div>

      {/* RIGHT: User & Panel Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full"></span>
          </button>
          <button className="bg-[#ef4444] text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-[#ef4444]/80 transition-colors flex items-center gap-2">
            <User size={14} /> SIGN IN
          </button>
        </div>

        <button 
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className={`p-2 rounded hover:bg-[#333] transition-colors ${isRightPanelOpen ? 'text-[#ef4444]' : 'text-gray-400'}`}
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
