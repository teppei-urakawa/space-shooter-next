'use client';
import type { SoundManager } from '@/game/SoundManager';

interface TitleScreenProps {
  onStart: () => void;
  onRanking: () => void;
  soundManager: SoundManager;
}

export default function TitleScreen({ onStart, onRanking, soundManager }: TitleScreenProps) {
  const handleStart = () => {
    soundManager.startBgm('title');
    onStart();
  };

  return (
    <div className="title-content">
      <div className="title-logo">
        <span className="title-line1">GALACTIC</span>
        <span className="title-line2">STRIKER</span>
      </div>
      <p className="title-sub">宇宙人の侵略を阻止せよ</p>
      <button className="btn-neon btn-start" onClick={handleStart}>
        <span>LAUNCH</span>
      </button>
      <button className="btn-ghost" onClick={onRanking}>RANKING</button>
    </div>
  );
}
