import React from 'react';
import { useNewsAPI } from '../hooks/useNewsAPI';

export default function NewsTicker() {
  const { news } = useNewsAPI('WIRE', '24H');

  // Take top 10 headlines
  const headlines = news.slice(0, 10);
  
  // Create a content block to render
  const Content = () => (
    <>
      {headlines.length > 0 ? (
        headlines.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-shrink-0 mx-4">
            <span className="text-[#ef4444] font-bold uppercase text-[10px]">{item.source}:</span>
            <span className="text-gray-300 text-[10px] font-mono uppercase">{item.title}</span>
            <span className="text-[#333] mx-2">///</span>
          </div>
        ))
      ) : (
        <div className="flex items-center gap-8 flex-shrink-0 mx-4">
          <span className="text-[#00ff41] text-[10px] font-mono">INITIALIZING GLOBAL NEWS FEED...</span>
          <span className="text-[#333]">///</span>
          <span className="text-[#eab308] text-[10px] font-mono">ESTABLISHING SATELLITE UPLINK...</span>
        </div>
      )}
    </>
  );

  return (
    <footer className="h-8 bg-[#0a0a0a] border-t border-[#333] flex items-center overflow-hidden whitespace-nowrap z-50 relative">
      <div className="flex animate-marquee">
        <Content />
        <Content />
      </div>
    </footer>
  );
}
