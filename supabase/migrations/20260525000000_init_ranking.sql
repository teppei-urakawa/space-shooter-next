CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  color_id TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  color_label TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "scores_select"   ON scores   FOR SELECT USING (true);
CREATE POLICY "scores_insert"   ON scores   FOR INSERT WITH CHECK (auth.uid() = user_id);
