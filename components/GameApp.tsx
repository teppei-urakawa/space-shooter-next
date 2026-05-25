'use client';
import { useRef, useState, useCallback } from 'react';
import { SoundManager } from '@/game/SoundManager';
import { SHIP_COLORS } from '@/game/data/ships';
import TitleScreen from '@/components/screens/TitleScreen';
import ColorSelectScreen from '@/components/screens/ColorSelectScreen';
import DifficultySelectScreen from '@/components/screens/DifficultySelectScreen';
import GameScreen from '@/components/screens/GameScreen';
import RankingScreen from '@/components/screens/RankingScreen';
import type { Screen, ShipColor, Difficulty } from '@/types/game';

export default function GameApp() {
  const [screen, setScreen]             = useState<Screen>('title');
  const [selectedColor, setSelectedColor] = useState<ShipColor>(SHIP_COLORS[0]);
  const [selectedDiff, setSelectedDiff]   = useState<Difficulty>('normal');
  const [gameOverScore, setGameOverScore] = useState(0);
  const [showGameOver, setShowGameOver]   = useState(false);
  const soundRef = useRef<SoundManager | null>(null);

  if (!soundRef.current) {
    soundRef.current = new SoundManager();
  }

  const sound = soundRef.current;

  const handleGameOver = useCallback((score: number) => {
    setGameOverScore(score);
    setShowGameOver(true);
  }, []);

  const handleStartGame = () => {
    setShowGameOver(false);
    setScreen('game');
  };

  const handleGoTitle = () => {
    setShowGameOver(false);
    sound.startBgm('title');
    setScreen('title');
  };

  const handleRetry = () => {
    setShowGameOver(false);
    // GameScreen を再マウントするため一度 title に戻してから game へ
    setScreen('title');
    setTimeout(() => setScreen('game'), 0);
  };

  const handleViewRanking = () => {
    setShowGameOver(false);
    setScreen('ranking');
  };

  return (
    <>
      <div className="stars-bg" />

      {/* タイトル画面 */}
      <section className={`screen${screen === 'title' ? ' active' : ''}`}>
        <TitleScreen
          onStart={() => setScreen('color')}
          onRanking={() => setScreen('ranking')}
          soundManager={sound}
        />
      </section>

      {/* 色選択画面 */}
      <section className={`screen${screen === 'color' ? ' active' : ''}`}>
        <ColorSelectScreen
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          onNext={() => setScreen('difficulty')}
        />
      </section>

      {/* 難易度選択画面 */}
      <section className={`screen${screen === 'difficulty' ? ' active' : ''}`}>
        <DifficultySelectScreen
          selectedDiff={selectedDiff}
          onDiffChange={setSelectedDiff}
          onStart={handleStartGame}
        />
      </section>

      {/* ゲーム画面 */}
      <section className={`screen${screen === 'game' ? ' active' : ''}`}>
        {screen === 'game' && (
          <GameScreen
            selectedColor={selectedColor}
            selectedDiff={selectedDiff}
            onGameOver={handleGameOver}
            onGoTitle={handleGoTitle}
          />
        )}

        {/* ゲームオーバーオーバーレイ */}
        {showGameOver && (
          <div className="game-overlay">
            <div className="overlay-box">
              <h2 className="overlay-title">GAME OVER</h2>
              <p className="overlay-score">
                SCORE: <span>{gameOverScore.toLocaleString()}</span>
              </p>
              <button className="btn-neon" onClick={handleViewRanking}><span>RANKING</span></button>
              <button className="btn-ghost" onClick={handleRetry}>RETRY</button>
              <button className="btn-ghost" onClick={handleGoTitle}>TITLE</button>
            </div>
          </div>
        )}
      </section>

      {/* ランキング画面 */}
      <section className={`screen${screen === 'ranking' ? ' active' : ''}`}>
        <RankingScreen
          onBack={() => setScreen('title')}
          soundManager={sound}
        />
      </section>
    </>
  );
}
