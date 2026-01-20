-- MindFrame Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE binaural_preset AS ENUM ('alpha', 'beta', 'gamma', 'theta', 'delta');
CREATE TYPE input_type AS ENUM ('tags', 'voice', 'text');
CREATE TYPE voice_type AS ENUM ('default', 'cloned');
CREATE TYPE tag_category AS ENUM ('goal', 'emotion', 'situation');
CREATE TYPE payment_provider AS ENUM ('telegram_stars', 'lemon_squeezy', 'yookassa');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');
CREATE TYPE referral_status AS ENUM ('pending', 'converted', 'paid');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id BIGINT UNIQUE,
  display_name TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  voice_clone_id TEXT,
  referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by UUID REFERENCES profiles(id),
  generations_count INT DEFAULT 0,
  generations_limit INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenarios table
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ru TEXT,
  description_en TEXT,
  system_prompt TEXT NOT NULL,
  voice_settings JSONB DEFAULT '{"stability": 0.5, "similarity_boost": 0.75, "style": 0.5}'::jsonb,
  binaural_preset binaural_preset DEFAULT 'alpha',
  audio_background TEXT,
  is_premium BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category tag_category DEFAULT 'goal',
  prompt_snippet TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES scenarios(id),
  input_type input_type NOT NULL,
  input_tags UUID[],
  input_text TEXT,
  input_audio_url TEXT,
  generated_text TEXT,
  voice_type voice_type DEFAULT 'default',
  voice_id TEXT,
  tts_audio_url TEXT,
  final_audio_url TEXT,
  audio_duration_seconds INT,
  binaural_frequency TEXT,
  processing_status processing_status DEFAULT 'pending',
  error_message TEXT,
  llm_tokens_used INT,
  tts_characters_used INT,
  estimated_cost_usd DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library table
CREATE TABLE library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  is_favorite BOOLEAN DEFAULT false,
  play_count INT DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, generation_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider payment_provider NOT NULL,
  provider_subscription_id TEXT,
  tier subscription_tier NOT NULL,
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status referral_status DEFAULT 'pending',
  commission_amount DECIMAL(10, 2),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- Indexes for performance
CREATE INDEX idx_profiles_telegram ON profiles(telegram_id);
CREATE INDEX idx_profiles_referral ON profiles(referral_code);
CREATE INDEX idx_generations_user ON generations(user_id);
CREATE INDEX idx_generations_status ON generations(processing_status);
CREATE INDEX idx_library_user ON library(user_id);
CREATE INDEX idx_library_favorite ON library(user_id, is_favorite);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Generations: users can CRUD their own generations
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Library: users can CRUD their own library items
CREATE POLICY "Users can view own library" ON library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to library" ON library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own library" ON library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from library" ON library
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Referrals: users can view referrals they made
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

-- Scenarios and Tags: public read access
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scenarios" ON scenarios
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read tags" ON tags
  FOR SELECT USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data: Default scenarios
INSERT INTO scenarios (slug, name_ru, name_en, description_ru, description_en, system_prompt, voice_settings, binaural_preset, sort_order) VALUES
('morning', 'Утренний заряд', 'Morning Boost', 'Настройся на продуктивный день', 'Set yourself up for a productive day',
'Ты - внутренний голос пользователя, энергичный наставник. Создай утреннюю аффирмацию для настройки на продуктивный день. Стиль: энергичный, утвердительный, вдохновляющий. Используй короткие, ритмичные предложения. Обращайся от первого лица ("Я чувствую...", "Я готов..."). Длина: 200-300 слов.',
'{"stability": 0.5, "similarity_boost": 0.8, "style": 0.7}'::jsonb, 'beta', 1),

('evening', 'Вечернее расслабление', 'Evening Relaxation', 'Отпусти напряжение и подготовься ко сну', 'Release tension and prepare for sleep',
'Ты - внутренний голос пользователя, мягкий и успокаивающий. Создай вечернюю аффирмацию для глубокого расслабления и сна. Стиль: тягучий, медитативный, убаюкивающий. Длинные плавные предложения с паузами. Метафоры тепла, мягкости, безопасности. Длина: 250-350 слов.',
'{"stability": 0.8, "similarity_boost": 0.85, "style": 0.2}'::jsonb, 'theta', 2),

('focus', 'Концентрация', 'Focus', 'Войди в состояние потока', 'Enter the flow state',
'Ты - внутренний голос пользователя, сфокусированный ментор. Создай аффирмацию для глубокой концентрации и входа в состояние потока. Стиль: четкий, уверенный, направляющий внимание. Короткие предложения, паузы для осознания. Длина: 200-250 слов.',
'{"stability": 0.7, "similarity_boost": 0.8, "style": 0.5}'::jsonb, 'alpha', 3),

('sport', 'Спорт', 'Sport', 'Преодолей физические барьеры', 'Break through physical barriers',
'Ты - внутренний голос спортсмена, жесткий тренер. Создай мотивационную аффирмацию для преодоления физических барьеров. Стиль: агрессивный, командный, без жалости к себе. Короткие рубленые фразы. Императивы. Обращайся от первого лица. Длина: 150-200 слов.',
'{"stability": 0.3, "similarity_boost": 0.75, "style": 0.9}'::jsonb, 'beta', 4);

-- Seed data: Default tags
INSERT INTO tags (slug, name_ru, name_en, category, prompt_snippet, sort_order) VALUES
('concentration', 'Концентрация', 'Focus', 'goal', 'Фокус на: глубокая концентрация, ясность ума, отсутствие отвлечений.', 1),
('calm', 'Спокойствие', 'Calm', 'emotion', 'Фокус на: внутренний покой, расслабление, отпускание тревоги.', 2),
('energy', 'Энергия', 'Energy', 'emotion', 'Фокус на: прилив сил, бодрость, активность, жизненная энергия.', 3),
('confidence', 'Уверенность', 'Confidence', 'emotion', 'Фокус на: уверенность в себе, самоценность, внутренняя сила.', 4),
('creativity', 'Творчество', 'Creativity', 'goal', 'Фокус на: творческий поток, вдохновение, нестандартное мышление.', 5),
('sleep', 'Сон', 'Sleep', 'goal', 'Фокус на: глубокий сон, расслабление перед сном, отпускание дня.', 6),
('motivation', 'Мотивация', 'Motivation', 'emotion', 'Фокус на: внутренняя мотивация, желание действовать, преодоление лени.', 7);
