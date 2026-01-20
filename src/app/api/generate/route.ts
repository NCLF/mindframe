import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAffirmation } from '@/lib/llm';
import { textToSpeech, VOICE_PRESETS } from '@/lib/elevenlabs';

// Request validation schema
const generateRequestSchema = z.object({
  tags: z.array(z.string()).min(1),
  scenario: z.enum(['morning', 'evening', 'focus', 'sport', 'sos']),
  customText: z.string().optional(),
  language: z.enum(['ru', 'en']).default('ru'),
  voiceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    const { tags, scenario, customText, language, voiceId } = validatedData;

    // Step 1: Generate affirmation text using LLM
    const generatedText = await generateAffirmation({
      scenario,
      tags,
      customText,
      language,
    });

    // Step 2: Convert text to speech using ElevenLabs
    const defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const voiceSettings = VOICE_PRESETS[scenario] || VOICE_PRESETS.morning;

    const audioBuffer = await textToSpeech({
      text: generatedText,
      voiceId: voiceId || defaultVoiceId,
      voiceSettings,
    });

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
    console.error('Generation error:', error);

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

    return NextResponse.json(
      {
        success: false,
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
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
