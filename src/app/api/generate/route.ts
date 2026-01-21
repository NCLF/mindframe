import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAffirmation } from '@/lib/llm';
import {
  textToSpeech,
  VOICE_PRESETS,
  getRecommendedVoice,
  getVoiceSettingsForSession,
  type ScenarioType,
  type VoiceGender,
  type VoiceProfile,
} from '@/lib/elevenlabs';

// Request validation schema
const generateRequestSchema = z.object({
  tags: z.array(z.string()).min(1),
  scenario: z.enum(['morning', 'evening', 'focus', 'sport', 'sos']),
  customText: z.string().optional(),
  language: z.enum(['ru', 'en']).default('ru'),
  voiceId: z.string().optional(),
  voiceGender: z.enum(['male', 'female']).optional(),
  voiceProfile: z.enum(['confidence', 'calmness', 'mentor', 'coach', 'whisper']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    const { tags, scenario, customText, language, voiceId, voiceGender, voiceProfile } = validatedData;

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
    // Priority: explicit voiceId > recommended voice for scenario+gender > default
    let selectedVoiceId: string;

    if (voiceId) {
      // Use explicitly provided voice ID
      selectedVoiceId = voiceId;
      console.log('[Generate] Using explicit voiceId:', selectedVoiceId);
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

    // Step 4: Convert text to speech using ElevenLabs
    // Try eleven_v3 first, fallback to eleven_multilingual_v2
    try {
      console.log('[Generate] Trying eleven_v3 with voice:', selectedVoiceId);
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
        console.error('[Generate] Both models failed:', v2Error);
        throw new Error(`TTS failed: ${v2Error instanceof Error ? v2Error.message : 'Unknown'}`);
      }
    }

    // Convert to base64 for response
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // TODO: Store in Supabase
    // TODO: Add binaural beats mixing
    // TODO: Upload to cloud storage

    return NextResponse.json({
      success: true,
      data: {
        text: generatedText,
        audio: {
          format: 'mp3',
          data: audioBase64,
        },
        metadata: {
          scenario,
          tags,
          language,
          voiceSettings,
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
