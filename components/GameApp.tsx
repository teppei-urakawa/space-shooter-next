'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { SoundManager } from '@/game/SoundManager';
import { SHIP_COLORS } from '@/game/data/ships';
import { createClient } from '@/lib/supabase/client';
import TitleScreen from '@/components/screens/TitleScreen';
import ColorSelectScreen from '@/components/screens/ColorSelectScreen';
import DifficultySelectScreen from '@/components/screens/DifficultySelectScreen';
import GameScreen from '@/components/screens/GameScreen';
import RankingScreen from '@/components/screens/RankingScreen';
import AuthScreen from '@/components/screens/AuthScreen';
import type { Screen, ShipColor, Difficulty } from '@/types/game';
import type { User } from '@supabase/supabase-js';

export default function GameApp() {
  const [screen, setScreen]               = useState<Screen>('title');
  const [selectedColor, setSelectedColor] = useState<ShipColor>(SHIP_COLORS[0]);
  const [selectedDiff, setSelectedDiff]   = useState<Difficulty>('normal');
  const [gameOverScore, setGameOverScore] = useState(0);
  const [showGameOver, setShowGameOver]   = useState(false);
  const [user, setUser]                   = useState<User | null>(null);
  const soundRef = useRef<SoundManager | null>(null);

  if (!soundRef.current) {
    soundRef.current = new SoundManager();
  }

  const sound = soundRef.current;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

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

      {/* ログイン状態バッジ（ゲーム中は非表示） */}
      <div style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 100, display: screen === 'game' ? 'none' : 'flex', alignItems: 'center', gap: '8px' }}>
        {user ? (
          <>
            <span style={{ color: '#00f5ff', fontSize: '0.7rem', fontFamily: 'Orbitron, sans-serif' }}>
              {user.email}
            </span>
            <button className="btn-ghost" style={{ fontSize: '0.65rem', padding: '4px 10px' }} onClick={handleLogout}>
              LOGOUT
            </button>
          </>
        ) : (
          <button className="btn-ghost" style={{ fontSize: '0.65rem', padding: '4px 10px' }} onClick={() => setScreen('auth')}>
            LOGIN
          </button>
        )}
      </div>

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

        {showGameOver && (
          <div className="game-overlay">
            <div className="overlay-box">
              <h2 className="overlay-title">GAME OVER</h2>
              <p className="overlay-score">
                SCORE: <span>{gameOverScore.toLocaleString()}</span>
              </p>
              {!user && (
                <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '8px' }}>
                  ログインするとスコアをランキングに登録できます
                </p>
              )}
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

      {/* 認証画面 */}
      <section className={`screen${screen === 'auth' ? ' active' : ''}`}>
        <AuthScreen
          onSuccess={() => setScreen('title')}
          onBack={() => setScreen('title')}
        />
      </section>
    </>
  );
}
