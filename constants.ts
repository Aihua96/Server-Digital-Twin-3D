
import { HardwareComponent } from './types';

export const INITIAL_HARDWARE_STATE: HardwareComponent[] = [
  {
    id: 'cpu-0',
    name: 'AMD 锐龙高性能处理器',
    type: 'CPU',
    specs: '16 核心 / 32 线程',
    health: 98,
    temperature: 42,
    load: 15
  },
  {
    id: 'gpu-0',
    name: 'NVIDIA iGame 旗舰显卡',
    type: 'GPU',
    specs: '24GB GDDR6X 显存',
    health: 95,
    temperature: 55,
    load: 32
  },
  {
    id: 'ram-0',
    name: 'DDR4 高速内存',
    type: 'RAM',
    specs: '64GB (4x16GB) 3600MHz',
    health: 100,
    temperature: 38,
    load: 45
  },
  {
    id: 'psu-0',
    name: '长城 1200W 白金电源',
    type: 'PSU',
    specs: '1200W 80+ Platinum 全模组',
    health: 99,
    temperature: 35,
    load: 25
  },
  {
    id: 'disk-0',
    name: '华为 NVMe 固态硬盘',
    type: 'DISK',
    specs: '4TB Gen4 NVMe',
    health: 92,
    temperature: 40,
    load: 8
  }
];

export const COLORS = {
  primary: '#3b82f6',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  accent: '#a855f7',
  bg: '#f8fafc'
};
