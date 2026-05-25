'use client';
import type { HudState } from '@/types/game';

interface HudOverlayProps {
  hud: HudState;
  paused: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  muted: boolean;
  onResumeClick: () => void;
  onPauseToTitle: () => void;
}

export default function HudOverlay({
  hud,
  paused,
  onTogglePause,
  onToggleMute,
  muted,
  onResumeClick,
  onPauseToTitle,
}: HudOverlayProps) {
  const powerupBadges = [];
  if (hud.activeItems.twin   > 0) powerupBadges.push({ label: 'TWIN',   color: '#00f5ff', t: hud.activeItems.twin   });
  if (hud.activeItems.spread > 0) powerupBadges.push({ label: 'SPREAD', color: '#ff00ff', t: hud.activeItems.spread });
  if (hud.activeItems.rapid  > 0) powerupBadges.push({ label: 'RAPID',  color: '#39ff14', t: hud.activeItems.rapid  });
  if (hud.activeItems.shield)     powerupBadges.push({ label: 'SHIELD', color: '#ffd700', t: -1 });
  if (hud.activeItems.laser  > 0) powerupBadges.push({ label: 'LASER',  color: '#ff1155', t: hud.activeItems.laser  });
  if (hud.activeItems.freeze > 0) powerupBadges.push({ label: 'FREEZE', color: '#88eeff', t: hud.activeItems.freeze });

  return (
    <>
      <div className="game-hud">
        <div className="hud-left">
          <span className="hud-label">SCORE</span>
          <span className="hud-value">{hud.score.toLocaleString()}</span>
        </div>
        <div className="hud-center">
          <span className="hud-label">LEVEL</span>
          <span className="hud-value">{hud.level}</span>
        </div>
        <div className="hud-right">
          <span className="hud-label">LIFE</span>
          <span className="hud-value">{'❤️'.repeat(Math.max(0, hud.lives))}</span>
        </div>
        <div className="hud-actions">
          <button className="btn-hud-icon" onClick={onTogglePause} title="一時停止 (ESC)">
            {paused ? '▶' : '⏸'}
          </button>
          <button className="btn-hud-icon" onClick={onToggleMute} title="ミュート切替">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {powerupBadges.length > 0 && (
        <div className="hud-powerups">
          {powerupBadges.map((p, i) => {
            const sec = p.t > 0 ? Math.ceil(p.t / 60) + 's' : '★';
            return (
              <span
                key={i}
                className="powerup-badge"
                style={{ color: p.color, borderColor: p.color, boxShadow: `0 0 8px ${p.color}` }}
              >
                {p.label} {sec}
              </span>
            );
          })}
        </div>
      )}

      {paused && (
        <div className="pause-overlay">
          <div className="pause-box">
            <h2 className="pause-title">PAUSED</h2>
            <button className="btn-neon" onClick={onResumeClick}><span>RESUME</span></button>
            <button className="btn-ghost" onClick={onPauseToTitle}>TITLE</button>
          </div>
        </div>
      )}
    </>
  );
}
