-- Włączenie rozszerzenia wektorowego pgvector dla pamięci semantycznej
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profile użytkowników i relacji
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Tobiasz',
  companion_name TEXT NOT NULL DEFAULT 'Mira',
  preferred_tone TEXT DEFAULT 'warm_gentle',
  days_together INT DEFAULT 28,
  current_mood TEXT DEFAULT 'peaceful',
  daily_streak INT DEFAULT 6,
  subscription_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Wiadomości i notatki głosowe
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'companion')),
  text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  voice_meta JSONB,
  mood_context TEXT,
  suggested_actions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mapa relacji (osoby w życiu użytkownika)
CREATE TABLE IF NOT EXISTS people_in_life (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('supportive', 'stressful', 'complicated', 'neutral')),
  notes TEXT,
  last_mentioned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pamięć semantyczna i fakty z wektorami
CREATE TABLE IF NOT EXISTS life_memories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  confidence FLOAT DEFAULT 0.95,
  extracted_at TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Kronika przetrwania (pokonane kryzysy)
CREATE TABLE IF NOT EXISTS overcome_crises (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  how_you_survived TEXT NOT NULL,
  strength_demonstrated TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Skarbiec zwycięstw (listy wsparcia)
CREATE TABLE IF NOT EXISTS victory_letters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Włączenie RLS (Row Level Security) dla wszystkich tabel
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_in_life ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE overcome_crises ENABLE ROW LEVEL SECURITY;
ALTER TABLE victory_letters ENABLE ROW LEVEL SECURITY;

-- Polityki anonimowego dostępu dla frontendu (public demo/local identity)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access user_profiles') THEN
    CREATE POLICY 'Allow public access user_profiles' ON user_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access messages') THEN
    CREATE POLICY 'Allow public access messages' ON messages FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access people_in_life') THEN
    CREATE POLICY 'Allow public access people_in_life' ON people_in_life FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access life_memories') THEN
    CREATE POLICY 'Allow public access life_memories' ON life_memories FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access overcome_crises') THEN
    CREATE POLICY 'Allow public access overcome_crises' ON overcome_crises FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access victory_letters') THEN
    CREATE POLICY 'Allow public access victory_letters' ON victory_letters FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
