import React from 'react';

export default function ProjectSuspended() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#ededed] font-sans antialiased selection:bg-white/20">
      <div className="max-w-md w-full px-6 text-center flex flex-col items-center">
        {/* Kichik status teksti */}
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-500 mb-4">
          Status Notice
        </span>
        
        {/* Asosiy sarlavha */}
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-6">
          Project Suspended
        </h1>
        
        {/* Minimalistik ajratuvchi chiziq */}
        <div className="w-10 h-[1px] bg-neutral-800 mb-6" />
        
        {/* Qo'shimcha ma'lumot */}
        <p className="text-sm text-neutral-400 font-light leading-relaxed">
          This application has been temporarily paused. <br />
          Please contact the system administrator for further details.
        </p>
      </div>
    </div>
  );
}