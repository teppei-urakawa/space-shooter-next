import { DIFFICULTY, POWERUP_DEFS } from './data/powerups';
import { ALIEN_TYPES, SHIP_COLORS }  from './data/ships';
import { StarField }                 from './models/StarField';
import { Particle }                  from './models/Particle';
import { saveScore }                 from './models/RankingModel';
import { GameRenderer }              from './GameRenderer';
import { InputController }           from './InputController';
import type {
  ShipColor, Player, Bullet, AlienBullet, Alien,
  PowerupItem, ScreenFlash, BossWarning, DiffConfig, HudState,
} from '@/types/game';
import type { SoundManager } from './SoundManager';

const ALIEN_POOL = ['drone', 'drone', 'drone', 'zigzag', 'zigzag', 'bomber', 'spinner'];

interface GameState {
  player: Player | null;
  bullets: Bullet[];
  alienBullets: AlienBullet[];
  aliens: Alien[];
  particles: Particle[];
  powerupItems: PowerupItem[];
  starField: StarField | null;
  score: number;
  level: number;
  frameCount: number;
  lives: number;
  gameRunning: boolean;
  paused: boolean;
  mouseIsDown: boolean;
  screenFlash: ScreenFlash;
  bossWarning: BossWarning;
  diffConfig: DiffConfig | null;
}

interface GameControllerOptions {
  canvas: HTMLCanvasElement;
  soundManager: SoundManager;
}

export class GameController {
  private canvas: HTMLCanvasElement;
  private soundManager: SoundManager;
  private renderer: GameRenderer;
  private inputController: InputController | null = null;
  private rafId: number | null = null;
  private state: GameState;

  selectedColor: ShipColor = SHIP_COLORS[0];
  selectedDiff  = 'normal';

  // React から更新されるコールバック
  onHudUpdate: ((state: HudState) => void) | null = null;
  onGameOver:  ((score: number)   => void) | null = null;

  constructor({ canvas, soundManager }: GameControllerOptions) {
    this.canvas       = canvas;
    this.soundManager = soundManager;
    this.renderer     = new GameRenderer(canvas);
    this.state        = this._createEmptyState();

    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());
  }

  private _createEmptyState(): GameState {
    return {
      player: null,
      bullets: [], alienBullets: [], aliens: [],
      particles: [], powerupItems: [], starField: null,
      score: 0, level: 1, frameCount: 0, lives: 3,
      gameRunning: false, paused: false, mouseIsDown: false,
      screenFlash: { alpha: 0, color: '#ffffff', decay: 0.04 },
      bossWarning: { text: '', frames: 0, color: '#ff4400' },
      diffConfig: null,
    };
  }

  private _resizeCanvas() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initGame() {
    const { canvas } = this;
    const s = this.state;

    s.diffConfig = DIFFICULTY[this.selectedDiff];
    s.player = {
      x: canvas.width / 2, y: canvas.height - 80,
      targetX: canvas.width / 2,
      w: 72, h: 80,
      color: this.selectedColor.hex,
      glow:  this.selectedColor.glow,
      invincible: 0, shootCooldown: 0,
      activeItems: { twin: 0, spread: 0, rapid: 0, shield: false, laser: 0, freeze: 0 },
    };
    s.bullets      = [];
    s.alienBullets = [];
    s.aliens       = [];
    s.particles    = [];
    s.powerupItems = [];
    s.starField    = new StarField(canvas);
    s.score        = 0;
    s.level        = 1;
    s.frameCount   = 0;
    s.lives        = 3;
    s.gameRunning  = true;
    s.mouseIsDown  = false;
    s.screenFlash  = { alpha: 0, color: '#ffffff', decay: 0.04 };
    s.bossWarning  = { text: '', frames: 0, color: '#ff4400' };

    this._notifyHud();
  }

  startGame() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.initGame();

    // 入力コントローラーを設定
    if (this.inputController) this.inputController.destroy();
    this.inputController = new InputController(this.canvas, {
      onMove: x => { if (this.state.player) this.state.player.targetX = x; },
      onDown: () => {},
      onUp:   () => {},
    });

    this.rafId = requestAnimationFrame(() => this._loop());
  }

  togglePause() {
    const s = this.state;
    if (!s.gameRunning) return;
    s.paused = !s.paused;
    if (s.paused) {
      s.mouseIsDown = false;
      this.soundManager.stopBgm();
    } else {
      this.soundManager.startBgm('game');
    }
    return s.paused;
  }

  get paused() { return this.state.paused; }
  get gameRunning() { return this.state.gameRunning; }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.inputController) this.inputController.destroy();
    window.removeEventListener('resize', () => this._resizeCanvas());
  }

  // ── ゲームループ ────────────────────────────────────────

  private _loop() {
    const s = this.state;
    if (s.gameRunning) {
      if (!s.paused) this._update();
      this.renderer.render(s as Parameters<typeof this.renderer.render>[0]);
      this.rafId = requestAnimationFrame(() => this._loop());
    } else {
      this.renderer.render(s as Parameters<typeof this.renderer.render>[0]);
    }
  }

  // ── 更新ロジック ────────────────────────────────────────

  private _update() {
    const { state: s, canvas } = this;
    s.frameCount++;

    this._fireBullet();

    const p = s.player!;
    p.x += (p.targetX - p.x) * 0.12;
    p.x = Math.max(p.w / 2, Math.min(canvas.width - p.w / 2, p.x));
    if (p.invincible    > 0) p.invincible--;
    if (p.shootCooldown > 0) p.shootCooldown--;

    const hudKeys = ['twin', 'spread', 'rapid', 'laser', 'freeze'] as const;
    hudKeys.forEach(key => {
      if (p.activeItems[key] > 0) {
        (p.activeItems[key] as number)--;
        if (p.activeItems[key] === 0) this._notifyHud();
      }
    });
    if (s.frameCount % 60 === 0) this._notifyHud();

    if (s.screenFlash.alpha > 0) s.screenFlash.alpha = Math.max(0, s.screenFlash.alpha - s.screenFlash.decay);
    if (s.bossWarning.frames > 0) s.bossWarning.frames--;

    const newLevel = 1 + Math.floor(s.score / 500);
    if (newLevel !== s.level) {
      s.level = newLevel;
      this._notifyHud();
    }

    if (s.frameCount % Math.max(s.diffConfig!.spawnRate - s.level * 3, 20) === 0) this._spawnAlien();

    s.aliens.forEach(a => {
      if (!a.type.startsWith('boss')) return;
      if (a.bossPhase === 1 && a.hp <= a.maxHp * 0.55) {
        a.bossPhase    = 2;
        s.screenFlash  = { alpha: 0.65, color: a.color, decay: 0.022 };
        s.bossWarning  = { text: '⚡ PHASE 2 ⚡', frames: 120, color: a.color };
      }
      if (a.type === 'boss_hard' && a.bossPhase === 2 && a.hp <= a.maxHp * 0.28) {
        a.bossPhase    = 3;
        s.screenFlash  = { alpha: 0.95, color: '#ff2200', decay: 0.025 };
        s.bossWarning  = { text: '☠ BERSERK MODE ☠', frames: 160, color: '#ff2200' };
      }
    });

    s.bullets.forEach(b => {
      if (b.homing && b.target && !b.target.dead) {
        const dx   = b.target.cx - b.x;
        const dy   = b.target.cy - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 7;
          b.vx += (dx / dist * spd - b.vx) * 0.13;
          b.vy += (dy / dist * spd - b.vy) * 0.13;
        }
        b.trail = b.trail || [];
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 8) b.trail.shift();
      }
      b.x += b.vx;
      b.y += b.vy;
    });
    s.bullets = s.bullets.filter(b => b.y > -20 && b.y < canvas.height + 20 && b.x > -30 && b.x < canvas.width + 30);

    const frozen = p.activeItems.freeze > 0;
    if (!frozen) s.alienBullets.forEach(b => { b.x += b.vx; b.y += b.vy; });
    s.alienBullets = s.alienBullets.filter(b => b.y < canvas.height + 20 && b.y > -30 && b.x > -30 && b.x < canvas.width + 30);

    s.powerupItems.forEach(item => { item.y += item.speed; item.angle += 0.04; });
    s.powerupItems = s.powerupItems.filter(item => item.y < canvas.height + 30);

    if (!frozen) s.aliens.forEach(a => this._updateAlienMovement(a));

    if (p.activeItems.laser > 0 && s.frameCount % 4 === 0) {
      s.aliens.forEach(a => {
        if (Math.abs(a.cx - p.x) < a.w / 2 + 8) {
          a.hp--;
          if (a.hp <= 0) this._killAlien(a);
        }
      });
      s.aliens = s.aliens.filter(a => !a.dead);
    }

    s.bullets.forEach(b => {
      s.aliens.forEach(a => {
        if (a.dead) return;
        if (this._rectOverlap(b.x - 4, b.y - 8, 8, 16, a.cx - a.w / 2, a.cy - a.h / 2, a.w, a.h)) {
          b.hit  = true;
          a.hp  -= (b.dmg || 1);
          if (a.hp <= 0) this._killAlien(a);
        }
      });
    });
    s.bullets = s.bullets.filter(b => !b.hit);
    s.aliens  = s.aliens.filter(a => !a.dead && a.cy < canvas.height + 80);

    s.powerupItems = s.powerupItems.filter(item => {
      if (this._rectOverlap(item.x - 16, item.y - 16, 32, 32, p.x - 30, p.y - 40, 60, 80)) {
        this._applyPowerup(item);
        this._spawnExplosion(item.x, item.y, item.color, 10);
        return false;
      }
      return true;
    });

    if (p.invincible === 0) {
      s.alienBullets.forEach(b => {
        if (this._pointInRect(b.x, b.y, p.x - 20, p.y - 30, 40, 60)) {
          b.hit = true;
          this._takeDamage();
        }
      });
      s.alienBullets = s.alienBullets.filter(b => !b.hit);

      s.aliens.forEach(a => {
        if (this._rectOverlap(a.cx - a.w / 2, a.cy - a.h / 2, a.w, a.h, p.x - 24, p.y - 30, 48, 60)) {
          a.dead = true;
          this._spawnExplosion(a.cx, a.cy, a.color, 15);
          this._takeDamage();
        }
      });
      s.aliens = s.aliens.filter(a => !a.dead);
    }

    s.particles.forEach(pt => pt.update());
    s.particles = s.particles.filter(pt => !pt.isDead());
    s.starField!.update();
  }

  // ── 射撃 ────────────────────────────────────────────────

  private _fireBullet() {
    const { state: s } = this;
    const p = s.player;
    if (!p || p.shootCooldown > 0) return;
    p.shootCooldown = p.activeItems.rapid > 0 ? 5 : 12;

    this.soundManager.playShoot();
    const spd       = 14;
    const hasTwin   = p.activeItems.twin   > 0;
    const hasSpread = p.activeItems.spread > 0;

    if (hasSpread && hasTwin) {
      const angles = [-0.35, -0.18, 0, 0.18, 0.35];
      [0, -55, 55].forEach((off, i) => {
        const s2   = i === 0 ? spd : spd * 0.85;
        const yOff = i === 0 ? -40 : -28;
        angles.forEach(a => s.bullets.push({ x: p.x + off, y: p.y + yOff, vx: Math.sin(a) * s2, vy: -Math.cos(a) * s2 }));
      });
    } else if (hasSpread) {
      [-0.35, -0.18, 0, 0.18, 0.35].forEach(a => s.bullets.push({ x: p.x, y: p.y - 40, vx: Math.sin(a) * spd, vy: -Math.cos(a) * spd }));
    } else if (hasTwin) {
      s.bullets.push({ x: p.x,      y: p.y - 40, vx: 0, vy: -spd });
      s.bullets.push({ x: p.x - 55, y: p.y - 28, vx: 0, vy: -spd });
      s.bullets.push({ x: p.x + 55, y: p.y - 28, vx: 0, vy: -spd });
    } else {
      s.bullets.push({ x: p.x, y: p.y - 40, vx: 0, vy: -spd });
    }
  }

  // ── 宇宙人スポーン ────────────────────────────────────────

  private _getBossType() {
    return this.selectedDiff === 'easy' ? 'boss_easy' : this.selectedDiff === 'hard' ? 'boss_hard' : 'boss';
  }

  private _spawnAlien() {
    const { state: s, canvas } = this;
    const bossInterval = s.diffConfig!.spawnRate * 55;
    const isBoss = s.frameCount > 0 && s.frameCount % bossInterval === 0;
    const typeId = isBoss ? this._getBossType() : ALIEN_POOL[Math.floor(Math.random() * ALIEN_POOL.length)];
    const tDef   = ALIEN_TYPES.find(t => t.id === typeId)!;

    s.aliens.push({
      type:  typeId,
      cx:    tDef.w / 2 + Math.random() * (canvas.width - tDef.w),
      cy:    -tDef.h / 2,
      w: tDef.w, h: tDef.h,
      hp: tDef.hp, maxHp: tDef.hp,
      score: tDef.score,
      color: tDef.color, glow: tDef.glow, label: tDef.label,
      speed: tDef.speedBase * s.diffConfig!.speedMult * (1 + s.level * 0.08),
      phase: Math.random() * Math.PI * 2,
      angle: 0, shootTimer: 0, bossPhase: 1, yPhase: 0, spiralAngle: 0,
    });

    if (isBoss) {
      s.bossWarning = { text: `⚠ ${tDef.label} ⚠`, frames: 150, color: tDef.color };
      s.screenFlash = { alpha: 0.45, color: tDef.color, decay: 0.012 };
    }
  }

  // ── 宇宙人移動ロジック ────────────────────────────────────

  private _updateAlienMovement(a: Alien) {
    const { state: s, canvas } = this;
    switch (a.type) {
      case 'drone':
        a.cy += a.speed;
        break;
      case 'zigzag':
        a.cy += a.speed * 0.7;
        a.phase += 0.04;
        a.cx = Math.max(a.w / 2, Math.min(canvas.width - a.w / 2, a.cx + Math.sin(a.phase) * 3));
        break;
      case 'bomber':
        a.speed = Math.min(a.speed + 0.015 * s.diffConfig!.speedMult, 4);
        a.cy += a.speed;
        break;
      case 'spinner':
        a.cy += a.speed * 0.5;
        a.phase += 0.03;
        a.cx = Math.max(a.w / 2, Math.min(canvas.width - a.w / 2, a.cx + Math.cos(a.phase) * 2.5));
        a.angle += 0.06;
        break;
      case 'boss_easy': this._updateBossEasy(a);   break;
      case 'boss':      this._updateBossNormal(a); break;
      case 'boss_hard': this._updateBossHard(a);   break;
    }
  }

  private _updateBossEasy(a: Alien) {
    const { state: s, canvas } = this;
    a.phase += 0.01 + (a.bossPhase >= 2 ? 0.006 : 0);
    a.cx = canvas.width / 2 + Math.sin(a.phase) * (canvas.width * 0.30);
    a.cy = Math.min(a.cy + 0.6, 135);
    a.shootTimer++;
    const interval = a.bossPhase >= 2 ? 50 : 78;
    if (a.shootTimer % interval === 0) {
      const count = a.bossPhase >= 2 ? 5 : 3;
      for (let i = 0; i < count; i++) {
        const off = (i - (count - 1) / 2) * 0.22;
        s.alienBullets.push({ x: a.cx, y: a.cy + a.h / 2, vx: Math.sin(off) * 2.8, vy: 2.8, color: a.color });
      }
      if (a.bossPhase >= 2) {
        const ang = Math.atan2(s.player!.y - a.cy, s.player!.x - a.cx);
        s.alienBullets.push({ x: a.cx, y: a.cy + a.h / 2, vx: Math.cos(ang) * 3.5, vy: Math.sin(ang) * 3.5, color: '#ffffff' });
      }
    }
  }

  private _updateBossNormal(a: Alien) {
    const { state: s, canvas } = this;
    a.phase += 0.012;
    a.cx = canvas.width / 2 + Math.sin(a.phase) * (canvas.width * 0.35);
    a.cy = Math.min(a.cy + a.speed * 0.3, 120);
    a.shootTimer++;
    if (a.bossPhase >= 2) {
      if (a.shootTimer % 42 === 0) {
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI * 2) / 8;
          s.alienBullets.push({ x: a.cx, y: a.cy, vx: Math.cos(ang) * 3.5, vy: Math.sin(ang) * 3.5, color: '#ffdd00' });
        }
      }
    } else {
      if (a.shootTimer % 70 === 0) {
        const ang = Math.atan2(s.player!.y - a.cy, s.player!.x - a.cx);
        [-0.25, 0, 0.25].forEach(off => s.alienBullets.push({ x: a.cx, y: a.cy + a.h / 2, vx: Math.cos(ang + off) * 3, vy: Math.sin(ang + off) * 3, color: '#ffdd00' }));
      }
    }
  }

  private _updateBossHard(a: Alien) {
    const { state: s, canvas } = this;
    const speedBonus = (a.bossPhase >= 2 ? 0.008 : 0) + (a.bossPhase >= 3 ? 0.01 : 0);
    a.phase  += 0.015 + speedBonus;
    a.yPhase += 0.008;
    a.cx = canvas.width / 2 + Math.sin(a.phase) * (canvas.width * 0.38);
    a.cy += (110 + Math.sin(a.yPhase) * 55 - a.cy) * 0.03;
    a.shootTimer++;

    if (a.bossPhase >= 3 && a.shootTimer % 18 === 0) {
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI * 2) / 12 + a.shootTimer * 0.04;
        s.alienBullets.push({ x: a.cx, y: a.cy, vx: Math.cos(ang) * 4.2, vy: Math.sin(ang) * 4.2, color: '#ff2244' });
      }
    }
    if (a.bossPhase >= 2 && a.shootTimer % 35 === 0) {
      for (let i = 0; i < 4; i++) {
        const ang = a.spiralAngle + (i * Math.PI / 2);
        s.alienBullets.push({ x: a.cx, y: a.cy, vx: Math.cos(ang) * 3.5, vy: Math.sin(ang) * 3.5, color: '#ff8800' });
      }
      a.spiralAngle += 0.4;
    }
    const aimInterval = a.bossPhase >= 2 ? 38 : 52;
    if (a.shootTimer % aimInterval === 0) {
      const ang = Math.atan2(s.player!.y - a.cy, s.player!.x - a.cx);
      [-0.18, 0.18].forEach(off => s.alienBullets.push({ x: a.cx, y: a.cy, vx: Math.cos(ang + off) * 4.8, vy: Math.sin(ang + off) * 4.8, color: '#ff2244' }));
    }
  }

  // ── パワーアップ・戦闘処理 ────────────────────────────────

  private _spawnExplosion(x: number, y: number, color: string, count = 18) {
    for (let i = 0; i < count; i++) this.state.particles.push(new Particle(x, y, color));
  }

  private _spawnPowerup(x: number, y: number) {
    const def = POWERUP_DEFS[Math.floor(Math.random() * POWERUP_DEFS.length)];
    this.state.powerupItems.push({ x, y, type: def.id, color: def.color, glow: def.glow, label: def.label, duration: def.duration, speed: 1.8, angle: 0 });
  }

  private _applyPowerup(item: PowerupItem) {
    const { state: s } = this;
    this.soundManager.playPowerup();
    switch (item.type) {
      case 'nova':    this._applyNovaBomb();      return;
      case 'missile': this._applyMissileStrike(); return;
      case 'shield':  s.player!.activeItems.shield = true; break;
      default: {
        const def = POWERUP_DEFS.find(d => d.id === item.type);
        if (def) (s.player!.activeItems as unknown as Record<string, number>)[item.type] = def.duration;
      }
    }
    this._notifyHud();
  }

  private _applyNovaBomb() {
    const { state: s } = this;
    s.aliens.forEach(a => {
      const isBoss = a.type.startsWith('boss');
      a.hp -= isBoss ? 10 : a.maxHp + 1;
      this._spawnExplosion(a.cx, a.cy, a.color, isBoss ? 30 : 12);
      if (a.hp <= 0) { a.dead = true; s.score += a.score * (this.selectedDiff === 'hard' ? 2 : 1); }
    });
    s.aliens       = s.aliens.filter(a => !a.dead);
    s.alienBullets = [];
    s.screenFlash  = { alpha: 0.9, color: '#ff5500', decay: 0.03 };
    s.bossWarning  = { text: '⚡ NOVA BLAST ⚡', frames: 100, color: '#ff8800' };
    this._notifyHud();
  }

  private _applyMissileStrike() {
    const { state: s } = this;
    s.aliens.forEach(target => {
      s.bullets.push({ x: s.player!.x + (Math.random() - 0.5) * 24, y: s.player!.y - 40, vx: (Math.random() - 0.5) * 2, vy: -7, target, homing: true, dmg: 3, trail: [] });
    });
    s.bossWarning = { text: '🚀 MISSILE STRIKE', frames: 90, color: '#ff9900' };
    this._notifyHud();
  }

  private _killAlien(a: Alien) {
    const { state: s } = this;
    const isBoss = a.type.startsWith('boss');
    a.dead   = true;
    s.score += a.score * (this.selectedDiff === 'hard' ? 2 : 1);
    this._spawnExplosion(a.cx, a.cy, a.color, isBoss ? 60 : 20);
    if (isBoss) {
      this.soundManager.playBossExplosion();
      for (let i = 0; i < 3; i++) this._spawnPowerup(a.cx + (Math.random() - 0.5) * 80, a.cy + (Math.random() - 0.5) * 40);
      s.screenFlash = { alpha: 1.0, color: '#ffffff', decay: 0.028 };
      s.bossWarning = { text: '★ BOSS DEFEATED ★', frames: 200, color: '#ffd700' };
    } else {
      this.soundManager.playExplosion();
      if (Math.random() < 0.3) this._spawnPowerup(a.cx, a.cy);
    }
    this._notifyHud();
  }

  private _takeDamage() {
    const { state: s } = this;
    const p = s.player!;
    if (p.activeItems.shield) {
      p.activeItems.shield = false;
      p.invincible = 60;
      this._spawnExplosion(p.x, p.y, '#ffd700', 10);
      this._notifyHud();
      this.soundManager.playDamage();
      return;
    }
    s.lives--;
    p.invincible = 120;
    this._spawnExplosion(p.x, p.y, p.glow, 12);
    this.soundManager.playDamage();
    this._notifyHud();
    if (s.lives <= 0) this._endGame();
  }

  private _endGame() {
    const { state: s } = this;
    s.gameRunning = false;
    s.mouseIsDown = false;
    this.soundManager.stopBgm();
    this.soundManager.playGameOver();
    saveScore(s.score, this.selectedColor.id, this.selectedDiff);
    fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score:      s.score,
        colorId:    this.selectedColor.id,
        colorHex:   this.selectedColor.hex,
        colorLabel: this.selectedColor.label,
        difficulty: this.selectedDiff,
      }),
    }).catch(() => {});
    this.onGameOver?.(s.score);
  }

  private _notifyHud() {
    const s = this.state;
    if (!s.player) return;
    this.onHudUpdate?.({
      score: s.score,
      level: s.level,
      lives: s.lives,
      activeItems: s.player.activeItems,
    });
  }

  // ── ユーティリティ ────────────────────────────────────────

  private _rectOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private _pointInRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }
}
