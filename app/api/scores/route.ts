import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty');
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100);

  const supabase = await createClient();
  let query = supabase
    .from('scores')
    .select('id, username, score, color_hex, color_label, difficulty, played_at')
    .order('score', { ascending: false })
    .limit(limit);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { score, colorId, colorHex, colorLabel, difficulty } = await request.json();
  if (typeof score !== 'number' || score < 0 || score > 10_000_000) {
    return NextResponse.json({ error: '不正なスコアです' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'プロフィールが見つかりません' }, { status: 404 });
  }

  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    username: profile.username,
    score,
    color_id: colorId,
    color_hex: colorHex,
    color_label: colorLabel,
    difficulty,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
