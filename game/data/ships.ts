import type { ShipColor, AlienTypeDef } from '@/types/game';

export const SHIP_COLORS: ShipColor[] = [
  { id: 'cyan',    label: 'NOVA',    hex: '#00f5ff', glow: '#00f5ff' },
  { id: 'magenta', label: 'STORM',   hex: '#ff00ff', glow: '#ff00ff' },
  { id: 'gold',    label: 'SOLAR',   hex: '#ffd700', glow: '#ffd700' },
  { id: 'lime',    label: 'VENOM',   hex: '#39ff14', glow: '#39ff14' },
  { id: 'orange',  label: 'BLAZE',   hex: '#ff6600', glow: '#ff6600' },
  { id: 'white',   label: 'GHOST',   hex: '#e8f0ff', glow: '#ffffff' },
];

export const ALIEN_TYPES: AlienTypeDef[] = [
  { id: 'drone',     label: 'DRONE',          score: 10,   hp: 1,  w: 28, h: 24, color: '#ff4466', glow: '#ff0033', speedBase: 1.5 },
  { id: 'zigzag',    label: 'ZIGZAG',          score: 30,   hp: 2,  w: 34, h: 28, color: '#aa44ff', glow: '#8800ff', speedBase: 1.0 },
  { id: 'bomber',    label: 'BOMBER',          score: 50,   hp: 4,  w: 44, h: 36, color: '#ff8800', glow: '#ff4400', speedBase: 0.6 },
  { id: 'spinner',   label: 'SPINNER',         score: 70,   hp: 3,  w: 30, h: 30, color: '#00ffaa', glow: '#00cc88', speedBase: 1.2 },
  { id: 'boss_easy', label: 'JELLYFISH QUEEN', score: 500,  hp: 18, w: 80, h: 70, color: '#5599ff', glow: '#3377ff', speedBase: 0.5 },
  { id: 'boss',      label: 'SKULL FORTRESS',  score: 1000, hp: 25, w: 70, h: 60, color: '#ffdd00', glow: '#ffaa00', speedBase: 0.8 },
  { id: 'boss_hard', label: 'OMEGA DRAGON',    score: 2000, hp: 40, w: 90, h: 80, color: '#ff2244', glow: '#ff0000', speedBase: 1.0 },
];
