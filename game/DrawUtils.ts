import { ALIEN_TYPES } from './data/ships';
import type { Alien } from '@/types/game';

export function drawPlayerShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colorHex: string,
  glowColor: string,
  scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const c = colorHex;
  const g = glowColor;

  ctx.shadowBlur  = 20;
  ctx.shadowColor = g;

  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(14, -5);
  ctx.lineTo(10, 15);
  ctx.lineTo(0, 20);
  ctx.lineTo(-10, 15);
  ctx.lineTo(-14, -5);
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, -10, 6, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle   = 'rgba(0,0,0,0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-14, -5);
  ctx.lineTo(-36, 18);
  ctx.lineTo(-24, 22);
  ctx.lineTo(-10, 10);
  ctx.closePath();
  ctx.fillStyle   = c;
  ctx.globalAlpha = 0.85;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(14, -5);
  ctx.lineTo(36, 18);
  ctx.lineTo(24, 22);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;

  const flameLen = 12 + Math.sin(Date.now() * 0.01) * 4;
  const grad     = ctx.createLinearGradient(0, 20, 0, 20 + flameLen);
  grad.addColorStop(0,   c);
  grad.addColorStop(0.5, 'rgba(255,150,0,0.8)');
  grad.addColorStop(1,   'rgba(255,50,0,0)');
  ctx.beginPath();
  ctx.moveTo(-5, 20);
  ctx.lineTo(5, 20);
  ctx.lineTo(3, 20 + flameLen);
  ctx.lineTo(0, 20 + flameLen + 4);
  ctx.lineTo(-3, 20 + flameLen);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

export function drawAlien(ctx: CanvasRenderingContext2D, alien: Alien) {
  const { type, cx, cy, angle = 0 } = alien;
  const t = ALIEN_TYPES.find(d => d.id === type);
  if (!t) return;

  ctx.save();
  ctx.translate(cx, cy);
  if (type === 'spinner') ctx.rotate(angle);

  ctx.shadowBlur  = 18;
  ctx.shadowColor = t.glow;
  ctx.strokeStyle = t.color;
  ctx.fillStyle   = t.color + '22';
  ctx.lineWidth   = 2;

  switch (type) {
    case 'drone':     _drawDrone(ctx, t);             break;
    case 'zigzag':    _drawZigzag(ctx, t);            break;
    case 'bomber':    _drawBomber(ctx, t);            break;
    case 'spinner':   _drawSpinner(ctx, t);           break;
    case 'boss_easy': _drawBossEasy(ctx, t, alien);   break;
    case 'boss':      _drawBossNormal(ctx, t, alien); break;
    case 'boss_hard': _drawBossHard(ctx, t, alien);   break;
  }

  ctx.restore();
}

function _drawDrone(ctx: CanvasRenderingContext2D, t: { color: string; glow: string }) {
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = t.color + '33';
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -4, 7, 7, 0, Math.PI, 0);
  ctx.fillStyle = t.color + '88';
  ctx.fill();
  ctx.stroke();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 7, 10);
    ctx.lineTo(i * 10, 18);
    ctx.strokeStyle = t.color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
  ctx.fillStyle   = '#fff';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur  = 6;
  [-4, 4].forEach(ex => {
    ctx.beginPath();
    ctx.arc(ex, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function _drawZigzag(ctx: CanvasRenderingContext2D, t: { color: string; glow: string }) {
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(17, 4);
  ctx.lineTo(10, 14);
  ctx.lineTo(0, 8);
  ctx.lineTo(-10, 14);
  ctx.lineTo(-17, 4);
  ctx.closePath();
  ctx.fillStyle   = t.color + '33';
  ctx.fill();
  ctx.strokeStyle = t.color;
  ctx.lineWidth   = 2;
  ctx.stroke();
  [-14, -5, 5, 14].forEach(tx => {
    ctx.beginPath();
    ctx.moveTo(tx * 0.7, 10);
    ctx.quadraticCurveTo(tx * 1.2, 18, tx * 0.9, 24);
    ctx.strokeStyle = t.color + 'aa';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  });
  ctx.fillStyle   = '#ff00ff';
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur  = 8;
  [-5, 5].forEach(ex => {
    ctx.beginPath();
    ctx.arc(ex, -2, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function _drawBomber(ctx: CanvasRenderingContext2D, t: { color: string; glow: string }) {
  const r = 22;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle   = t.color + '22';
  ctx.fill();
  ctx.strokeStyle = t.color;
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.strokeStyle = t.color + 'aa';
  ctx.lineWidth   = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fillStyle = t.color;
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 2);
    ctx.beginPath();
    ctx.rect(-2, r - 4, 4, 10);
    ctx.fillStyle = t.color + 'cc';
    ctx.fill();
    ctx.restore();
  }
}

function _drawSpinner(ctx: CanvasRenderingContext2D, t: { color: string; glow: string }) {
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(4, -5);
    ctx.lineTo(14, -2);
    ctx.lineTo(14, 2);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fillStyle   = t.color + '55';
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle   = t.color + 'aa';
  ctx.fill();
  ctx.strokeStyle = t.color;
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle   = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur  = 10;
  ctx.fill();
}

function _drawBossEasy(ctx: CanvasRenderingContext2D, t: { color: string; glow: string }, alien: Alien) {
  const phase2 = (alien.bossPhase || 1) >= 2;
  const now    = Date.now() * 0.003;

  ctx.beginPath();
  ctx.ellipse(0, -8, 36, 26, 0, Math.PI, 0);
  ctx.fillStyle   = phase2 ? t.color + '55' : t.color + '2a';
  ctx.fill();
  ctx.strokeStyle = t.color;
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  [10, 20, 30].forEach(r => {
    ctx.beginPath();
    ctx.ellipse(0, -8, r, r * 0.72, 0, Math.PI, 0);
    ctx.strokeStyle = t.color + '44';
    ctx.lineWidth   = 1;
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, -8, phase2 ? 10 : 8, 0, Math.PI * 2);
  ctx.fillStyle   = t.color + 'bb';
  ctx.shadowColor = t.glow;
  ctx.shadowBlur  = phase2 ? 25 : 14;
  ctx.fill();

  const tentCount = phase2 ? 10 : 7;
  for (let i = 0; i < tentCount; i++) {
    const fx     = (i - (tentCount - 1) / 2) * (68 / tentCount);
    const wiggle = Math.sin(now + i * 0.9) * 8;
    ctx.beginPath();
    ctx.moveTo(fx, 16);
    ctx.quadraticCurveTo(fx + wiggle, 30, fx + wiggle * 0.55, 44);
    ctx.strokeStyle = phase2 ? t.color : t.color + 'aa';
    ctx.lineWidth   = phase2 ? 2.5 : 2;
    ctx.shadowBlur  = phase2 ? 12 : 6;
    ctx.shadowColor = t.glow;
    ctx.stroke();
  }

  const eyeGlow = phase2 ? '#ffffff' : '#aaccff';
  [[-12, -12], [12, -12]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.arc(ex, ey, 8, 0, Math.PI * 2);
    ctx.fillStyle   = 'rgba(0,0,30,0.8)';
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth   = 1.5;
    ctx.shadowBlur  = 0;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, 4, 0, Math.PI * 2);
    ctx.fillStyle   = eyeGlow;
    ctx.shadowColor = eyeGlow;
    ctx.shadowBlur  = phase2 ? 16 : 8;
    ctx.fill();
  });
}

function _drawBossNormal(ctx: CanvasRenderingContext2D, t: { color: string; glow: string }, alien: Alien) {
  const phase2 = (alien.bossPhase || 1) >= 2;

  ctx.beginPath();
  ctx.ellipse(0, -5, 35, 28, 0, 0, Math.PI * 2);
  ctx.fillStyle   = phase2 ? t.color + '22' : t.color + '15';
  ctx.fill();
  ctx.strokeStyle = t.color;
  ctx.lineWidth   = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-30, 10);
  ctx.lineTo(-20, 28);
  ctx.lineTo(20, 28);
  ctx.lineTo(30, 10);
  ctx.strokeStyle = t.color + 'aa';
  ctx.lineWidth   = 2;
  ctx.stroke();

  [-32, 32].forEach(tx => {
    ctx.beginPath();
    ctx.ellipse(tx, 0, 8, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle   = t.color + '33';
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  });

  const eyeCol = phase2 ? '#ff2200' : t.glow;
  [[-12, -8], [12, -8]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.arc(ex, ey, 10, 0, Math.PI * 2);
    ctx.fillStyle   = '#330000';
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fillStyle   = eyeCol;
    ctx.shadowColor = eyeCol;
    ctx.shadowBlur  = phase2 ? 25 : 15;
    ctx.fill();
  });

  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 7, 10);
    ctx.lineTo(i * 7 - 3.5, 22);
    ctx.lineTo(i * 7 + 3.5, 22);
    ctx.closePath();
    ctx.fillStyle   = phase2 ? '#ff4400' : t.color;
    ctx.shadowBlur  = phase2 ? 10 : 0;
    ctx.shadowColor = '#ff4400';
    ctx.fill();
  }
}

function _drawBossHard(ctx: CanvasRenderingContext2D, t: { color: string; glow: string }, alien: Alien) {
  const bossPhase = alien.bossPhase || 1;
  const phase2    = bossPhase >= 2;
  const berserk   = bossPhase >= 3;
  const now       = Date.now() * 0.005;

  ctx.beginPath();
  ctx.ellipse(0, 2, 42, 36, 0, 0, Math.PI * 2);
  ctx.fillStyle   = berserk ? '#3a0000' : '#1a0000';
  ctx.fill();
  ctx.strokeStyle = berserk ? '#ff4400' : t.color;
  ctx.lineWidth   = 3;
  ctx.shadowBlur  = berserk ? 35 : 18;
  ctx.shadowColor = berserk ? '#ff2200' : t.glow;
  ctx.stroke();

  for (let row = -2; row <= 1; row++) {
    for (let col = -2; col <= 2; col++) {
      const sx = col * 16 + (row % 2) * 8;
      const sy = row * 14;
      if (sx * sx * 0.6 + sy * sy > 1600) continue;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 6);
      ctx.lineTo(sx + 7, sy);
      ctx.lineTo(sx, sy + 6);
      ctx.lineTo(sx - 7, sy);
      ctx.closePath();
      ctx.strokeStyle = phase2 ? t.color + '99' : t.color + '44';
      ctx.lineWidth   = 0.8;
      ctx.shadowBlur  = 0;
      ctx.stroke();
    }
  }

  [-22, 22].forEach(hx => {
    ctx.beginPath();
    ctx.moveTo(hx, -30);
    ctx.lineTo(hx - Math.sign(hx) * 8,  -52);
    ctx.lineTo(hx + Math.sign(hx) * 6,  -64);
    ctx.lineTo(hx + Math.sign(hx) * 14, -48);
    ctx.lineTo(hx + Math.sign(hx) * 4,  -30);
    ctx.closePath();
    ctx.fillStyle   = berserk ? '#ff2200' : '#880011';
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth   = 1.5;
    ctx.shadowBlur  = berserk ? 15 : 0;
    ctx.stroke();
  });

  const eyeGlow = berserk ? '#ffffff' : phase2 ? '#ffaa00' : t.glow;
  [[-16, -8], [16, -8]].forEach(([ex, ey]) => {
    ctx.beginPath();
    ctx.arc(ex, ey, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#200000';
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(ex, ey, 4, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle   = eyeGlow;
    ctx.shadowColor = eyeGlow;
    ctx.shadowBlur  = berserk ? 28 : 15;
    ctx.fill();
  });

  ctx.beginPath();
  ctx.moveTo(-30, 22);
  ctx.quadraticCurveTo(0, 42, 30, 22);
  ctx.strokeStyle = t.color;
  ctx.lineWidth   = 2;
  ctx.shadowBlur  = 6;
  ctx.shadowColor = t.color;
  ctx.stroke();
  [-22, -8, 8, 22].forEach(tx => {
    ctx.beginPath();
    ctx.moveTo(tx, 24);
    ctx.lineTo(tx - 4, 38);
    ctx.lineTo(tx + 4, 38);
    ctx.closePath();
    ctx.fillStyle   = berserk ? '#ffaaaa' : '#ffffff';
    ctx.shadowColor = berserk ? '#ff4400' : '#cccccc';
    ctx.shadowBlur  = berserk ? 14 : 4;
    ctx.fill();
  });

  ctx.font          = 'bold 22px serif';
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillStyle     = berserk ? '#ffffff' : t.color;
  ctx.shadowColor   = berserk ? '#ffffff' : t.glow;
  ctx.shadowBlur    = berserk ? 15 + Math.sin(now * 4) * 12 : 12;
  ctx.fillText('Ω', 0, -22);

  if (berserk) {
    ctx.beginPath();
    ctx.arc(0, 0, 52 + Math.sin(now * 5) * 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff3300';
    ctx.lineWidth   = 2;
    ctx.globalAlpha = 0.3 + Math.sin(now * 6) * 0.15;
    ctx.shadowBlur  = 20;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
