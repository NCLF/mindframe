// ElevenLabs API Integration
// Docs: https://elevenlabs.io/docs/api-reference

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceSettings {
  stability: number; // 0-1, higher = more stable, lower = more emotional
  similarity_boost: number; // 0-1, how closely to match the original voice
  style?: number; // 0-1, style exaggeration (only for multilingual v2)
  use_speaker_boost?: boolean;
}

// Voice settings presets for different scenarios
export const VOICE_PRESETS: Record<string, VoiceSettings> = {
  morning: {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.7,
    use_speaker_boost: true,
  },
  evening: {
    stability: 0.8,
    similarity_boost: 0.85,
    style: 0.2,
    use_speaker_boost: false,
  },
  focus: {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.5,
    use_speaker_boost: true,
  },
  sport: {
    stability: 0.3,
    similarity_boost: 0.75,
    style: 0.9,
    use_speaker_boost: true,
  },
  sos: {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.4,
    use_speaker_boost: true,
  },
};

export interface TextToSpeechOptions {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
}

/**
 * Generate speech from text using ElevenLabs API
 */
export async function textToSpeech({
  text,
  voiceId,
  modelId = 'eleven_multilingual_v2',
  voiceSettings = VOICE_PRESETS.morning,
}: TextToSpeechOptions): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
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
        voice_settings: {
          stability: voiceSettings.stability,
          similarity_boost: voiceSettings.similarity_boost,
          style: voiceSettings.style ?? 0.5,
          use_speaker_boost: voiceSettings.use_speaker_boost ?? true,
        },
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
