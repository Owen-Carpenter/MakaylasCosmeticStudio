"use client";

import React from 'react';

export default function SimpleCosmeticDisplay() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Cosmetic Bottle */}
        <div className="flex flex-col items-center group animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-primary/30">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/90 text-center">Serum Bottle</span>
        </div>

        {/* Makeup Compact */}
        <div className="flex flex-col items-center group animate-pulse delay-300">
          <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-accent/30">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/90 text-center">Compact Mirror</span>
        </div>

        {/* Lipstick */}
        <div className="flex flex-col items-center group animate-pulse delay-500">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-primary/30">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/90 text-center">Lipstick</span>
        </div>

        {/* Brush Set */}
        <div className="flex flex-col items-center group animate-pulse delay-700">
          <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-accent/30">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 18v2m8-10h2m-2 4h2m-2-8h2m-2-4h2" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/90 text-center">Brush Set</span>
        </div>
      </div>
    </div>
  );
} 