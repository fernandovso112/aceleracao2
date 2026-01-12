
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState, SystemID, SystemState } from './types';
import { DEFAULT_FINISH_DISTANCE } from './constants';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import SimulationCanvas from './components/SimulationCanvas';

const getInitialSystemState = (force: number, mass: number): SystemState => ({
  force,
  mass,
  acceleration: force / mass,
  velocity: 0,
  position: 0,
  finishTime: null,
  crossed: false,
});

const getInitialState = (): SimulationState => ({
  active: false,
  hasStarted: false,
  compareMode: false,
  finishLineEnabled: true,
  finishLineDistance: DEFAULT_FINISH_DISTANCE,
  time: 0,
  systemA: getInitialSystemState(20, 5),
  systemB: getInitialSystemState(20, 10),
});

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>(getInitialState());
  const lastFrameRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const handleUpdateParam = (id: SystemID, param: 'force' | 'mass', value: number) => {
    setState(prev => {
      const updatedSystem = { ...prev[id], [param]: value };
      updatedSystem.acceleration = updatedSystem.force / updatedSystem.mass;
      return { ...prev, [id]: updatedSystem };
    });
  };

  const handleToggleCompare = (compare: boolean) => setState(prev => ({ ...prev, compareMode: compare }));
  const handleToggleFinishLine = (enabled: boolean) => setState(prev => ({ ...prev, finishLineEnabled: enabled }));
  
  const handleTogglePlay = () => {
    setState(prev => ({
      ...prev,
      active: !prev.active,
      hasStarted: true
    }));
  };

  const handleReset = () => {
    lastFrameRef.current = 0;
    setState(getInitialState());
  };

  const updatePhysics = (sys: SystemState, dt: number, finishLineEnabled: boolean, finishDist: number, totalTime: number): SystemState => {
    if (sys.crossed && finishLineEnabled) {
      // If crossed and finish line is on, we simulate deceleration to a stop
      const friction = 15; // braking force
      const newAcc = -friction / sys.mass;
      const newVel = Math.max(0, sys.velocity + newAcc * dt);
      const newPos = sys.position + newVel * dt;
      return { ...sys, velocity: newVel, position: newPos };
    }

    const newVel = sys.velocity + sys.acceleration * dt;
    const newPos = sys.position + newVel * dt;
    
    let crossed = sys.crossed;
    let finishTime = sys.finishTime;

    if (!crossed && newPos >= finishDist && finishLineEnabled) {
      crossed = true;
      finishTime = totalTime;
    }

    return { ...sys, velocity: newVel, position: newPos, crossed, finishTime };
  };

  const animate = useCallback((time: number) => {
    if (!lastFrameRef.current) {
      lastFrameRef.current = time;
    }

    const deltaTime = Math.min((time - lastFrameRef.current) / 1000, 0.032);
    lastFrameRef.current = time;

    setState(prev => {
      if (!prev.active) return prev;

      const newTime = prev.time + deltaTime;
      const systemA = updatePhysics(prev.systemA, deltaTime, prev.finishLineEnabled, prev.finishLineDistance, newTime);
      const systemB = prev.compareMode 
        ? updatePhysics(prev.systemB, deltaTime, prev.finishLineEnabled, prev.finishLineDistance, newTime)
        : prev.systemB;

      // Check if all active systems finished to auto-pause
      const allFinished = prev.finishLineEnabled && systemA.crossed && (!prev.compareMode || systemB.crossed) && systemA.velocity === 0 && (!prev.compareMode || systemB.velocity === 0);
      
      return { 
        ...prev, 
        time: newTime, 
        systemA, 
        systemB,
        active: allFinished ? false : prev.active 
      };
    });

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-900 text-slate-100 selection:bg-blue-500/30">
      <Header 
        time={state.time} 
        active={state.active} 
        onTogglePlay={handleTogglePlay} 
        onReset={handleReset} 
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <ControlPanel 
          state={state} 
          onUpdateParam={handleUpdateParam} 
          onToggleCompare={handleToggleCompare}
          onToggleFinishLine={handleToggleFinishLine}
        />
        
        <div className="flex-1 relative bg-sky-400">
          <SimulationCanvas state={state} />
        </div>
      </div>
    </div>
  );
};

export default App;
