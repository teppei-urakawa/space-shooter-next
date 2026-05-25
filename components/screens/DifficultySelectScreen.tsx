'use client';
import { useState } from 'react';
import type { Difficulty } from '@/types/game';

interface DifficultySelectScreenProps {
  selectedDiff: Difficulty;
  onDiffChange: (diff: Difficulty) => void;
  onStart: () => void;
}

const DIFFS: { id: Difficulty; name: string; desc: string }[] = [
  { id: 'easy',   name: 'EASY',   desc: '初心者向け / ゆっくり侵略' },
  { id: 'normal', name: 'NORMAL', desc: '標準 / 激しい戦闘' },
  { id: 'hard',   name: 'HARD',   desc: '死の銀河 / 逃げ場なし' },
];

export default function DifficultySelectScreen({ selectedDiff, onDiffChange, onStart }: DifficultySelectScreenProps) {
  const [diff, setDiff] = useState<Difficulty>(selectedDiff);

  const handleSelect = (d: Difficulty) => {
    setDiff(d);
    onDiffChange(d);
  };

  return (
    <div className="select-content">
      <h2 className="section-title">SELECT DIFFICULTY</h2>
      <div className="difficulty-grid">
        {DIFFS.map(d => (
          <button
            key={d.id}
            className={`btn-difficulty${diff === d.id ? ' selected' : ''}`}
            data-diff={d.id}
            onClick={() => handleSelect(d.id)}
          >
            <span className="diff-name">{d.name}</span>
            <span className="diff-desc">{d.desc}</span>
          </button>
        ))}
      </div>
      <button className="btn-neon" onClick={onStart}><span>BATTLE START ›</span></button>
    </div>
  );
}
