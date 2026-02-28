import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Shield, Globe, Radio, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardIntro() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('ops_intro_seen');
    if (!hasSeenIntro) {
      setVisible(true);
    }
  }, []);

  const handleSkip = () => {
    setVisible(false);
    localStorage.setItem('ops_intro_seen', 'true');
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSkip();
    }
  };

  const steps = [
    {
      title: "WELCOME TO OVERWATCH",
      desc: "Global situational awareness dashboard. Monitor real-time threats, air traffic, and satellite telemetry.",
      icon: <Shield size={48} className="text-[#00ff41]" />
    },
    {
      title: "LIVE INTEL FEED",
      desc: "AI-filtered conflict reports and breaking news from around the globe. Critical threats are highlighted in RED.",
      icon: <Activity size={48} className="text-[#00ff41]" />
    },
    {
      title: "ASSET TRACKING",
      desc: "Track commercial and military flights, naval vessels, and orbital assets in real-time.",
      icon: <Globe size={48} className="text-[#00ff41]" />
    },
    {
      title: "CUSTOMIZE LAYERS",
      desc: "Toggle data layers to focus on specific threats. Use the controls on the bottom left.",
      icon: <Radio size={48} className="text-[#00ff41]" />
    }
  ];

  if (!visible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-lg bg-[#0a0a0a] border border-[#00ff41]/30 rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.1)] overflow-hidden relative"
        >
          {/* Scanline */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-10"></div>

          <div className="p-8 flex flex-col items-center text-center relative z-10">
            <div className="mb-6 p-4 bg-[#00ff41]/5 rounded-full border border-[#00ff41]/20 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
              {steps[step].icon}
            </div>
            
            <h2 className="text-2xl font-mono font-bold text-white mb-2 tracking-wider">
              {steps[step].title}
            </h2>
            
            <p className="text-[#a0a0a0] font-mono text-sm mb-8 leading-relaxed">
              {steps[step].desc}
            </p>

            <div className="flex w-full gap-4">
              <button 
                onClick={handleSkip}
                className="flex-1 py-3 px-4 rounded border border-[#333] text-[#666] font-mono text-xs hover:bg-white/5 transition-colors"
              >
                SKIP BRIEFING
              </button>
              <button 
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded bg-[#00ff41]/10 border border-[#00ff41]/50 text-[#00ff41] font-mono text-xs font-bold hover:bg-[#00ff41]/20 transition-colors flex items-center justify-center gap-2"
              >
                {step === steps.length - 1 ? 'INITIALIZE' : 'NEXT'} <ChevronRight size={14} />
              </button>
            </div>

            {/* Progress Dots */}
            <div className="flex gap-2 mt-6">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-[#00ff41]' : 'bg-[#333]'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
