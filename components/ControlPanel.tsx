
import React from 'react';
import { SimulationState, SystemID } from '../types';
import { MAX_FORCE, MIN_MASS, MAX_MASS } from '../constants';

interface ControlPanelProps {
  state: SimulationState;
  onUpdateParam: (id: SystemID, param: 'force' | 'mass', value: number) => void;
  onToggleCompare: (compare: boolean) => void;
  onToggleFinishLine: (enabled: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, onUpdateParam, onToggleCompare, onToggleFinishLine }) => {
  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-6 shadow-2xl z-40">
      
      {/* Carrinho A */}
      <SystemCard 
        id={SystemID.A}
        name="Carrinho A (Laranja)"
        color="amber"
        data={state.systemA}
        showResults={state.hasStarted}
        onUpdateParam={onUpdateParam}
      />

      {/* Toggle para Carrinho B */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm">Modo Comparativo</span>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Ativar Carrinho B</span>
        </div>
        <Toggle active={state.compareMode} onClick={() => onToggleCompare(!state.compareMode)} />
      </div>

      {/* Carrinho B (Condicional) */}
      <div className={`transition-all duration-500 origin-top ${state.compareMode ? 'opacity-100 scale-100 h-auto mb-4' : 'opacity-0 scale-95 h-0 overflow-hidden'}`}>
        <SystemCard 
          id={SystemID.B}
          name="Carrinho B (Cinza)"
          color="slate"
          data={state.systemB}
          showResults={state.hasStarted}
          onUpdateParam={onUpdateParam}
        />
      </div>

      {/* Linha de Chegada Checkbox (Abaixo do B) */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="font-bold text-emerald-900 text-sm">Linha de Chegada</span>
          <span className="text-[10px] text-emerald-600 uppercase font-black tracking-tight">Desacelerar no fim</span>
        </div>
        <Toggle active={state.finishLineEnabled} onClick={() => onToggleFinishLine(!state.finishLineEnabled)} color="green" />
      </div>

      {state.finishLineEnabled && state.hasStarted && (
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Cronômetro de Chegada</p>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tempo A:</span>
              <span className="font-bold text-white">{state.systemA.finishTime ? `${state.systemA.finishTime.toFixed(3)}s` : 'Correndo...'}</span>
            </div>
            {state.compareMode && (
              <div className="flex justify-between">
                <span className="text-slate-400">Tempo B:</span>
                <span className="font-bold text-white">{state.systemB.finishTime ? `${state.systemB.finishTime.toFixed(3)}s` : 'Correndo...'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

const Toggle: React.FC<{ active: boolean, onClick: () => void, color?: string }> = ({ active, onClick, color = 'blue' }) => (
  <button 
    onClick={onClick}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${active ? (color === 'green' ? 'bg-emerald-500' : 'bg-blue-600') : 'bg-slate-300'}`}
  >
    <span className={`${active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
  </button>
);

interface SystemCardProps {
  id: SystemID;
  name: string;
  color: 'amber' | 'slate';
  data: any;
  showResults: boolean;
  onUpdateParam: (id: SystemID, param: 'force' | 'mass', value: number) => void;
}

const SystemCard: React.FC<SystemCardProps> = ({ id, name, color, data, showResults, onUpdateParam }) => {
  const accentClass = color === 'amber' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-50 border-slate-200';
  const sliderClass = color === 'amber' ? 'accent-amber-500' : 'accent-slate-600';

  const handleChangeForce = (val: string) => {
    const num = parseFloat(val) || 0;
    onUpdateParam(id, 'force', Math.min(MAX_FORCE, Math.max(0, num)));
  };

  const handleChangeMass = (val: string) => {
    const num = parseFloat(val) || 0;
    onUpdateParam(id, 'mass', Math.min(MAX_MASS, Math.max(MIN_MASS, num)));
  };

  return (
    <div className={`rounded-2xl border-2 p-5 bg-white shadow-sm transition-all hover:shadow-md ${accentClass}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-[11px] uppercase tracking-wider">{name}</h3>
        {showResults && (
            <div className="bg-white border-2 border-inherit px-2 py-0.5 rounded-lg text-xs font-black tabular-nums shadow-sm">
               {data.acceleration.toFixed(2)} <span className="text-[9px]">m/s²</span>
            </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="group">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Força (N)</label>
            <input 
              type="number" 
              value={data.force}
              onChange={(e) => handleChangeForce(e.target.value)}
              className="w-16 px-1.5 py-0.5 border rounded bg-white text-xs font-bold text-right text-slate-700 outline-none focus:ring-1 ring-blue-500 transition-all"
            />
          </div>
          <input 
            type="range" 
            min="0" 
            max={MAX_FORCE} 
            value={data.force}
            onChange={(e) => onUpdateParam(id, 'force', parseFloat(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 ${sliderClass}`}
          />
        </div>

        <div className="group">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Massa (kg)</label>
            <input 
              type="number" 
              value={data.mass}
              onChange={(e) => handleChangeMass(e.target.value)}
              className="w-16 px-1.5 py-0.5 border rounded bg-white text-xs font-bold text-right text-slate-700 outline-none focus:ring-1 ring-blue-500 transition-all"
            />
          </div>
          <input 
            type="range" 
            min={MIN_MASS} 
            max={MAX_MASS} 
            step="0.5"
            value={data.mass}
            onChange={(e) => onUpdateParam(id, 'mass', parseFloat(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 ${sliderClass}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
