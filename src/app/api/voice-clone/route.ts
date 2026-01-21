import { NextRequest, NextResponse } from 'next/server';
import { cloneVoice } from '@/lib/elevenlabs';

export const runtime = 'nodejs';
export const maxDuration = 60; // Voice cloning can take time

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const userName = formData.get('userName') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate audio file
    const allowedTypes = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];
    if (!allowedTypes.some(type => audioFile.type.startsWith(type.split('/')[0]))) {
      return NextResponse.json(
        { error: 'Invalid audio format' },
        { status: 400 }
      );
    }

    // Convert File to Blob for cloneVoice
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

    // Generate unique voice name
    const timestamp = Date.now();
    const voiceName = userName
      ? `${userName}_${timestamp}`
      : `user_voice_${timestamp}`;

    // Clone the voice using ElevenLabs
    const voiceId = await cloneVoice({
      name: voiceName,
      audioSamples: [audioBlob],
      description: 'User cloned voice for MindFrame neuro-sessions',
    });

    return NextResponse.json({
      success: true,
      voiceId,
      voiceName,
    });
  } catch (error) {
    console.error('Voice clone error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Check for specific ElevenLabs errors
    if (message.includes('401')) {
      return NextResponse.json(
        { error: 'API authentication failed. Please check API key.' },
        { status: 500 }
      );
    }

    if (message.includes('429')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (message.includes('quota') || message.includes('limit')) {
      return NextResponse.json(
        { error: 'Voice clone quota exceeded.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Voice cloning failed. Please try again.' },
      { status: 500 }
    );
  }
}
