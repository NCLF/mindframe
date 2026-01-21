// Script to generate PREMIUM sample audio files for demos
// Uses ElevenLabs eleven_v3 + binaural beats mixing
// Run with: npx tsx scripts/generate-samples.ts

import 'dotenv/config';
import { writeFile, mkdir, unlink, access } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// FFmpeg paths (Windows via winget)
const FFMPEG_BIN = process.env.FFMPEG_PATH ||
  'C:\\Users\\alexe\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin';
const FFMPEG = `"${FFMPEG_BIN}\\ffmpeg.exe"`;
const FFPROBE = `"${FFMPEG_BIN}\\ffprobe.exe"`;

// ElevenLabs API
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const ELEVENLABS_MODEL = 'eleven_v3'; // Latest expressive model

// Voice IDs from .env
const VOICE_IDS = {
  male_ru: process.env.ELEVENLABS_VOICE_MALE_RU || 'V5m6vjx8ZZJ2FshBoFmQ',
  female_ru: process.env.ELEVENLABS_VOICE_FEMALE_RU || 'fDCZsAcdsyHzhAOdNVXb',
  male_en: process.env.ELEVENLABS_VOICE_MALE_EN || 'RMSJCUQZ5aP84TBCul7v',
  female_en: process.env.ELEVENLABS_VOICE_FEMALE_EN || 'VWgyT3VwwgjcSDAT2wEa',
};

// Binaural file paths (relative to project root)
const BINAURAL_FILES = {
  gamma: 'public/audio/binaural/gamma_40hz.wav',  // Morning/Sport - energetic
  theta: 'public/audio/binaural/theta_6hz.wav',   // Evening - relaxation
};

// Mix config per scenario
const MIX_CONFIG = {
  morning: {
    binaural: 'gamma',
    voiceVolume: 0.85,
    binauralVolume: 0.45,
    fadeIn: 2,
    fadeOut: 3,
  },
  evening: {
    binaural: 'theta',
    voiceVolume: 0.75,
    binauralVolume: 0.55,
    fadeIn: 3,
    fadeOut: 5,
  },
};

// Voice settings for scenarios (eleven_v3 compatible)
// eleven_v3 stability must be: 0.0 (Creative), 0.5 (Natural), 1.0 (Robust)
const VOICE_SETTINGS = {
  morning: {
    stability: 0.5,        // Natural - balanced
    similarity_boost: 0.75,
  },
  evening: {
    stability: 1.0,        // Robust - stable, calm
    similarity_boost: 0.8,
  },
};

// Sample configuration:
// - Morning = male voice - energetic, confident
// - Evening = female voice - calm, soothing
// - RU = Russian text, EN = English text
// IMPORTANT: All affirmations in FIRST PERSON (Я/I) - user repeats them!
const SAMPLES = {
  // Russian samples (FIRST PERSON)
  morning_ru: {
    scenario: 'morning' as const,
    voiceId: VOICE_IDS.male_ru,
    locale: 'ru',
    text: `Доброе утро! [short pause] Новый день! Новые возможности!
[pause]
Я чувствую мощную энергию внутри себя!
[short pause]
Я полон силы! Решимости! Уверенности!
[pause]
Сегодня я сделаю мощный шаг к своим целям!
[short pause]
Я действую! Я способен на великое!`,
  },
  evening_ru: {
    scenario: 'evening' as const,
    voiceId: VOICE_IDS.female_ru,
    locale: 'ru',
    text: `Вечер. [pause] Я отпускаю всё напряжение дня.
[long pause]
Моё дыхание становится глубже и спокойнее.
[pause]
Каждый выдох уносит усталость. [short pause] Я заслужила этот отдых.
[pause]
Я позволяю себе расслабиться полностью.`,
  },
  // English samples (FIRST PERSON)
  morning_en: {
    scenario: 'morning' as const,
    voiceId: VOICE_IDS.male_en,
    locale: 'en',
    text: `Good morning! [short pause] A new day! New opportunities!
[pause]
I feel powerful energy rising within me!
[short pause]
I am full of strength! Determination! Confidence!
[pause]
Today I will take a powerful step towards my goals!
[short pause]
I act now! I am capable of greatness!`,
  },
  evening_en: {
    scenario: 'evening' as const,
    voiceId: VOICE_IDS.female_en,
    locale: 'en',
    text: `Evening has come. [pause] I release all the tension of the day.
[long pause]
My breathing becomes deeper and calmer.
[pause]
Each exhale carries away fatigue. [short pause] I deserve this rest.
[pause]
I allow myself to relax completely.`,
  },
};

interface SampleConfig {
  scenario: 'morning' | 'evening';
  voiceId: string;
  locale: string;
  text: string;
}

async function checkFfmpeg(): Promise<boolean> {
  try {
    await execAsync(`${FFMPEG} -version`);
    return true;
  } catch {
    return false;
  }
}

async function textToSpeechElevenLabs(
  text: string,
  voiceId: string,
  scenario: 'morning' | 'evening'
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your-elevenlabs-api-key') {
    throw new Error('ELEVENLABS_API_KEY is not set properly in .env');
  }

  const settings = VOICE_SETTINGS[scenario];

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
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function mixWithBinaural(
  voicePath: string,
  outputPath: string,
  scenario: 'morning' | 'evening'
): Promise<boolean> {
  const config = MIX_CONFIG[scenario];
  const binauralFile = BINAURAL_FILES[config.binaural as keyof typeof BINAURAL_FILES];
  const binauralPath = path.join(process.cwd(), binauralFile);

  // Check if binaural file exists
  try {
    await access(binauralPath);
  } catch {
    console.warn(`  ⚠ Binaural file not found: ${binauralPath}`);
    return false;
  }

  // Get voice duration
  let voiceDuration = 15; // default
  try {
    const probeCmd = `${FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${voicePath}"`;
    const { stdout: durationStr } = await execAsync(probeCmd);
    voiceDuration = parseFloat(durationStr.trim()) || 15;
  } catch (e) {
    console.warn('  ⚠ ffprobe failed:', e instanceof Error ? e.message : e);
    return false;
  }

  // Padding: binaural starts 2 sec before voice and ends 2 sec after
  const padBefore = 2;
  const padAfter = 2;
  const totalDuration = voiceDuration + padBefore + padAfter;
  const fadeOutStart = totalDuration - config.fadeOut;

  // ffmpeg command
  const ffmpegCmd = `${FFMPEG} -y -i "${voicePath}" -stream_loop -1 -i "${binauralPath}" -filter_complex "[0:a]adelay=${padBefore * 1000}|${padBefore * 1000},volume=${config.voiceVolume}[voice];[1:a]atrim=0:${totalDuration},volume=${config.binauralVolume},afade=t=in:st=0:d=${config.fadeIn},afade=t=out:st=${fadeOutStart}:d=${config.fadeOut}[binaural];[binaural][voice]amix=inputs=2:duration=first:dropout_transition=0,volume=1.5[out]" -map "[out]" -t ${totalDuration} -acodec libmp3lame -q:a 2 "${outputPath}"`;

  try {
    await execAsync(ffmpegCmd, { timeout: 60000 });
    return true;
  } catch (error) {
    console.error('  ✗ FFmpeg mixing failed:', error);
    return false;
  }
}

async function generateSample(
  name: string,
  config: SampleConfig
): Promise<void> {
  console.log(`\n🎙️ Generating ${name}...`);
  console.log(`   Voice: ${config.voiceId}`);
  console.log(`   Model: ${ELEVENLABS_MODEL}`);

  const samplesDir = path.join(process.cwd(), 'public', 'audio', 'samples');
  const voiceOnlyPath = path.join(samplesDir, `${name}_voice.mp3`);
  const finalPath = path.join(samplesDir, `${name}.mp3`);

  try {
    // Step 1: Generate voice with ElevenLabs eleven_v3
    console.log('  → Generating voice with ElevenLabs eleven_v3...');
    const voiceBuffer = await textToSpeechElevenLabs(
      config.text,
      config.voiceId,
      config.scenario
    );
    await writeFile(voiceOnlyPath, voiceBuffer);
    console.log(`  ✓ Voice generated (${(voiceBuffer.length / 1024).toFixed(1)} KB)`);

    // Step 2: Mix with binaural beats
    console.log(`  → Mixing with binaural (${config.scenario})...`);
    let mixed = false;
    try {
      mixed = await mixWithBinaural(voiceOnlyPath, finalPath, config.scenario);
    } catch (mixError) {
      console.warn('  ⚠ Mixing failed:', mixError instanceof Error ? mixError.message : mixError);
    }

    if (mixed) {
      console.log('  ✓ Mixed with binaural beats');
      // Clean up voice-only file
      await unlink(voiceOnlyPath).catch(() => {});
    } else {
      // Fallback: rename voice-only to final
      console.log('  ⚠ Using voice-only (no binaural - ffmpeg required)');
      const { rename } = await import('fs/promises');
      await rename(voiceOnlyPath, finalPath).catch(async () => {
        await writeFile(finalPath, voiceBuffer);
        await unlink(voiceOnlyPath).catch(() => {});
      });
    }

    console.log(`  ✓ Created: ${finalPath}`);
  } catch (error) {
    console.error(`  ✗ Failed to generate ${name}:`, error);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  MindFrame Premium Sample Generator');
  console.log('  ElevenLabs eleven_v3 + Binaural Beats');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check API key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your-elevenlabs-api-key') {
    console.error('❌ ELEVENLABS_API_KEY not set in .env!');
    console.error('   Please add your API key to mindframe/.env');
    process.exit(1);
  }
  console.log('✓ ElevenLabs API key found');

  // Check ffmpeg
  const hasFfmpeg = await checkFfmpeg();
  if (!hasFfmpeg) {
    console.warn('⚠ FFmpeg not found! Samples will be voice-only.');
  } else {
    console.log('✓ FFmpeg found');
  }

  // Show voice IDs being used
  console.log('\nVoice IDs:');
  console.log(`  Male RU:   ${VOICE_IDS.male_ru}`);
  console.log(`  Female RU: ${VOICE_IDS.female_ru}`);
  console.log(`  Male EN:   ${VOICE_IDS.male_en}`);
  console.log(`  Female EN: ${VOICE_IDS.female_en}`);

  // Ensure directory exists
  const samplesDir = path.join(process.cwd(), 'public', 'audio', 'samples');
  await mkdir(samplesDir, { recursive: true });

  // Generate all samples
  for (const [name, config] of Object.entries(SAMPLES)) {
    await generateSample(name, config as SampleConfig);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ All premium samples generated!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nFiles created in: public/audio/samples/');
  console.log('- morning_ru.mp3 (male voice + gamma 40Hz)');
  console.log('- evening_ru.mp3 (female voice + theta 6Hz)');
  console.log('- morning_en.mp3 (male voice + gamma 40Hz)');
  console.log('- evening_en.mp3 (female voice + theta 6Hz)');
}

main().catch(console.error);
