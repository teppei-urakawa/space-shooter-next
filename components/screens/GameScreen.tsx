'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import HudOverlay from '@/components/hud/HudOverlay';
import type { ShipColor, HudState } from '@/types/game';

interface GameScreenProps {
  selectedColor: ShipColor;
  selectedDiff: string;
  onGameOver: (score: number) => void;
  onGoTitle: () => void;
}

const INITIAL_HUD: HudState = {
  score: 0,
  level: 1,
  stage: 1,
  lives: 3,
  activeItems: { twin: 0, spread: 0, rapid: 0, shield: false, laser: 0, freeze: 0 },
};

export default function GameScreen({ selectedColor, selectedDiff, onGameOver, onGoTitle }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hud, setHud]     = useState<HudState>(INITIAL_HUD);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted]   = useState(false);

  const handleHudUpdate = useCallback((state: HudState) => {
    setHud({ ...state, activeItems: { ...state.activeItems } });
  }, []);

  const handleGameOver = useCallback((score: number) => {
    onGameOver(score);
  }, [onGameOver]);

  const { togglePause, soundRef } = useGameLoop({
    canvasRef,
    selectedColor,
    selectedDiff,
    onHudUpdate: handleHudUpdate,
    onGameOver:  handleGameOver,
  });

  // ESC/P キーでポーズ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        handleTogglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePause = () => {
    togglePause();
    setPaused(prev => !prev);
  };

  const handleToggleMute = () => {
    if (soundRef.current) {
      const isMuted = soundRef.current.toggleMute();
      setMuted(isMuted);
    }
  };

  const handlePauseToTitle = () => {
    soundRef.current?.startBgm('title');
    onGoTitle();
  };

  return (
    <>
      <HudOverlay
        hud={hud}
        paused={paused}
        onTogglePause={handleTogglePause}
        onToggleMute={handleToggleMute}
        muted={muted}
        onResumeClick={handleTogglePause}
        onPauseToTitle={handlePauseToTitle}
      />
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'crosshair' }} />
    </>
  );
}
