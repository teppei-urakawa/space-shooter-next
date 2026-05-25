import type { DiffConfig } from '@/types/game';

export interface PowerupDef {
  id: string;
  label: string;
  color: string;
  glow: string;
  duration: number;
}

export const POWERUP_DEFS: PowerupDef[] = [
  { id: 'twin',    label: 'TWIN',    color: '#00f5ff', glow: '#00f5ff', duration: 900 },
  { id: 'spread',  label: 'SPREAD',  color: '#ff00ff', glow: '#ff00ff', duration: 600 },
  { id: 'rapid',   label: 'RAPID',   color: '#39ff14', glow: '#39ff14', duration: 720 },
  { id: 'shield',  label: 'SHIELD',  color: '#ffd700', glow: '#ffd700', duration: -1  },
  { id: 'laser',   label: 'LASER',   color: '#ff1155', glow: '#ff0033', duration: 600 },
  { id: 'freeze',  label: 'FREEZE',  color: '#88eeff', glow: '#44ccff', duration: 360 },
  { id: 'nova',    label: 'NOVA',    color: '#ff6600', glow: '#ff4400', duration: 0   },
  { id: 'missile', label: 'MISSILE', color: '#ff9900', glow: '#ff7700', duration: 0   },
];

export const DIFFICULTY: Record<string, DiffConfig> = {
  easy:   { spawnRate: 90,  speedMult: 0.7 },
  normal: { spawnRate: 60,  speedMult: 1.0 },
  hard:   { spawnRate: 35,  speedMult: 1.5 },
};
