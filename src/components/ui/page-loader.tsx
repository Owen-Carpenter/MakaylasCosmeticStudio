"use client";

import React from 'react';
import { Search } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  subMessage?: string;
}

export function PageLoader({ 
  message = "Loading...", 
  subMessage = "Please wait while we prepare your experience" 
}: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gradient-bg">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-50" />
      
      <div className="relative w-full max-w-md backdrop-blur-sm bg-white/10 rounded-lg shadow-2xl border border-white/20 p-10">
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute -inset-[100%] opacity-20 animate-[spin_3s_linear_infinite] bg-gradient-conic from-primary via-primary/0 to-primary/70" />
        </div>
        
        <div className="relative flex flex-col items-center justify-center space-y-8">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            
            <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
            
            <div className="relative z-10 animate-bounce">
              <Search className="h-8 w-8 text-primary" />
            </div>
            
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[sweep_2s_ease-in-out_infinite]" />
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white">{message}</h2>
            <p className="text-white/70 mt-2">{subMessage}</p>
          </div>
          
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full w-1/3 animate-[wave_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes sweep {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(96px) rotate(180deg); opacity: 0; }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
} 