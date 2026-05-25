'use client';
import { useEffect, useState } from 'react';
import { getTopScores } from '@/game/models/RankingModel';
import { createClient } from '@/lib/supabase/client';
import type { SoundManager } from '@/game/SoundManager';
import type { GlobalRankRecord } from '@/types/game';

interface RankingScreenProps {
  onBack: () => void;
  soundManager: SoundManager;
}

const DIFF_LABEL: Record<string, string> = { easy: 'EASY', normal: 'NORMAL', hard: 'HARD' };
const DIFF_COLOR: Record<string, string> = { easy: '#39ff14', normal: '#00f5ff', hard: '#ff00ff' };

export default function RankingScreen({ onBack, soundManager }: RankingScreenProps) {
  const [tab, setTab]                         = useState<'global' | 'local'>('global');
  const [globalScores, setGlobalScores]       = useState<GlobalRankRecord[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [currentUserId, setCurrentUserId]     = useState<string | null>(null);

  const localScores = getTopScores();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (tab !== 'global') return;
    setLoading(true);
    fetch('/api/scores?limit=50')
      .then(r => r.json())
      .then(data => setGlobalScores(Array.isArray(data) ? data : []))
      .catch(() => setGlobalScores([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const handleBack = () => {
    soundManager.startBgm('title');
    onBack();
  };

  return (
    <div className="ranking-content">
      <h2 className="section-title">HALL OF FAME</h2>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          className={tab === 'global' ? 'btn-neon' : 'btn-ghost'}
          onClick={() => setTab('global')}
          style={{ fontSize: '0.75rem' }}
        >
          <span>GLOBAL</span>
        </button>
        <button
          className={tab === 'local' ? 'btn-neon' : 'btn-ghost'}
          onClick={() => setTab('local')}
          style={{ fontSize: '0.75rem' }}
        >
          LOCAL
        </button>
      </div>

      {tab === 'global' ? (
        <ol className="ranking-list">
          {loading ? (
            <li className="no-records">— LOADING... —</li>
          ) : globalScores.length === 0 ? (
            <li className="no-records">— NO RECORDS YET —</li>
          ) : (
            globalScores.map((rec, i) => {
              const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
              const diffColor = DIFF_COLOR[rec.difficulty] || '#fff';
              return (
                <li key={rec.id} className="ranking-item" style={currentUserId ? { opacity: 1 } : undefined}>
                  <span className={`rank-num ${rankClass}`}>{i + 1}</span>
                  <span className="rank-color-dot" style={{ background: rec.color_hex }} />
                  <div className="rank-info">
                    <span className="rank-score">
                      {rec.score.toLocaleString()} pts
                    </span>
                    <span className="rank-meta">
                      {rec.username} · {rec.color_label} ·{' '}
                      <span style={{ color: diffColor }}>
                        {DIFF_LABEL[rec.difficulty] || rec.difficulty}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ol>
      ) : (
        <ol className="ranking-list">
          {localScores.length === 0 ? (
            <li className="no-records">— NO RECORDS YET —</li>
          ) : (
            localScores.map((rec, i) => {
              const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
              const diffColor = DIFF_COLOR[rec.difficulty] || '#fff';
              return (
                <li key={i} className="ranking-item">
                  <span className={`rank-num ${rankClass}`}>{i + 1}</span>
                  <span className="rank-color-dot" style={{ background: rec.colorHex }} />
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
      )}

      <button className="btn-neon" onClick={handleBack}><span>BACK TO TITLE</span></button>
    </div>
  );
}
