// Script to generate sample audio files for demos
// Run with: npx tsx scripts/generate-samples.ts

import 'dotenv/config';
import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample configuration:
// - Morning = male voice (onyx) - energetic, confident
// - Evening = female voice (shimmer) - calm, soothing
// - RU = Russian text
// - EN = English text
const SAMPLES = {
  // Russian samples
  morning_ru: {
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
  voice: 'nova' | 'shimmer' | 'onyx' | 'echo';
  text: string;
  speed?: number;
  hd?: boolean;
}

async function generateSample(
  name: string,
  config: SampleConfig
): Promise<void> {
  console.log(`Generating ${name}...`);

  try {
    const response = await openai.audio.speech.create({
      model: config.hd ? 'tts-1-hd' : 'tts-1', // HD for better quality
      voice: config.voice,
      input: config.text,
      speed: config.speed || 1.0,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const outputPath = path.join(
      process.cwd(),
      'public',
      'audio',
      'samples',
      `${name}.mp3`
    );

    await writeFile(outputPath, buffer);
    console.log(`✓ Created: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to generate ${name}:`, error);
  }
}

async function main() {
  console.log('🎙️ Generating sample audio files...\n');

  // Ensure directory exists
  const samplesDir = path.join(process.cwd(), 'public', 'audio', 'samples');
  await mkdir(samplesDir, { recursive: true });

  // Generate all samples
  for (const [name, config] of Object.entries(SAMPLES)) {
    await generateSample(name, config as SampleConfig);
  }

  console.log('\n✅ All samples generated!');
  console.log('\nFiles created in: public/audio/samples/');
  console.log('- morning_ru.mp3 (male voice)');
  console.log('- evening_ru.mp3 (female voice)');
  console.log('- morning_en.mp3 (male voice)');
  console.log('- evening_en.mp3 (female voice)');
}

main().catch(console.error);
