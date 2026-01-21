// Server-side audio mixing for binaural beats integration
// Uses ffmpeg through command line execution

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import type { ScenarioType } from '../elevenlabs';
import { SCENARIO_BINAURAL_MAP, BINAURAL_SERVER_PATHS, SCENARIO_MIX_CONFIG, type BinauralPreset } from './binaural';

const execAsync = promisify(exec);

/**
 * Mix voice audio with binaural beats on the server using ffmpeg
 * Falls back to voice-only if ffmpeg is not available
 */
export async function mixAudioWithBinaural(
  voiceBuffer: Buffer,
  scenario: ScenarioType,
  binauralEnabled: boolean = true
): Promise<{ buffer: Buffer; format: 'mp3' | 'wav'; hasBinaural: boolean }> {
  // If binaural is disabled, return voice only
  if (!binauralEnabled) {
    return { buffer: voiceBuffer, format: 'mp3', hasBinaural: false };
  }

  const binauralPreset = SCENARIO_BINAURAL_MAP[scenario];
  const mixConfig = SCENARIO_MIX_CONFIG[scenario];

  // Create temp directory for processing
  const tempDir = path.join(os.tmpdir(), 'mindframe-audio');
  await fs.mkdir(tempDir, { recursive: true });

  const timestamp = Date.now();
  const voicePath = path.join(tempDir, `voice_${timestamp}.mp3`);
  const outputPath = path.join(tempDir, `mixed_${timestamp}.mp3`);

  try {
    // Write voice buffer to temp file
    await fs.writeFile(voicePath, voiceBuffer);

    // Get binaural file path (relative to project root)
    const binauralPath = path.join(process.cwd(), BINAURAL_SERVER_PATHS[binauralPreset]);

    // Check if binaural file exists
    try {
      await fs.access(binauralPath);
    } catch {
      console.warn(`[ServerMixer] Binaural file not found: ${binauralPath}`);
      return { buffer: voiceBuffer, format: 'mp3', hasBinaural: false };
    }

    // Build ffmpeg command
    // Mix voice (at voiceVolume) with binaural (at binauralVolume)
    // Loop binaural to match voice duration
    // Apply fade in/out to binaural
    const voiceVolume = mixConfig.voiceVolume;
    const binauralVolume = mixConfig.binauralVolume;
    const fadeIn = mixConfig.fadeInDuration;
    const fadeOut = mixConfig.fadeOutDuration;

    // Padding: binaural starts 2 sec before voice and ends 2 sec after
    const padBefore = 2; // seconds before voice
    const padAfter = 2;  // seconds after voice

    // Get voice duration first
    const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${voicePath}"`;
    const { stdout: durationStr } = await execAsync(probeCmd);
    const voiceDuration = parseFloat(durationStr.trim()) || 30;
    const totalDuration = voiceDuration + padBefore + padAfter;
    const fadeOutStart = totalDuration - fadeOut;

    // ffmpeg command:
    // - Input 0: voice audio (delayed by padBefore)
    // - Input 1: binaural audio (looped, with fade in/out)
    // - Mix with specified volumes
    // - Binaural plays for totalDuration with proper fades
    const ffmpegCmd = `ffmpeg -y \
      -i "${voicePath}" \
      -stream_loop -1 -i "${binauralPath}" \
      -filter_complex "\
        [0:a]adelay=${padBefore * 1000}|${padBefore * 1000},volume=${voiceVolume}[voice]; \
        [1:a]atrim=0:${totalDuration},volume=${binauralVolume},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}[binaural]; \
        [binaural][voice]amix=inputs=2:duration=first:dropout_transition=0,volume=1.5[out]\
      " \
      -map "[out]" \
      -t ${totalDuration} \
      -acodec libmp3lame -q:a 2 \
      "${outputPath}"`;

    console.log('[ServerMixer] Running ffmpeg...');
    await execAsync(ffmpegCmd, { timeout: 60000 });

    // Read mixed audio
    const mixedBuffer = await fs.readFile(outputPath);
    console.log('[ServerMixer] Audio mixed successfully');

    // Cleanup temp files
    await cleanup(voicePath, outputPath);

    return { buffer: mixedBuffer, format: 'mp3', hasBinaural: true };
  } catch (error) {
    console.warn('[ServerMixer] Failed to mix audio, returning voice only:', error);

    // Cleanup temp files on error
    await cleanup(voicePath, outputPath);

    return { buffer: voiceBuffer, format: 'mp3', hasBinaural: false };
  }
}

/**
 * Cleanup temp files
 */
async function cleanup(...paths: string[]): Promise<void> {
  for (const p of paths) {
    try {
      await fs.unlink(p);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Check if ffmpeg is available
 */
export async function checkFfmpegAvailable(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get binaural preset for scenario
 */
export function getScenarioBinauralPreset(scenario: ScenarioType): BinauralPreset {
  return SCENARIO_BINAURAL_MAP[scenario];
}
