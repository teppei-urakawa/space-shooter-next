'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          // トリガーで自動作成されたプロフィールのユーザー名を更新
          await supabase
            .from('profiles')
            .update({ username })
            .eq('id', data.user.id);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ranking-content">
      <h2 className="section-title">{mode === 'login' ? 'LOGIN' : 'SIGN UP'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
        {mode === 'signup' && (
          <input
            className="auth-input"
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={2}
            maxLength={20}
          />
        )}
        <input
          className="auth-input"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p style={{ color: '#ff4444', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}

        <button className="btn-neon" type="submit" disabled={loading}>
          <span>{loading ? '...' : mode === 'login' ? 'LOGIN' : 'SIGN UP'}</span>
        </button>
      </form>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <button
          className="btn-ghost"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        >
          {mode === 'login' ? 'アカウント作成はこちら' : 'ログインはこちら'}
        </button>
        <button className="btn-ghost" onClick={onBack}>BACK</button>
      </div>
    </div>
  );
}
