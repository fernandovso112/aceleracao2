
export interface SystemState {
  force: number;
  mass: number;
  acceleration: number;
  velocity: number;
  position: number;
  finishTime: number | null;
  crossed: boolean;
}

export interface SimulationState {
  active: boolean;
  hasStarted: boolean;
  compareMode: boolean;
  finishLineEnabled: boolean;
  finishLineDistance: number;
  time: number;
  systemA: SystemState;
  systemB: SystemState;
}

export enum SystemID {
  A = 'systemA',
  B = 'systemB'
}
