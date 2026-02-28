import { useState } from 'react';
import { Maximize2, X, Circle, Radio, Globe, Tv, Video } from 'lucide-react';

interface Webcam {
  id: string;
  title: string;
  region: 'LIVE' | 'CAMS' | 'SPACE';
  youtubeId: string;
  isLiveNews?: boolean;
}

const CAMS: Webcam[] = [
  // Live News Channels (Requested)
  { id: 'news-bbc', title: 'BBC NEWS GLOBAL', region: 'LIVE', youtubeId: 'bjgQzJzCZKs', isLiveNews: true },
  { id: 'news-aljazeera', title: 'AL JAZEERA LIVE', region: 'LIVE', youtubeId: 'gCNeDWCI0vo', isLiveNews: true },
  { id: 'news-wion', title: 'WION NEWS LIVE', region: 'LIVE', youtubeId: 'ALa-IhoJaxI', isLiveNews: true },
  { id: 'cam-whitehouse', title: 'WHITE HOUSE LIVE', region: 'LIVE', youtubeId: 'Fu8vYoIkaeM', isLiveNews: true },
  { id: 'cam-israel', title: 'ISRAEL LIVE CAM', region: 'LIVE', youtubeId: 'qhhFRi8BcSU', isLiveNews: true },
  
  // Location Cams
  { id: 'cam-me', title: 'MIDDLE EAST LIVE', region: 'CAMS', youtubeId: '4E-iFtUM2kk' },
  { id: 'cam-rolling', title: 'ROLLING CAM GLOBAL', region: 'CAMS', youtubeId: 'z7SiAaN4ogw' },
  { id: 'cam-iss', title: 'ISS LIVE FEED', region: 'SPACE', youtubeId: 'vytmBNhc9ig' },
  
  // Additional Major Cities (Top 15 requested previously, keeping some for variety)
  { id: 'cam-tokyo', title: 'TOKYO SHIBUYA', region: 'CAMS', youtubeId: 'H5NqIsnyTG8' },
  { id: 'cam-nyc', title: 'NEW YORK CITY', region: 'CAMS', youtubeId: '1-iS7LArMPA' },
  { id: 'cam-london', title: 'LONDON SKYLINE', region: 'CAMS', youtubeId: '4993sBLAzGA' }, // Replaced with a reliable London cam if needed, or keep generic
  { id: 'cam-seoul', title: 'SEOUL HAN RIVER', region: 'CAMS', youtubeId: 'F109TZt3nRc' },
];

export default function WebcamGrid() {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'CAMS' | 'SPACE'>('LIVE');
  const [expandedCam, setExpandedCam] = useState<Webcam | null>(null);

  const filteredCams = CAMS.filter(c => c.region === activeTab);

  // Take first 6 to fit grid
  const displayCams = filteredCams.slice(0, 6);

  return (
    <>
      <div className="flex flex-col h-full border-t border-[var(--color-ops-border)] bg-[var(--color-ops-bg)]">
        {/* Tabs */}
        <div className="flex items-center border-b border-[var(--color-ops-border)] bg-[var(--color-ops-surface)]">
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`flex-1 py-2 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'LIVE' 
                ? 'text-[var(--color-ops-alert)] bg-[var(--color-ops-alert)]/10 border-b-2 border-[var(--color-ops-alert)]' 
                : 'text-[var(--color-ops-text-secondary)] hover:text-[var(--color-ops-text-primary)]'
            }`}
          >
            <Tv className="h-3 w-3" />
            LIVE INTEL
          </button>
          <button
            onClick={() => setActiveTab('CAMS')}
            className={`flex-1 py-2 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'CAMS' 
                ? 'text-[var(--color-ops-info)] bg-[var(--color-ops-info)]/10 border-b-2 border-[var(--color-ops-info)]' 
                : 'text-[var(--color-ops-text-secondary)] hover:text-[var(--color-ops-text-primary)]'
            }`}
          >
            <Video className="h-3 w-3" />
            SURVEILLANCE
          </button>
          <button
            onClick={() => setActiveTab('SPACE')}
            className={`flex-1 py-2 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'SPACE' 
                ? 'text-[#F72585] bg-[#F72585]/10 border-b-2 border-[#F72585]' 
                : 'text-[var(--color-ops-text-secondary)] hover:text-[var(--color-ops-text-primary)]'
            }`}
          >
            <Globe className="h-3 w-3" />
            ORBITAL
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-2 gap-px bg-[var(--color-ops-border)] overflow-hidden content-start">
          {displayCams.map((cam) => (
            <div 
              key={cam.id} 
              className="relative aspect-video bg-black group cursor-pointer overflow-hidden border border-transparent hover:border-[var(--color-ops-info)] transition-colors"
              onClick={() => setExpandedCam(cam)}
            >
              {/* YouTube Embed */}
              <div className="absolute inset-0 pointer-events-none">
                 <iframe 
                    src={`https://www.youtube.com/embed/${cam.youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1&loop=1&playlist=${cam.youtubeId}`}
                    className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity object-cover scale-150" 
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 ></iframe>
              </div>
              
              {/* Overlay Info */}
              <div className="absolute top-1 left-1 z-10 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${cam.region === 'LIVE' ? 'bg-[var(--color-ops-alert)]' : 'bg-[var(--color-ops-info)]'}`}></div>
                <span className="text-[8px] font-bold tracking-wider text-white">{cam.title}</span>
              </div>

              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Maximize2 className="h-3 w-3 text-white" />
              </div>
            </div>
          ))}
          
          {/* Fill empty slots if less than 6 */}
          {Array.from({ length: Math.max(0, 6 - displayCams.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-video bg-[var(--color-ops-bg)] flex items-center justify-center border border-[var(--color-ops-border)]/20">
              <span className="text-[9px] text-[var(--color-ops-text-secondary)] tracking-widest">OFFLINE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {expandedCam && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-md">
          <div className="relative w-full h-full max-w-7xl bg-black border border-[var(--color-ops-border)] flex flex-col shadow-2xl shadow-[var(--color-ops-alert)]/10">
            <div className="flex items-center justify-between p-3 border-b border-[var(--color-ops-border)] bg-[var(--color-ops-surface)]">
              <div className="flex items-center gap-2">
                 <Circle className="h-3 w-3 fill-[var(--color-ops-alert)] text-[var(--color-ops-alert)] animate-pulse" />
                 <span className="font-bold text-lg tracking-widest text-[#E8EDF2]">{expandedCam.title}</span>
                 <span className="text-xs text-[var(--color-ops-text-secondary)] px-2 border-l border-[var(--color-ops-border)] font-mono">
                   SECURE UPLINK ESTABLISHED // {expandedCam.region}
                 </span>
              </div>
              <button 
                onClick={() => setExpandedCam(null)}
                className="text-[var(--color-ops-text-secondary)] hover:text-[var(--color-ops-alert)] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 relative">
               <iframe 
                  src={`https://www.youtube.com/embed/${expandedCam.youtubeId}?autoplay=1&mute=0&controls=1&showinfo=0&modestbranding=1`}
                  className="w-full h-full" 
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
               ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
