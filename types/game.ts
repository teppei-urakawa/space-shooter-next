export interface ShipColor {
  id: string;
  label: string;
  hex: string;
  glow: string;
}

export interface AlienTypeDef {
  id: string;
  label: string;
  score: number;
  hp: number;
  w: number;
  h: number;
  color: string;
  glow: string;
  speedBase: number;
}

export interface ActiveItems {
  twin: number;
  spread: number;
  rapid: number;
  shield: boolean;
  laser: number;
  freeze: number;
}

export interface Player {
  x: number;
  y: number;
  targetX: number;
  w: number;
  h: number;
  color: string;
  glow: string;
  invincible: number;
  shootCooldown: number;
  activeItems: ActiveItems;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hit?: boolean;
  homing?: boolean;
  target?: Alien;
  dmg?: number;
  trail?: { x: number; y: number }[];
}

export interface AlienBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  hit?: boolean;
}

export interface Alien {
  type: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  score: number;
  color: string;
  glow: string;
  label: string;
  speed: number;
  phase: number;
  angle: number;
  shootTimer: number;
  bossPhase: number;
  yPhase: number;
  spiralAngle: number;
  dead?: boolean;
}

export interface PowerupItem {
  x: number;
  y: number;
  type: string;
  color: string;
  glow: string;
  label: string;
  duration: number;
  speed: number;
  angle: number;
}

export interface ScreenFlash {
  alpha: number;
  color: string;
  decay: number;
}

export interface BossWarning {
  text: string;
  frames: number;
  color: string;
}

export interface DiffConfig {
  spawnRate: number;
  speedMult: number;
}

export interface HudState {
  score: number;
  level: number;
  lives: number;
  activeItems: ActiveItems;
}

export type Screen = 'title' | 'color' | 'difficulty' | 'game' | 'ranking' | 'auth';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GlobalRankRecord {
  id: string;
  username: string;
  score: number;
  color_hex: string;
  color_label: string;
  difficulty: string;
  played_at: string;
}
