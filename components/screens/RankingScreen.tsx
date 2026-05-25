'use client';
import { getTopScores } from '@/game/models/RankingModel';
import type { SoundManager } from '@/game/SoundManager';

interface RankingScreenProps {
  onBack: () => void;
  soundManager: SoundManager;
}

const DIFF_LABEL: Record<string, string> = { easy: 'EASY', normal: 'NORMAL', hard: 'HARD' };
const DIFF_COLOR: Record<string, string> = { easy: '#39ff14', normal: '#00f5ff', hard: '#ff00ff' };

export default function RankingScreen({ onBack, soundManager }: RankingScreenProps) {
  const scores = getTopScores();

  const handleBack = () => {
    soundManager.startBgm('title');
    onBack();
  };

  return (
    <div className="ranking-content">
      <h2 className="section-title">HALL OF FAME</h2>
      <ol className="ranking-list">
        {scores.length === 0 ? (
          <li className="no-records">— NO RECORDS YET —</li>
        ) : (
          scores.map((rec, i) => {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            const diffColor = DIFF_COLOR[rec.difficulty] || '#fff';
            return (
              <li key={i} className="ranking-item">
                <span className={`rank-num ${rankClass}`}>{i + 1}</span>
                <span
                  className="rank-color-dot"
                  style={{ background: rec.colorHex, color: rec.colorHex }}
                />
                <div className="rank-info">
                  <span className="rank-score">{rec.score.toLocaleString()} pts</span>
                  <span className="rank-meta">
                    {rec.colorLabel} ·{' '}
                    <span style={{ color: diffColor }}>
                      {DIFF_LABEL[rec.difficulty] || rec.difficulty}
                    </span>{' '}
                    · {rec.date}
                  </span>
                </div>
              </li>
            );
          })
        )}
      </ol>
      <button className="btn-neon" onClick={handleBack}><span>BACK TO TITLE</span></button>
    </div>
  );
}
