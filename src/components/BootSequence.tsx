import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Globe, Cpu, Terminal } from 'lucide-react';

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  
  const BOOT_LOGS = [
    "INITIALIZING KERNEL...",
    "LOADING GEOSPATIAL MODULES...",
    "CONNECTING TO SATELLITE UPLINK [SAT-4]...",
    "ESTABLISHING SECURE HANDSHAKE...",
    "DECRYPTING DATA STREAMS...",
    "SYNCING GLOBAL ASSETS...",
    "ACCESS GRANTED."
  ];

  useEffect(() => {
    let delay = 0;
    BOOT_LOGS.forEach((log, index) => {
      delay += Math.random() * 500 + 200;
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === BOOT_LOGS.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, delay);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-[#48CAE4] font-mono flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Globe className="h-12 w-12 animate-pulse text-[#E63946]" />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white">GLOBAL SITUATION MONITOR</h1>
            <div className="text-xs text-[#6B7A8D]">CLASSIFIED OPS TERMINAL v2.4</div>
          </div>
        </div>

        <div className="border border-[#1C2333] bg-[#0D1117] p-4 rounded h-64 overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-10 pointer-events-none"></div>
          <div className="flex flex-col gap-1">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs"
              >
                <span className="text-[#6B7A8D] mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span className={i === logs.length - 1 ? "text-[#E63946] font-bold" : "text-[#48CAE4]"}>
                  {log}
                </span>
              </motion.div>
            ))}
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-[#E63946] mt-1"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-between text-[10px] text-[#6B7A8D]">
          <span>SYSTEM: ONLINE</span>
          <span>ENCRYPTION: AES-256</span>
          <span>MADE BY HITS</span>
        </div>
      </div>
    </div>
  );
}
