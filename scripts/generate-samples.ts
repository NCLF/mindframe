// Script to generate sample audio files for demos WITH binaural beats
// Run with: npx tsx scripts/generate-samples.ts

import 'dotenv/config';
import OpenAI from 'openai';
import { writeFile, mkdir, unlink, access } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// FFmpeg paths (Windows via winget)
const FFMPEG_BIN = process.env.FFMPEG_PATH ||
  'C:\\Users\\alexe\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin';
const FFMPEG = `"${FFMPEG_BIN}\\ffmpeg.exe"`;
const FFPROBE = `"${FFMPEG_BIN}\\ffprobe.exe"`;

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

// Sample configuration:
// - Morning = male voice (onyx) - energetic, confident
// - Evening = female voice (shimmer) - calm, soothing
// - RU = Russian text
// - EN = English text
const SAMPLES = {
  // Russian samples
  morning_ru: {
    scenario: 'morning' as const,
    voice: 'onyx' as const, // Male voice for morning
    speed: 1.05, // Slightly faster for energy
    hd: true,    // HD quality
    text: `Доброе утро! Новый день! Новые возможности!
Ты чувствуешь мощную энергию внутри себя!
Сила! Решимость! Уверенность!
Сегодня ты сделаешь мощный шаг к своим целям!
Действуй! Ты способен на великое!`,
  },
  evening_ru: {
    scenario: 'evening' as const,
    voice: 'shimmer' as const, // Female voice for evening
    speed: 0.92, // Slower for relaxation
    hd: true,
    text: `Вечер. Время отпустить всё напряжение дня.
Твоё дыхание становится глубже и спокойнее.
Каждый выдох уносит усталость. Ты заслужил этот отдых.
Позволь себе расслабиться полностью.`,
  },
  // English samples
  morning_en: {
    scenario: 'morning' as const,
    voice: 'onyx' as const, // Male voice for morning
    speed: 1.05,
    hd: true,
    text: `Good morning! A new day! New opportunities!
You feel powerful energy rising within you!
Strength! Determination! Confidence!
Today you will take a powerful step towards your goals!
Act now! You are capable of greatness!`,
  },
  evening_en: {
    scenario: 'evening' as const,
    voice: 'shimmer' as const, // Female voice for evening
    speed: 0.92,
    hd: true,
    text: `Evening has come. Time to release all the tension of the day.
Your breathing becomes deeper and calmer.
Each exhale carries away fatigue. You deserve this rest.
Allow yourself to relax completely.`,
  },
};

interface SampleConfig {
  scenario: 'morning' | 'evening';
  voice: 'nova' | 'shimmer' | 'onyx' | 'echo';
  text: string;
  speed?: number;
  hd?: boolean;
}

async function checkFfmpeg(): Promise<boolean> {
  try {
    await execAsync(`${FFMPEG} -version`);
    return true;
  } catch {
    return false;
  }
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
    console.warn('  ⚠ ffprobe not available, using default duration:', e instanceof Error ? e.message : e);
    return false;
  }

  // Padding: binaural starts 2 sec before voice and ends 2 sec after
  const padBefore = 2;
  const padAfter = 2;
  const totalDuration = voiceDuration + padBefore + padAfter;
  const fadeOutStart = totalDuration - config.fadeOut;

  // ffmpeg command - same logic as server-mixer.ts
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
  console.log(`\nGenerating ${name}...`);

  const samplesDir = path.join(process.cwd(), 'public', 'audio', 'samples');
  const voiceOnlyPath = path.join(samplesDir, `${name}_voice.mp3`);
  const finalPath = path.join(samplesDir, `${name}.mp3`);

  try {
    // Step 1: Generate voice with OpenAI TTS
    console.log('  → Generating voice with OpenAI TTS...');
    const response = await openai.audio.speech.create({
      model: config.hd ? 'tts-1-hd' : 'tts-1',
      voice: config.voice,
      input: config.text,
      speed: config.speed || 1.0,
      response_format: 'mp3',
    });

    const voiceBuffer = Buffer.from(await response.arrayBuffer());
    await writeFile(voiceOnlyPath, voiceBuffer);
    console.log('  ✓ Voice generated');

    // Step 2: Mix with binaural beats (if ffmpeg available)
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
        // If rename fails, copy and delete
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
  console.log('🎙️ Generating sample audio files with binaural beats...\n');

  // Check ffmpeg
  const hasFfmpeg = await checkFfmpeg();
  if (!hasFfmpeg) {
    console.warn('⚠ FFmpeg not found! Samples will be voice-only.');
    console.warn('  Install ffmpeg for binaural beats mixing.\n');
  } else {
    console.log('✓ FFmpeg found\n');
  }

  // Ensure directory exists
  const samplesDir = path.join(process.cwd(), 'public', 'audio', 'samples');
  await mkdir(samplesDir, { recursive: true });

  // Generate all samples
  for (const [name, config] of Object.entries(SAMPLES)) {
    await generateSample(name, config as SampleConfig);
  }

  console.log('\n✅ All samples generated!');
  console.log('\nFiles created in: public/audio/samples/');
  console.log('- morning_ru.mp3 (male voice + gamma 40Hz binaural)');
  console.log('- evening_ru.mp3 (female voice + theta 6Hz binaural)');
  console.log('- morning_en.mp3 (male voice + gamma 40Hz binaural)');
  console.log('- evening_en.mp3 (female voice + theta 6Hz binaural)');
}

main().catch(console.error);
