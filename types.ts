
export interface HardwareMetric {
  label: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export interface HardwareComponent {
  id: string;
  name: string;
  type: 'CPU' | 'GPU' | 'RAM' | 'MOBO' | 'PSU' | 'FAN' | 'DISK';
  specs: string;
  health: number;
  temperature: number;
  load: number;
}

export enum ViewMode {
  NORMAL = 'Normal',
  XRAY = 'X-Ray',
  THERMAL = 'Thermal',
  WIRE = 'Wireframe'
}

export enum SceneLevel {
  DATACENTER = 'DATACENTER',
  SERVER_DETAIL = 'SERVER_DETAIL'
}
