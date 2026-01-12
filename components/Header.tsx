
import React from 'react';

interface HeaderProps {
  time: number;
  active: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ time, active, onTogglePlay, onReset }) => {
  return (
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-50 shrink-0">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic uppercase leading-none select-none">
          Newton<span className="text-blue-600">Lab</span>
        </h1>
        <span className="text-blue-500 font-formula text-[10px] md:text-xs font-bold tracking-widest mt-1 opacity-80">Fr = m · a</span>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden xs:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 md:px-4 py-1.5 rounded-2xl shadow-inner">
          <span className="text-slate-400 text-sm md:text-lg">⏱️</span>
          <span className="text-sm md:text-xl font-mono font-bold text-slate-700 tabular-nums">
            {time.toFixed(2)}<span className="text-[10px] md:text-xs ml-0.5 opacity-50 font-sans">s</span>
          </span>
        </div>

        <button 
          onClick={onTogglePlay}
          className={`flex items-center justify-center gap-2 px-4 md:px-10 py-2.5 rounded-full font-bold text-xs md:text-lg transition-all active:scale-95 shadow-lg min-w-[100px] md:min-w-[160px] ${
            active 
            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          {active ? (
            <><span className="text-sm md:text-lg">⏸️</span> Pausar</>
          ) : (
            <><span className="text-sm md:text-lg">▶️</span> {time > 0 ? 'Retomar' : 'Iniciar'}</>
          )}
        </button>

        <button 
          onClick={onReset}
          className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2.5 rounded-full transition-all active:rotate-180 hover:rotate-12 flex items-center justify-center border border-slate-200 group"
          title="Resetar Simulação"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="group-active:scale-90 transition-transform"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
