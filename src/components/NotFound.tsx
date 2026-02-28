import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center text-center p-4 font-mono">
      <div className="mb-8 relative">
        <AlertTriangle size={64} className="text-[#ef4444] animate-pulse" />
        <div className="absolute inset-0 bg-[#ef4444] blur-2xl opacity-20"></div>
      </div>
      
      <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">404</h1>
      <h2 className="text-xl text-[#ef4444] font-bold tracking-widest mb-8">SIGNAL LOST</h2>
      
      <div className="max-w-md text-gray-400 mb-8 text-xs leading-relaxed border border-[#333] p-4 bg-[#0a0a0a] rounded">
        <p className="mb-2">ERROR: TARGET COORDINATES NOT FOUND.</p>
        <p className="mb-2">THE REQUESTED SECTOR DOES NOT EXIST OR HAS BEEN REDACTED.</p>
        <p>INITIATING RETURN PROTOCOL...</p>
      </div>

      <Link 
        to="/" 
        className="flex items-center gap-2 bg-[#ef4444] text-black px-6 py-2 rounded font-bold hover:bg-[#ef4444]/80 transition-colors"
      >
        <Home size={16} /> RETURN TO DASHBOARD
      </Link>
    </div>
  );
}
