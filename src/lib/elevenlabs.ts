// ElevenLabs API Integration
// Docs: https://elevenlabs.io/docs/api-reference
// Using eleven_v3 model with [pause], [short pause], [long pause] tags

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default model - eleven_v3 is the latest expressive model
export const DEFAULT_MODEL = 'eleven_v3';

// ============ Voice Types ============
export type VoiceGender = 'male' | 'female';
export type VoiceAge = 'young' | 'middle' | 'mature';
// Extended scenarios for crypto traders
export type ScenarioType = 'morning' | 'evening' | 'focus' | 'sport' | 'sos' | 'diamond_hands' | 'fomo_killer' | 'market_close';

// ============ Voice Beautification (Neuro-Biohacking Core Feature) ============
// "Idealized Voice" - not just cloning, but enhancing the voice
// User hears a more confident, calm, or mentor-like version of their voice
// NEW: Whale Voice for traders - cold, institutional, authoritative
export type VoiceProfile = 'confidence' | 'calmness' | 'mentor' | 'coach' | 'whisper' | 'whale' | 'institutional';

export interface VoiceProfileModifiers {
  stability: number;    // -0.3 to +0.3 adjustment
  similarity: number;   // -0.3 to +0.3 adjustment
  style: number;        // -0.3 to +0.3 adjustment
}

export interface VoiceProfileOption {
  id: VoiceProfile;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  icon: string; // Lucide icon name
  modifiers: VoiceProfileModifiers;
}

// Voice Beautification Profiles
// These modify the base voice settings to create an "idealized" version
export const BEAUTIFICATION_PROFILES: VoiceProfileOption[] = [
  {
    id: 'confidence',
    name: 'Confidence',
    nameRu: 'Уверенность',
    description: 'Dynamic, authoritative voice. Ideal for morning activation.',
    descriptionRu: 'Динамичный, авторитетный голос. Идеален для утренней активации.',
    icon: 'Zap',
    modifiers: { stability: -0.15, similarity: 0, style: 0.2 },
  },
  {
    id: 'calmness',
    name: 'Calmness',
    nameRu: 'Спокойствие',
    description: 'Smooth, soothing voice. Perfect for evening deactivation.',
    descriptionRu: 'Плавный, успокаивающий голос. Идеален для вечерней деактивации.',
    icon: 'Moon',
    modifiers: { stability: 0.2, similarity: 0.1, style: -0.2 },
  },
  {
    id: 'mentor',
    name: 'Mentor',
    nameRu: 'Ментор',
    description: 'Warm, wise voice. Like guidance from an experienced coach.',
    descriptionRu: 'Тёплый, мудрый голос. Как наставление опытного коуча.',
    icon: 'GraduationCap',
    modifiers: { stability: 0.1, similarity: -0.1, style: 0.1 },
  },
  {
    id: 'coach',
    name: 'Coach',
    nameRu: 'Тренер',
    description: 'Energetic, pushing voice. For sport and action.',
    descriptionRu: 'Энергичный, подталкивающий голос. Для спорта и действий.',
    icon: 'Dumbbell',
    modifiers: { stability: -0.1, similarity: 0, style: 0.3 },
  },
  {
    id: 'whisper',
    name: 'Whisper',
    nameRu: 'Шёпот',
    description: 'ASMR-like intimate voice. Deep relaxation and sleep.',
    descriptionRu: 'Интимный голос в стиле ASMR. Глубокое расслабление и сон.',
    icon: 'Wind',
    modifiers: { stability: 0.3, similarity: 0.1, style: -0.3 },
  },
  // === TRADER-SPECIFIC VOICE PROFILES ===
  {
    id: 'whale',
    name: 'Whale Voice',
    nameRu: 'Голос Кита',
    description: 'Cold, authoritative voice. The voice of someone who manages billions.',
    descriptionRu: 'Холодный, авторитетный голос. Голос человека, который управляет миллиардами.',
    icon: 'TrendingUp',
    modifiers: { stability: 0.25, similarity: -0.1, style: -0.2 },
  },
  {
    id: 'institutional',
    name: 'Institutional',
    nameRu: 'Институционал',
    description: 'Detached, emotionless voice. Pure discipline, no feelings.',
    descriptionRu: 'Отстранённый голос без эмоций. Чистая дисциплина, никаких чувств.',
    icon: 'Building2',
    modifiers: { stability: 0.35, similarity: -0.15, style: -0.35 },
  },
];

// Get profile by ID
export function getVoiceProfile(profileId: VoiceProfile): VoiceProfileOption {
  return BEAUTIFICATION_PROFILES.find(p => p.id === profileId) || BEAUTIFICATION_PROFILES[0];
}

// Recommended profile for each scenario
// Trader scenarios use whale/institutional profiles for cold, authoritative delivery
export const SCENARIO_PROFILE_MAP: Record<ScenarioType, VoiceProfile> = {
  morning: 'confidence',
  evening: 'calmness',
  focus: 'mentor',
  sport: 'coach',
  // Trader-specific scenarios - use cold, authoritative profiles
  sos: 'whale',           // Anti-Tilt: cold, authoritative to stop panic
  diamond_hands: 'whale', // Hold position: disciplined, confident
  fomo_killer: 'institutional', // Stop FOMO: detached, emotionless
  market_close: 'calmness', // Deep sleep: calming, peaceful
};

export interface VoiceOption {
  id: string;
  name: string;
  nameRu: string;
  gender: VoiceGender;
  age: VoiceAge;
  description: string;
  descriptionRu: string;
}

// ============ Predefined Voices by Gender/Age ============
// Using ElevenLabs standard library voices optimized for Russian
export const VOICE_OPTIONS: VoiceOption[] = [
  // Female voices
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    nameRu: 'Рейчел',
    gender: 'female',
    age: 'young',
    description: 'Calm, warm voice. Perfect for meditation and evening sessions.',
    descriptionRu: 'Спокойный, тёплый голос. Идеален для медитации и вечерних сессий.',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    nameRu: 'Белла',
    gender: 'female',
    age: 'young',
    description: 'Energetic, inspiring voice. Great for morning motivation.',
    descriptionRu: 'Энергичный, вдохновляющий голос. Отлично для утренней мотивации.',
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    nameRu: 'Элли',
    gender: 'female',
    age: 'middle',
    description: 'Confident, clear voice. Ideal for focus and work sessions.',
    descriptionRu: 'Уверенный, чёткий голос. Идеален для концентрации и работы.',
  },
  // Male voices
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    nameRu: 'Адам',
    gender: 'male',
    age: 'middle',
    description: 'Deep, authoritative voice. Strong for affirmations.',
    descriptionRu: 'Глубокий, авторитетный голос. Сильный для аффирмаций.',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    nameRu: 'Антони',
    gender: 'male',
    age: 'young',
    description: 'Friendly, warm voice. Great for daily practice.',
    descriptionRu: 'Дружелюбный, тёплый голос. Отлично для ежедневной практики.',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    nameRu: 'Арнольд',
    gender: 'male',
    age: 'mature',
    description: 'Powerful, motivating voice. Perfect for sport and action.',
    descriptionRu: 'Мощный, мотивирующий голос. Идеален для спорта и действий.',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    nameRu: 'Джош',
    gender: 'male',
    age: 'young',
    description: 'Calm, soothing voice. Good for relaxation.',
    descriptionRu: 'Спокойный, успокаивающий голос. Хорош для расслабления.',
  },
];

// Get voices filtered by gender
export function getVoicesByGender(gender: VoiceGender): VoiceOption[] {
  return VOICE_OPTIONS.filter(v => v.gender === gender);
}

// ============ Environment-based Voice IDs ============
// Premium voices configured in .env for optimal quality per language
export type LanguageCode = 'ru' | 'en';

/**
 * Get voice ID from environment variables
 * Falls back to default library voices if env vars not set
 */
export function getVoiceIdFromEnv(gender: VoiceGender, language: LanguageCode): string {
  const envKey = `ELEVENLABS_VOICE_${gender.toUpperCase()}_${language.toUpperCase()}`;
  const envVoiceId = process.env[envKey];

  if (envVoiceId) {
    return envVoiceId;
  }

  // Fallback to default library voices
  const fallbacks: Record<VoiceGender, string> = {
    female: '21m00Tcm4TlvDq8ikWAM', // Rachel
    male: 'pNInz6obpgDQGcFmaJgB',   // Adam
  };

  return fallbacks[gender];
}

/**
 * Get premium voice ID for gender and language
 * Uses env-configured voices optimized for each language
 */
export function getPremiumVoiceId(gender: VoiceGender, language: LanguageCode): string {
  return getVoiceIdFromEnv(gender, language);
}

// Get recommended voice for scenario and gender
export function getRecommendedVoice(scenario: ScenarioType, gender: VoiceGender): VoiceOption {
  const voicesByGender = getVoicesByGender(gender);

  // Recommendations based on scenario
  // Trader scenarios use deep, authoritative voices (Adam/Arnold for male)
  const recommendations: Record<ScenarioType, { female: string; male: string }> = {
    morning: { female: 'EXAVITQu4vr4xnSDxMaL', male: 'ErXwobaYiN019PkySvjV' }, // Bella/Antoni - energetic
    evening: { female: '21m00Tcm4TlvDq8ikWAM', male: 'TxGEqnHWrfWFTfGW9XjX' }, // Rachel/Josh - calm
    focus: { female: 'MF3mGyEYCl7XYWbV9V6O', male: 'pNInz6obpgDQGcFmaJgB' }, // Elli/Adam - confident
    sport: { female: 'EXAVITQu4vr4xnSDxMaL', male: 'VR6AewLTigWG4xSOukaG' }, // Bella/Arnold - powerful
    // Trader-specific: use deep, authoritative voices
    sos: { female: 'MF3mGyEYCl7XYWbV9V6O', male: 'pNInz6obpgDQGcFmaJgB' }, // Elli/Adam - cold authority
    diamond_hands: { female: 'MF3mGyEYCl7XYWbV9V6O', male: 'pNInz6obpgDQGcFmaJgB' }, // Elli/Adam - confident
    fomo_killer: { female: 'MF3mGyEYCl7XYWbV9V6O', male: 'pNInz6obpgDQGcFmaJgB' }, // Elli/Adam - detached
    market_close: { female: '21m00Tcm4TlvDq8ikWAM', male: 'TxGEqnHWrfWFTfGW9XjX' }, // Rachel/Josh - calming
  };

  const recommendedId = recommendations[scenario][gender];
  return voicesByGender.find(v => v.id === recommendedId) || voicesByGender[0];
}

export interface VoiceSettings {
  stability: number; // 0-1, higher = more stable, lower = more emotional
  similarity_boost: number; // 0-1, how closely to match the original voice
  style?: number; // 0-1, style exaggeration
  use_speaker_boost?: boolean;
}

// ============ Scenario-based Voice Settings ============
// Detailed settings for tempo, intonation, emotion per scenario
export const VOICE_PRESETS: Record<ScenarioType, VoiceSettings> = {
  // Morning: Energetic, uplifting, moderate pace
  // Lower stability = more expression, higher style = more energy
  morning: {
    stability: 0.45,        // More expressive
    similarity_boost: 0.75,
    style: 0.65,            // Energetic style
    use_speaker_boost: true,
  },
  // Evening: Calm, soothing, slow pace
  // Higher stability = calmer, lower style = subdued
  evening: {
    stability: 0.85,        // Very stable, calming
    similarity_boost: 0.80,
    style: 0.15,            // Minimal style, peaceful
    use_speaker_boost: false,
  },
  // Focus: Clear, confident, steady pace
  // Balanced settings for clarity
  focus: {
    stability: 0.65,        // Clear but not monotone
    similarity_boost: 0.80,
    style: 0.40,            // Moderate emphasis
    use_speaker_boost: true,
  },
  // Sport: Aggressive, powerful, fast pace
  // Low stability = max expression, high style = intensity
  sport: {
    stability: 0.30,        // Maximum expression
    similarity_boost: 0.70,
    style: 0.85,            // High intensity
    use_speaker_boost: true,
  },
  // SOS / Anti-Tilt: Cold, authoritative, grounding
  // High stability for calm authority, low style for emotionless delivery
  sos: {
    stability: 0.80,        // Very stable, authoritative
    similarity_boost: 0.70,
    style: 0.20,            // Minimal emotion, cold
    use_speaker_boost: true,
  },
  // === TRADER-SPECIFIC SCENARIO PRESETS ===
  // Diamond Hands: Confident, disciplined, steady
  diamond_hands: {
    stability: 0.75,        // Steady confidence
    similarity_boost: 0.75,
    style: 0.30,            // Confident but not emotional
    use_speaker_boost: true,
  },
  // FOMO Killer: Cold, questioning, detached
  fomo_killer: {
    stability: 0.85,        // Very stable, detached
    similarity_boost: 0.65,
    style: 0.15,            // Emotionless, institutional
    use_speaker_boost: false,
  },
  // Market Close: Calming, sleep-inducing, slow
  market_close: {
    stability: 0.90,        // Maximum stability for sleep
    similarity_boost: 0.80,
    style: 0.10,            // Minimal expression, peaceful
    use_speaker_boost: false,
  },
};

// Apply voice beautification profile to base settings
// Returns modified settings with profile modifiers applied
export function applyVoiceBeautification(
  baseSettings: VoiceSettings,
  profile: VoiceProfile
): VoiceSettings {
  const profileData = getVoiceProfile(profile);
  const { modifiers } = profileData;

  // Clamp values between 0 and 1
  const clamp = (val: number) => Math.max(0, Math.min(1, val));

  return {
    stability: clamp(baseSettings.stability + modifiers.stability),
    similarity_boost: clamp(baseSettings.similarity_boost + modifiers.similarity),
    style: clamp((baseSettings.style ?? 0.5) + modifiers.style),
    use_speaker_boost: baseSettings.use_speaker_boost,
  };
}

// Get combined voice settings for scenario + profile
export function getVoiceSettingsForSession(
  scenario: ScenarioType,
  profile?: VoiceProfile
): VoiceSettings {
  const baseSettings = VOICE_PRESETS[scenario];
  const effectiveProfile = profile ?? SCENARIO_PROFILE_MAP[scenario];
  return applyVoiceBeautification(baseSettings, effectiveProfile);
}

export interface TextToSpeechOptions {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
  voiceProfile?: VoiceProfile; // Optional: apply beautification profile
}

/**
 * Generate speech from text using ElevenLabs API
 * Uses eleven_v3 model which supports [pause], [short pause], [long pause] tags
 */
export async function textToSpeech({
  text,
  voiceId,
  modelId = DEFAULT_MODEL,
  voiceSettings = VOICE_PRESETS.morning,
}: TextToSpeechOptions): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  // Build voice settings - eleven_v3 doesn't support use_speaker_boost
  const isV3 = modelId === 'eleven_v3';
  const voiceSettingsPayload: Record<string, number | boolean> = {
    stability: voiceSettings.stability,
    similarity_boost: voiceSettings.similarity_boost,
  };

  // Only add style and speaker_boost for non-v3 models
  if (!isV3) {
    voiceSettingsPayload.style = voiceSettings.style ?? 0.5;
    voiceSettingsPayload.use_speaker_boost = voiceSettings.use_speaker_boost ?? true;
  }

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettingsPayload,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

export interface CloneVoiceOptions {
  name: string;
  audioSamples: Blob[];
  description?: string;
}

/**
 * Clone a voice using Instant Voice Cloning
 * Requires 1-2 minutes of clean audio
 */
export async function cloneVoice({
  name,
  audioSamples,
  description,
}: CloneVoiceOptions): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  const formData = new FormData();
  formData.append('name', name);

  audioSamples.forEach((sample, index) => {
    formData.append('files', sample, `sample_${index}.mp3`);
  });

  if (description) {
    formData.append('description', description);
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices/add`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voice cloning failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.voice_id;
}

/**
 * Get list of available voices
 */
export async function getVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  const data = await response.json();
  return data.voices;
}

/**
 * Delete a cloned voice
 */
export async function deleteVoice(voiceId: string): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete voice: ${response.status}`);
  }
}
