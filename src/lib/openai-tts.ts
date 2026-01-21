// OpenAI TTS Module for cost-optimized voice generation
// Used for free tier users (cheaper than ElevenLabs)
// Cost: ~$0.015 per 1,000 characters vs ElevenLabs ~$0.14 per generation

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI TTS voices
export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

// Voice descriptions for UI
export const OPENAI_VOICE_INFO: Record<OpenAIVoice, { name: string; description: string; gender: 'male' | 'female' | 'neutral' }> = {
  alloy: { name: 'Alloy', description: 'Balanced, neutral voice', gender: 'neutral' },
  echo: { name: 'Echo', description: 'Warm, engaging male voice', gender: 'male' },
  fable: { name: 'Fable', description: 'Expressive, British accent', gender: 'neutral' },
  onyx: { name: 'Onyx', description: 'Deep, authoritative male voice', gender: 'male' },
  nova: { name: 'Nova', description: 'Warm, friendly female voice', gender: 'female' },
  shimmer: { name: 'Shimmer', description: 'Clear, pleasant female voice', gender: 'female' },
};

// Gender to voice mapping (best voices for each gender)
export const GENDER_VOICE_MAP: Record<'male' | 'female', OpenAIVoice> = {
  female: 'nova',   // Warm, engaging - best for affirmations
  male: 'onyx',     // Deep, authoritative - good for motivation
};

// Scenario to voice mapping for better personalization
export const SCENARIO_VOICE_MAP: Record<string, { male: OpenAIVoice; female: OpenAIVoice }> = {
  morning: { male: 'echo', female: 'nova' },     // Energetic, warm
  evening: { male: 'onyx', female: 'shimmer' },  // Calm, soothing
  focus: { male: 'onyx', female: 'nova' },       // Clear, focused
  sport: { male: 'echo', female: 'nova' },       // Energetic
  sos: { male: 'onyx', female: 'shimmer' },      // Calming, grounding
};

export interface OpenAITTSOptions {
  text: string;
  voice?: OpenAIVoice;
  gender?: 'male' | 'female';
  scenario?: string;
  speed?: number;  // 0.25 to 4.0, default 1.0
}

/**
 * Generate speech using OpenAI TTS API
 * Much cheaper than ElevenLabs (~10x cost reduction)
 * Good quality for standard voices, no cloning capability
 */
export async function textToSpeechOpenAI(options: OpenAITTSOptions): Promise<Buffer> {
  const { text, voice, gender, scenario, speed = 1.0 } = options;

  // Determine voice to use
  let selectedVoice: OpenAIVoice;

  if (voice) {
    selectedVoice = voice;
  } else if (scenario && gender) {
    // Get scenario-specific voice for gender
    selectedVoice = SCENARIO_VOICE_MAP[scenario]?.[gender] || GENDER_VOICE_MAP[gender];
  } else if (gender) {
    selectedVoice = GENDER_VOICE_MAP[gender];
  } else {
    selectedVoice = 'nova'; // Default to nova (pleasant female voice)
  }

  // Clean text for TTS (remove pause tags as OpenAI doesn't support them)
  const cleanedText = text
    .replace(/\[short pause\]/gi, '...')
    .replace(/\[pause\]/gi, '... ')
    .replace(/\[long pause\]/gi, '... ... ');

  console.log('[OpenAI TTS] Generating speech:', {
    voice: selectedVoice,
    textLength: cleanedText.length,
    speed,
  });

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',  // Standard quality, cheaper
      voice: selectedVoice,
      input: cleanedText,
      speed: speed,
      response_format: 'mp3',
    });

    // Get buffer from response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[OpenAI TTS] Generated successfully, size:', buffer.length);

    return buffer;
  } catch (error) {
    console.error('[OpenAI TTS] Error:', error);
    throw new Error(`OpenAI TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Estimate cost for OpenAI TTS
 * Pricing: $15 per 1M characters (tts-1 model)
 */
export function estimateOpenAICost(text: string): number {
  const chars = text.length;
  const costPer1MChars = 15; // USD
  return (chars / 1_000_000) * costPer1MChars;
}

/**
 * Get recommended voice for gender and scenario
 */
export function getRecommendedOpenAIVoice(gender: 'male' | 'female', scenario?: string): OpenAIVoice {
  if (scenario && SCENARIO_VOICE_MAP[scenario]) {
    return SCENARIO_VOICE_MAP[scenario][gender];
  }
  return GENDER_VOICE_MAP[gender];
}
