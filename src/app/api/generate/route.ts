import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAffirmation } from '@/lib/llm';
import {
  textToSpeech,
  VOICE_PRESETS,
  getRecommendedVoice,
  getVoiceSettingsForSession,
  getPremiumVoiceId,
  type ScenarioType,
  type VoiceGender,
  type VoiceProfile,
  type LanguageCode,
} from '@/lib/elevenlabs';
import { textToSpeechOpenAI } from '@/lib/openai-tts';
import { mixAudioWithBinaural } from '@/lib/audio/server-mixer';
import { getBinauralForScenario } from '@/lib/audio/binaural';

// Request validation schema
const generateRequestSchema = z.object({
  tags: z.array(z.string()).min(1),
  scenario: z.enum(['morning', 'evening', 'focus', 'sport', 'sos']),
  customText: z.string().optional(),
  language: z.enum(['ru', 'en']).default('ru'),
  voiceId: z.string().optional(),
  voiceGender: z.enum(['male', 'female']).optional(),
  voiceProfile: z.enum(['confidence', 'calmness', 'mentor', 'coach', 'whisper']).optional(),
  binauralBeatsEnabled: z.boolean().default(true),
  // Premium voice uses ElevenLabs with full features
  // Free tier uses OpenAI TTS (cheaper, no cloning)
  usePremiumVoice: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    const { tags, scenario, customText, language, voiceId, voiceGender, voiceProfile, binauralBeatsEnabled, usePremiumVoice } = validatedData;

    console.log('[Generate] Starting generation:', { scenario, tags, language, voiceGender, voiceProfile });

    // Step 1: Generate affirmation text using LLM
    let generatedText: string;
    try {
      generatedText = await generateAffirmation({
        scenario,
        tags,
        customText,
        language,
      });
      console.log('[Generate] Text generated, length:', generatedText.length);
    } catch (llmError) {
      console.error('[Generate] LLM error:', llmError);
      throw new Error(`LLM failed: ${llmError instanceof Error ? llmError.message : 'Unknown'}`);
    }

    // Step 2: Determine voice to use
    // Priority: explicit voiceId > premium voice from env > recommended voice for scenario+gender > default
    let selectedVoiceId: string;
    const effectiveGender = (voiceGender || 'female') as VoiceGender;

    if (voiceId) {
      // Use explicitly provided voice ID (e.g., cloned voice)
      selectedVoiceId = voiceId;
      console.log('[Generate] Using explicit voiceId:', selectedVoiceId);
    } else if (usePremiumVoice) {
      // Premium: use env-configured voices optimized for the language
      selectedVoiceId = getPremiumVoiceId(effectiveGender, language as LanguageCode);
      console.log('[Generate] Using premium voice from env:', selectedVoiceId, 'for', effectiveGender, language);
    } else if (voiceGender) {
      // Get recommended voice for this scenario and gender
      const recommendedVoice = getRecommendedVoice(scenario as ScenarioType, voiceGender as VoiceGender);
      selectedVoiceId = recommendedVoice.id;
      console.log('[Generate] Using recommended voice:', recommendedVoice.name, 'for', scenario, voiceGender);
    } else {
      // Fallback to default
      selectedVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
      console.log('[Generate] Using default voiceId:', selectedVoiceId);
    }

    // Step 3: Get voice settings for scenario with voice beautification profile
    // Uses getVoiceSettingsForSession which applies profile modifiers on top of scenario presets
    const voiceSettings = getVoiceSettingsForSession(
      scenario as ScenarioType,
      voiceProfile as VoiceProfile | undefined
    );
    console.log('[Generate] Voice settings with profile:', { voiceProfile, voiceSettings });

    let audioBuffer: ArrayBuffer;
    let ttsProvider: 'elevenlabs' | 'openai' = 'openai';

    // Step 4: Convert text to speech
    // Premium users get ElevenLabs (with cloning, beautification)
    // Free tier users get OpenAI TTS (cheaper, good quality, no cloning)
    if (usePremiumVoice) {
      // Premium: Use ElevenLabs
      ttsProvider = 'elevenlabs';
      try {
        console.log('[Generate] Premium voice: Trying eleven_v3 with voice:', selectedVoiceId);
        audioBuffer = await textToSpeech({
          text: generatedText,
          voiceId: selectedVoiceId,
          voiceSettings,
          modelId: 'eleven_v3',
        });
        console.log('[Generate] eleven_v3 success');
      } catch (v3Error) {
        console.warn('[Generate] eleven_v3 failed, trying fallback:', v3Error);

        // Strip pause tags for v2 model (it doesn't support them)
        const textForV2 = generatedText
          .replace(/\[short pause\]/gi, '...')
          .replace(/\[pause\]/gi, '... ')
          .replace(/\[long pause\]/gi, '... ... ');

        try {
          audioBuffer = await textToSpeech({
            text: textForV2,
            voiceId: selectedVoiceId,
            voiceSettings,
            modelId: 'eleven_multilingual_v2',
          });
          console.log('[Generate] eleven_multilingual_v2 fallback success');
        } catch (v2Error) {
          console.error('[Generate] Both ElevenLabs models failed:', v2Error);
          throw new Error(`TTS failed: ${v2Error instanceof Error ? v2Error.message : 'Unknown'}`);
        }
      }
    } else {
      // Free tier: Use OpenAI TTS (much cheaper)
      ttsProvider = 'openai';
      try {
        console.log('[Generate] Free tier: Using OpenAI TTS, gender:', voiceGender);
        const openAIBuffer = await textToSpeechOpenAI({
          text: generatedText,
          gender: voiceGender as 'male' | 'female' | undefined,
          scenario,
        });
        // Convert Buffer to ArrayBuffer
        audioBuffer = openAIBuffer.buffer.slice(
          openAIBuffer.byteOffset,
          openAIBuffer.byteOffset + openAIBuffer.byteLength
        );
        console.log('[Generate] OpenAI TTS success');
      } catch (openAIError) {
        console.error('[Generate] OpenAI TTS failed:', openAIError);
        throw new Error(`OpenAI TTS failed: ${openAIError instanceof Error ? openAIError.message : 'Unknown'}`);
      }
    }

    // Step 5: Mix with binaural beats if enabled
    let finalAudioBuffer = Buffer.from(audioBuffer);
    let hasBinaural = false;
    let audioFormat: 'mp3' | 'wav' = 'mp3';

    if (binauralBeatsEnabled) {
      try {
        console.log('[Generate] Mixing with binaural beats for scenario:', scenario);
        const mixResult = await mixAudioWithBinaural(
          finalAudioBuffer,
          scenario as ScenarioType,
          true
        );
        finalAudioBuffer = mixResult.buffer;
        hasBinaural = mixResult.hasBinaural;
        audioFormat = mixResult.format;
        console.log('[Generate] Binaural mixing result:', { hasBinaural, format: audioFormat });
      } catch (mixError) {
        console.warn('[Generate] Binaural mixing failed, using voice only:', mixError);
      }
    }

    // Convert to base64 for response
    const audioBase64 = finalAudioBuffer.toString('base64');

    // Get binaural info for response
    const binauralConfig = getBinauralForScenario(scenario as ScenarioType);

    // TODO: Store in Supabase
    // TODO: Upload to cloud storage

    return NextResponse.json({
      success: true,
      data: {
        text: generatedText,
        audio: {
          format: audioFormat,
          data: audioBase64,
        },
        metadata: {
          scenario,
          tags,
          language,
          voiceSettings,
          ttsProvider,
          isPremium: usePremiumVoice,
          binaural: {
            enabled: binauralBeatsEnabled,
            mixed: hasBinaural,
            preset: binauralConfig.preset,
            description: binauralConfig.descriptionRu,
            effect: binauralConfig.effectRu,
          },
        },
      },
    });
  } catch (error) {
    console.error('[Generate] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'MindFrame Generation API',
    version: '1.0.0',
  });
}
// ENV 1768922601
// Connected 1768923860
