'use client';
import { useEffect, useRef } from 'react';
import { GameController } from '@/game/GameController';
import { SoundManager } from '@/game/SoundManager';
import type { ShipColor, HudState } from '@/types/game';

interface UseGameLoopOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedColor: ShipColor;
  selectedDiff: string;
  onHudUpdate: (state: HudState) => void;
  onGameOver: (score: number) => void;
}

export function useGameLoop({
  canvasRef,
  selectedColor,
  selectedDiff,
  onHudUpdate,
  onGameOver,
}: UseGameLoopOptions) {
  const controllerRef = useRef<GameController | null>(null);
  const soundRef      = useRef<SoundManager | null>(null);

  if (!soundRef.current) {
    soundRef.current = new SoundManager();
  }

  // ゲームループを一度だけ起動
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sound = soundRef.current!;
    const controller = new GameController({ canvas, soundManager: sound });
    controller.selectedColor = selectedColor;
    controller.selectedDiff  = selectedDiff;
    controller.onHudUpdate   = onHudUpdate;
    controller.onGameOver    = onGameOver;
    controllerRef.current = controller;

    controller.startGame();
    sound.startBgm('game');

    return () => {
      controller.destroy();
      sound.stopBgm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // コールバックを毎レンダリングで更新（ゲームを再起動せずに済む）
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.onHudUpdate = onHudUpdate;
      controllerRef.current.onGameOver  = onGameOver;
    }
  });

  const togglePause = () => controllerRef.current?.togglePause();
  const isPaused    = () => controllerRef.current?.paused ?? false;

  return { controllerRef, soundRef, togglePause, isPaused };
}
