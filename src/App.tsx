import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalMap from './components/GlobalMap';
import NewsPanel from './components/NewsPanel';
import RightPanel from './components/RightPanel';
import Header from './components/Header';
import BootSequence from './components/BootSequence';
import NotFound from './components/NotFound';
import DashboardIntro from './components/DashboardIntro';
import NewsTicker from './components/NewsTicker'; // Import Real Ticker
import { TimeRange } from './hooks/useUSGS';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open for desktop
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true); // Default open for desktop
  const [booting, setBooting] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // New Country Filter State

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Responsive defaults
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsRightPanelOpen(false);
      } else {
        setIsSidebarOpen(true);
        setIsRightPanelOpen(true);
      }
    };
    
    // Set initial state based on width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (booting) {
    return <BootSequence onComplete={() => setBooting(false)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#050505] text-white font-mono selection:bg-[#ef4444] selection:text-black">
      <DashboardIntro />
      
      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isRightPanelOpen={isRightPanelOpen}
        setIsRightPanelOpen={setIsRightPanelOpen}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        currentTime={currentTime}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
      />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT PANEL - NEWS FEED */}
        <aside className={`
          absolute lg:relative z-40 h-full w-80 flex-shrink-0 transition-transform duration-300 ease-in-out border-r border-[#333] bg-[#0a0a0a]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}
        `}>
          <NewsPanel timeRange={timeRange} selectedCountry={selectedCountry} />
        </aside>

        {/* CENTER - MAP */}
        <main className="flex-1 relative bg-black overflow-hidden flex flex-col">
          <div className="flex-1 relative">
             <GlobalMap timeRange={timeRange} selectedCountry={selectedCountry} />
             
             {/* Overlay Grid Lines */}
             <div className="absolute inset-0 pointer-events-none z-10 opacity-10" 
                  style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>
          </div>

          {/* Real Live Ticker at Bottom */}
          <div className="z-30 w-full">
            <NewsTicker />
          </div>
        </main>

        {/* RIGHT PANEL - STATS */}
        <aside className={`
          absolute right-0 lg:relative z-40 h-full w-80 flex-shrink-0 transition-transform duration-300 ease-in-out border-l border-[#333] bg-[#0a0a0a]
          ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
        `}>
          <RightPanel selectedCountry={selectedCountry} />
        </aside>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
