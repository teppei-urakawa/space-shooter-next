import { drawPlayerShip, drawAlien } from './DrawUtils';
import type { Player, Bullet, AlienBullet, Alien, PowerupItem, ScreenFlash, BossWarning } from '@/types/game';
import type { StarField } from './models/StarField';
import type { Particle } from './models/Particle';

export interface RenderState {
  player: Player;
  bullets: Bullet[];
  alienBullets: AlienBullet[];
  aliens: Alien[];
  particles: Particle[];
  powerupItems: PowerupItem[];
  starField: StarField;
  frameCount: number;
  screenFlash: ScreenFlash;
  bossWarning: BossWarning;
}

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d')!;
  }

  render(state: RenderState) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    state.starField.draw(ctx);

    const frozen = state.player.activeItems.freeze > 0;
    state.aliens.forEach(a => {
      drawAlien(ctx, a);
      if (a.maxHp > 1) this._drawHpBar(a);
      if (frozen)      this._drawFreezeOverlay(a, state.frameCount);
    });

    this._drawBossHpBar(state);

    state.powerupItems.forEach(item => this._drawPowerupItem(item));

    const showPlayer = state.player.invincible === 0 || Math.floor(state.player.invincible / 8) % 2 === 0;
    if (showPlayer && state.player.activeItems.laser > 0) this._drawLaserBeam(state.player);

    state.bullets.forEach(b => {
      if (b.homing) {
        this._drawMissile(b);
      } else {
        ctx.save();
        ctx.shadowBlur  = 14;
        ctx.shadowColor = state.player.glow;
        if (b.vx === 0) {
          const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + 18);
          grad.addColorStop(0, state.player.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(b.x - 2, b.y, 4, 18);
        } else {
          ctx.fillStyle = state.player.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    state.alienBullets.forEach(b => {
      ctx.save();
      ctx.shadowBlur  = 10;
      ctx.shadowColor = b.color;
      ctx.fillStyle   = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (showPlayer) {
      if (state.player.activeItems.twin > 0) {
        ctx.save();
        ctx.globalAlpha = 0.75;
        drawPlayerShip(ctx, state.player.x - 55, state.player.y - 8, state.player.color, state.player.glow, 0.65);
        drawPlayerShip(ctx, state.player.x + 55, state.player.y - 8, state.player.color, state.player.glow, 0.65);
        ctx.restore();
      }
      if (state.player.activeItems.shield) {
        ctx.save();
        ctx.strokeStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur  = 24;
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(state.frameCount * 0.12);
        ctx.beginPath();
        ctx.ellipse(state.player.x, state.player.y - 5, 52, 57, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      drawPlayerShip(ctx, state.player.x, state.player.y, state.player.color, state.player.glow);
    }

    state.particles.forEach(p => p.draw(ctx));

    if (state.bossWarning.frames > 0) this._drawBossWarning(state);

    if (state.screenFlash.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = state.screenFlash.alpha;
      ctx.fillStyle   = state.screenFlash.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  private _drawBossHpBar(state: RenderState) {
    const { ctx, canvas } = this;
    const boss = state.aliens.find(a => a.type.startsWith('boss'));
    if (!boss) return;

    const bw = Math.min(canvas.width * 0.6, 520);
    const bx = (canvas.width - bw) / 2;
    const by = 66;

    ctx.save();
    ctx.font      = 'bold 11px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle   = boss.color;
    ctx.shadowColor = boss.glow;
    ctx.shadowBlur  = 12;
    const phaseTag = boss.bossPhase >= 3 ? ' [BERSERK!]' : boss.bossPhase >= 2 ? ' [PHASE 2]' : '';
    ctx.fillText(`⚡ ${boss.label}${phaseTag} ⚡`, canvas.width / 2, by - 8);

    ctx.fillStyle  = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 0;
    ctx.fillRect(bx, by, bw, 10);

    const ratio    = boss.hp / boss.maxHp;
    const barColor = ratio > 0.5 ? boss.color : ratio > 0.25 ? '#ff8800' : '#ff2200';
    ctx.fillStyle   = barColor;
    ctx.shadowColor = barColor;
    ctx.shadowBlur  = 8;
    ctx.fillRect(bx, by, bw * ratio, 10);
    ctx.restore();
  }

  private _drawBossWarning(state: RenderState) {
    const { ctx, canvas } = this;
    const pulse = Math.floor(state.bossWarning.frames / 12) % 2 === 0;
    if (!pulse) return;
    const fade = Math.min(1, state.bossWarning.frames / 40);
    ctx.save();
    ctx.globalAlpha  = fade;
    ctx.font         = `bold ${Math.min(48, canvas.width * 0.05)}px Orbitron, monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = state.bossWarning.color;
    ctx.shadowColor  = state.bossWarning.color;
    ctx.shadowBlur   = 30;
    ctx.fillText(state.bossWarning.text, canvas.width / 2, canvas.height / 3);
    ctx.restore();
  }

  private _drawLaserBeam(player: Player) {
    const { ctx } = this;
    const x = player.x;
    ctx.save();
    ctx.shadowBlur  = 30;
    ctx.shadowColor = player.glow;
    const grad = ctx.createLinearGradient(x - 12, 0, x + 12, 0);
    grad.addColorStop(0,    'transparent');
    grad.addColorStop(0.35, player.color + '55');
    grad.addColorStop(0.5,  player.color + 'cc');
    grad.addColorStop(0.65, player.color + '55');
    grad.addColorStop(1,    'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 12, 0, 24, player.y - 42);
    ctx.shadowBlur = 10;
    ctx.fillStyle  = '#ffffff';
    ctx.fillRect(x - 1.5, 0, 3, player.y - 42);
    ctx.restore();
  }

  private _drawMissile(b: Bullet) {
    const { ctx } = this;
    ctx.save();
    if (b.trail && b.trail.length > 0) {
      b.trail.forEach((tp, i) => {
        ctx.globalAlpha = (i / b.trail!.length) * 0.4;
        ctx.fillStyle   = '#ff6600';
        ctx.shadowBlur  = 0;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.globalAlpha = 1;
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
    ctx.shadowBlur  = 15;
    ctx.shadowColor = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fillStyle = '#ffaa00';
    ctx.fill();
    ctx.restore();
  }

  private _drawFreezeOverlay(a: Alien, frameCount: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(a.cx, a.cy);
    ctx.strokeStyle = '#88ddff';
    ctx.shadowColor = '#44ccff';
    ctx.shadowBlur  = 14;
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = 0.65 + 0.25 * Math.sin(frameCount * 0.15);
    const r = Math.max(a.w, a.h) / 2 + 7;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      if (i === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
      else         ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  private _drawPowerupItem(item: PowerupItem) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.angle);
    ctx.shadowBlur  = 20;
    ctx.shadowColor = item.glow;
    ctx.strokeStyle = item.color;
    ctx.fillStyle   = item.color + '33';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(13, 0);
    ctx.lineTo(0, 16);
    ctx.lineTo(-13, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.rotate(-item.angle);
    ctx.fillStyle    = item.color;
    ctx.font         = 'bold 7px Orbitron, monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur   = 0;
    ctx.fillText(item.label, 0, 0);
    ctx.restore();
  }

  private _drawHpBar(a: Alien) {
    const { ctx } = this;
    const bw = a.w * 0.8;
    const bx = a.cx - bw / 2;
    const by = a.cy - a.h / 2 - 12;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, bw, 5);
    const ratio    = a.hp / a.maxHp;
    const barColor = ratio > 0.5 ? a.color : ratio > 0.25 ? '#ff8800' : '#ff2200';
    ctx.fillStyle   = barColor;
    ctx.shadowBlur  = 6;
    ctx.shadowColor = barColor;
    ctx.fillRect(bx, by, bw * ratio, 5);
    ctx.restore();
  }
}
