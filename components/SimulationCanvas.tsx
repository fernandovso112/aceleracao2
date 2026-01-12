
import React, { useMemo } from 'react';
import { SimulationState } from '../types';
import { PIXELS_PER_METER, SCALE_FACTOR } from '../constants';

interface SimulationCanvasProps {
  state: SimulationState;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ state }) => {
  const { systemA, systemB, compareMode, finishLineEnabled, finishLineDistance } = state;

  const viewX = 180; // Margin from left (camera focus point)
  const posA_px = systemA.position * PIXELS_PER_METER * SCALE_FACTOR;
  
  // Parallax calculations
  const cloudOffset = -(posA_px * 0.05) % 2000;
  const mountainOffset = -(posA_px * 0.15) % 1600;
  const hillOffset = -(posA_px * 0.35) % 1200;
  const groundOffset = -posA_px % 100;

  // Distance markers (Mileage)
  const markers = useMemo(() => {
    const startM = Math.floor(systemA.position - 10);
    const endM = Math.floor(systemA.position + 40);
    const visibleMarkers = [];
    for (let m = Math.max(0, startM); m <= endM; m += 5) {
      visibleMarkers.push(m);
    }
    return visibleMarkers;
  }, [systemA.position]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-gradient-to-b from-sky-300 via-sky-200 to-white">
      
      {/* Background Layers (Z 1-5) */}
      <ParallaxLayer 
        svgPath="M0 50 Q 250 10 500 50 T 1000 50 L 1000 300 L 0 300 Z" 
        color="#ffffff" opacity={0.6} height="25%" offset={cloudOffset} zIndex={1} 
      />
      <ParallaxLayer 
        svgPath="M0 300 L150 100 L350 250 L550 50 L750 220 L900 120 L1100 300 Z" 
        color="#94a3b8" opacity={0.4} height="50%" offset={mountainOffset} zIndex={2} 
      />
      <ParallaxLayer 
        svgPath="M0 100 C 200 0 300 0 500 100 C 700 0 800 0 1000 100 L 1000 400 L 0 400 Z" 
        color="#86EFAC" opacity={1} height="35%" offset={hillOffset} zIndex={3} 
      />

      {/* Ground Layer (Z 10) */}
      <div 
        className="absolute bottom-0 left-0 w-[200vw] h-[20%] z-10 border-t-8 border-slate-700/20"
        style={{ 
          backgroundColor: '#5d2b0c',
          backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)`,
          backgroundSize: '100px 100%',
          transform: `translateX(${groundOffset}px)`
        }}
      />

      {/* Mileage Markers Layer (Z 11) */}
      <div className="absolute bottom-[20%] w-full h-8 z-11">
        {markers.map(m => (
          <div 
            key={m}
            className="absolute bottom-0 flex flex-col items-center transition-transform duration-75"
            style={{ transform: `translateX(${viewX + (m - systemA.position) * PIXELS_PER_METER * SCALE_FACTOR}px)` }}
          >
            <div className="w-1 h-3 bg-white/40 mb-1" />
            <span className="text-[10px] font-black text-white/60 font-mono tracking-tighter">{m}m</span>
          </div>
        ))}
      </div>

      {/* Finish Line (Z 12) */}
      {finishLineEnabled && (
        <div 
          className="absolute bottom-[20%] w-12 h-[60%] z-12 opacity-80"
          style={{ 
            transform: `translateX(${viewX + (finishLineDistance - systemA.position) * PIXELS_PER_METER * SCALE_FACTOR}px)`,
            backgroundImage: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)`,
            backgroundSize: '20px 20px'
          }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
            Chegada
          </div>
        </div>
      )}

      {/* Entity Container (Z 40) */}
      <div className="absolute inset-0 pointer-events-none z-40">
        
        {/* Origin Character: Fica no marco 0 (viewX - posA_px) */}
        <div 
          className="absolute bottom-[20%] transition-transform duration-75"
          style={{ transform: `translateX(${viewX - posA_px - 45}px)` }}
        >
          <PushingFigure force={state.hasStarted && !state.active ? 0 : systemA.force} />
        </div>

        {/* Carrinho B (Secondary): Mais fino e alto para aparecer "sobreposto" mas visível */}
        {compareMode && (
          <div 
            className="absolute bottom-[20%] transition-transform duration-75"
            style={{ 
              transform: `translateX(${viewX + (systemB.position - systemA.position) * PIXELS_PER_METER * SCALE_FACTOR}px)`,
              zIndex: 41
            }}
          >
            <Cart 
              mass={systemB.mass} 
              force={systemB.force} 
              color="#64748b" 
              label="B"
              isSecondary
            />
          </div>
        )}

        {/* Carrinho A (Primary) */}
        <div 
          className="absolute bottom-[20%] transition-transform duration-75"
          style={{ 
            transform: `translateX(${viewX}px)`,
            zIndex: 42
          }}
        >
          <Cart 
            mass={systemA.mass} 
            force={systemA.force} 
            color="#f59e0b" 
            label="A"
          />
        </div>
      </div>

      {/* Telemetry UI (Z 50) */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-50">
        <TelemetryBadge label="SISTEMA A" value={systemA.velocity} acceleration={systemA.acceleration} color="amber" crossed={systemA.crossed} />
        {compareMode && <TelemetryBadge label="SISTEMA B" value={systemB.velocity} acceleration={systemB.acceleration} color="slate" crossed={systemB.crossed} />}
      </div>
    </div>
  );
};

const ParallaxLayer: React.FC<{ svgPath: string, color: string, opacity: number, height: string, offset: number, zIndex: number }> = ({ svgPath, color, opacity, height, offset, zIndex }) => (
  <div 
    className="absolute bottom-0 left-0 w-[400vw] will-change-transform pointer-events-none"
    style={{ 
      height, zIndex, transform: `translateX(${offset}px)`, opacity,
      backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 300" xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}" fill="${encodeURIComponent(color)}"/></svg>')`,
      backgroundRepeat: 'repeat-x', backgroundSize: '1000px 100%'
    }}
  />
);

const Cart: React.FC<{ mass: number, force: number, color: string, label: string, isSecondary?: boolean }> = ({ mass, force, color, label, isSecondary }) => {
  // Ajuste de dimensões: Mais fino e alto se for o secundário para ambos serem vistos
  const baseWidth = 45 + Math.log10(mass) * 30;
  const width = isSecondary ? baseWidth * 0.7 : baseWidth;
  const height = isSecondary ? 55 : 45;

  return (
    <div className="flex flex-col items-center">
      {/* Label identificador fixo, sem velocidade flutuante */}
      <div className={`mb-1 px-2 py-0.5 rounded text-[10px] font-black text-white shadow-sm ${isSecondary ? 'bg-slate-500' : 'bg-amber-600'}`}>
        {label}
      </div>

      <div 
        className="relative rounded-t-lg shadow-xl flex items-center justify-center border-x-2 border-t-2 border-black/20"
        style={{ 
          width: width + 'px', 
          height: height + 'px', 
          backgroundColor: color,
          opacity: isSecondary ? 0.9 : 1,
          borderBottomWidth: '4px',
          borderColor: 'rgba(0,0,0,0.3)'
        }}
      >
        <span className="text-white font-black text-xs drop-shadow-md select-none">{mass}kg</span>

        {/* Vetor de Força (Seta Vermelha) - Sempre visível se houver força */}
        {force > 0 && (
          <div 
            className="absolute -left-1 top-1/2 -translate-y-1/2 flex items-center justify-end"
            style={{ width: (20 + force * 0.8) + 'px', transform: 'translateX(-100%)' }}
          >
            <div className="h-1.5 bg-red-600 w-full relative shadow-sm">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-red-600" />
              <span className="absolute -top-4 right-0 text-[9px] font-black text-red-700 whitespace-nowrap">{force}N</span>
            </div>
          </div>
        )}

        {/* Rodas - Simplificadas e fixas no eixo do chão */}
        <div className="absolute -bottom-2 left-1 w-3.5 h-3.5 bg-slate-900 rounded-full border border-slate-400" />
        <div className="absolute -bottom-2 right-1 w-3.5 h-3.5 bg-slate-900 rounded-full border border-slate-400" />
      </div>
    </div>
  );
};

const PushingFigure: React.FC<{ force: number }> = ({ force }) => (
    <div className="relative pointer-events-none opacity-90 transition-all duration-300">
        <svg viewBox="0 0 40 80" width="45" height="80">
            <circle cx="20" cy="15" r="8" fill="#1e293b" />
            <path d="M20 23 v30" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            {/* Braços: mais esticados se estiver empurrando */}
            <path d={`M20 30 L42 ${force > 0 ? 30 : 45}`} stroke="#1e293b" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M20 53 L10 78" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            <path d="M20 53 L30 78" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
        </svg>
    </div>
);

const TelemetryBadge: React.FC<{ label: string, value: number, acceleration: number, color: 'amber' | 'slate', crossed?: boolean }> = ({ label, value, acceleration, color, crossed }) => (
    <div className={`flex flex-col p-3 rounded-2xl border-2 backdrop-blur-md shadow-lg transition-all min-w-[140px] ${
        crossed ? 'bg-emerald-600 border-emerald-400 text-white' : 
        color === 'amber' ? 'bg-amber-500/90 border-amber-400 text-white' : 'bg-slate-700/90 border-slate-600 text-slate-100'
    }`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-black tracking-widest uppercase opacity-80 leading-none">{label}</span>
          {crossed && <span className="text-[8px] bg-white/20 px-1 rounded font-bold uppercase">CHEGOU!</span>}
        </div>
        <div className="text-xl font-mono font-black tabular-nums leading-none">
            {value.toFixed(1)} <span className="text-[10px] font-normal opacity-70">m/s</span>
        </div>
        <div className="mt-1 text-[9px] font-bold opacity-60">
            Aceleração: {acceleration.toFixed(2)} m/s²
        </div>
    </div>
);

export default SimulationCanvas;
