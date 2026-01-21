// Binaural Beats Integration Module
// Implements brain hemisphere synchronization through binaural audio

import type { ScenarioType } from '../elevenlabs';

// ============ Binaural Beat Types ============
export type BinauralPreset = 'gamma' | 'beta' | 'alpha' | 'theta' | 'delta';

export interface BinauralConfig {
  preset: BinauralPreset;
  baseFrequency: number;  // Carrier frequency in Hz
  beatFrequency: number;  // Binaural beat frequency in Hz
  description: string;
  descriptionRu: string;
  effect: string;
  effectRu: string;
}

// ============ Binaural Presets ============
// Based on EEG brainwave research
export const BINAURAL_PRESETS: Record<BinauralPreset, BinauralConfig> = {
  // Gamma (30-100 Hz) - Peak awareness, cognitive processing
  gamma: {
    preset: 'gamma',
    baseFrequency: 200,
    beatFrequency: 40,
    description: 'Gamma 40Hz - Peak cognitive performance',
    descriptionRu: 'Gamma 40Hz - Пиковая когнитивная активность',
    effect: 'Enhanced focus, memory, learning',
    effectRu: 'Улучшенный фокус, память, обучение',
  },
  // Beta (13-30 Hz) - Active thinking, alert
  beta: {
    preset: 'beta',
    baseFrequency: 200,
    beatFrequency: 20,
    description: 'Beta 20Hz - Active alertness',
    descriptionRu: 'Beta 20Hz - Активная бодрость',
    effect: 'Concentration, analytical thinking',
    effectRu: 'Концентрация, аналитическое мышление',
  },
  // Alpha (8-12 Hz) - Relaxed, calm focus
  alpha: {
    preset: 'alpha',
    baseFrequency: 200,
    beatFrequency: 10,
    description: 'Alpha 10Hz - Relaxed focus',
    descriptionRu: 'Alpha 10Hz - Расслабленный фокус',
    effect: 'Flow state, creativity, stress reduction',
    effectRu: 'Состояние потока, творчество, снижение стресса',
  },
  // Theta (4-8 Hz) - Deep relaxation, meditation
  theta: {
    preset: 'theta',
    baseFrequency: 180,
    beatFrequency: 6,
    description: 'Theta 6Hz - Deep relaxation',
    descriptionRu: 'Theta 6Hz - Глубокое расслабление',
    effect: 'Meditation, intuition, REM sleep preparation',
    effectRu: 'Медитация, интуиция, подготовка к глубокому сну',
  },
  // Delta (0.1-4 Hz) - Deep sleep, healing
  delta: {
    preset: 'delta',
    baseFrequency: 180,
    beatFrequency: 3,
    description: 'Delta 3Hz - Deep sleep',
    descriptionRu: 'Delta 3Hz - Глубокий сон',
    effect: 'Deep sleep, physical recovery, healing',
    effectRu: 'Глубокий сон, физическое восстановление',
  },
};

// ============ Scenario to Binaural Mapping ============
// Each scenario has an optimal binaural preset
export const SCENARIO_BINAURAL_MAP: Record<ScenarioType, BinauralPreset> = {
  morning: 'gamma',   // Activation: gamma for peak alertness
  sport: 'gamma',     // Energy: gamma for maximum drive
  focus: 'alpha',     // Focus: alpha for flow state
  evening: 'theta',   // Deactivation: theta for relaxation
  sos: 'alpha',       // SOS: alpha for grounding
};

// Get binaural config for scenario
export function getBinauralForScenario(scenario: ScenarioType): BinauralConfig {
  const preset = SCENARIO_BINAURAL_MAP[scenario];
  return BINAURAL_PRESETS[preset];
}

// ============ Audio Mixing Configuration ============
export interface MixConfig {
  voiceVolume: number;     // 0-1, typically 0.7-0.8
  binauralVolume: number;  // 0-1, typically 0.2-0.4
  fadeInDuration: number;  // seconds
  fadeOutDuration: number; // seconds
}

// Default mixing settings per scenario
// Binaural starts 2 sec before voice and ends 2 sec after
export const SCENARIO_MIX_CONFIG: Record<ScenarioType, MixConfig> = {
  morning: {
    voiceVolume: 0.85,
    binauralVolume: 0.45,  // Increased for audibility
    fadeInDuration: 2,
    fadeOutDuration: 3,
  },
  sport: {
    voiceVolume: 0.9,
    binauralVolume: 0.4,   // Increased for audibility
    fadeInDuration: 1,
    fadeOutDuration: 2,
  },
  focus: {
    voiceVolume: 0.8,
    binauralVolume: 0.5,   // Increased for audibility
    fadeInDuration: 3,
    fadeOutDuration: 4,
  },
  evening: {
    voiceVolume: 0.75,
    binauralVolume: 0.55,  // Higher for relaxation effect
    fadeInDuration: 5,
    fadeOutDuration: 8,
  },
  sos: {
    voiceVolume: 0.8,
    binauralVolume: 0.5,   // Increased for grounding effect
    fadeInDuration: 2,
    fadeOutDuration: 3,
  },
};

// ============ Pre-rendered Audio Paths ============
// Using pre-generated binaural tracks for MVP
// Located in /public/audio/binaural/
export const BINAURAL_AUDIO_PATHS: Record<BinauralPreset, string> = {
  gamma: '/audio/binaural/gamma_40hz.wav',
  beta: '/audio/binaural/beta_20hz.wav',
  alpha: '/audio/binaural/alpha_10hz.wav',  // Note: using beta_20hz.wav as alpha placeholder
  theta: '/audio/binaural/theta_6hz.wav',
  delta: '/audio/binaural/delta_3hz.wav',
};

// Server-side paths (for Node.js API routes)
export const BINAURAL_SERVER_PATHS: Record<BinauralPreset, string> = {
  gamma: 'public/audio/binaural/gamma_40hz.wav',
  beta: 'public/audio/binaural/beta_20hz.wav',
  alpha: 'public/audio/binaural/beta_20hz.wav',  // Using beta as alpha placeholder (closest frequency)
  theta: 'public/audio/binaural/theta_6hz.wav',
  delta: 'public/audio/binaural/delta_3hz.wav',
};

// ============ Web Audio API Utilities ============

/**
 * Generate binaural beat using Web Audio API
 * Creates two sine waves with frequency difference = beat frequency
 * Note: Requires stereo headphones for effect
 */
export function createBinauralOscillator(
  audioContext: AudioContext,
  config: BinauralConfig,
  volume: number = 0.3
): { left: OscillatorNode; right: OscillatorNode; gainNode: GainNode } {
  // Create gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume;

  // Create left oscillator (base frequency)
  const leftOsc = audioContext.createOscillator();
  leftOsc.type = 'sine';
  leftOsc.frequency.value = config.baseFrequency;

  // Create right oscillator (base + beat frequency)
  const rightOsc = audioContext.createOscillator();
  rightOsc.type = 'sine';
  rightOsc.frequency.value = config.baseFrequency + config.beatFrequency;

  // Create stereo panner for each channel
  const leftPanner = audioContext.createStereoPanner();
  leftPanner.pan.value = -1; // Full left

  const rightPanner = audioContext.createStereoPanner();
  rightPanner.pan.value = 1; // Full right

  // Connect: osc -> panner -> gain -> destination
  leftOsc.connect(leftPanner);
  leftPanner.connect(gainNode);

  rightOsc.connect(rightPanner);
  rightPanner.connect(gainNode);

  gainNode.connect(audioContext.destination);

  return { left: leftOsc, right: rightOsc, gainNode };
}

/**
 * Mix voice audio with binaural beats (client-side)
 * Uses OfflineAudioContext for rendering
 */
export async function mixVoiceWithBinaural(
  voiceBuffer: ArrayBuffer,
  binauralPreset: BinauralPreset,
  mixConfig: MixConfig
): Promise<ArrayBuffer> {
  // Create audio context for decoding
  const audioContext = new AudioContext();

  // Decode voice audio
  const voiceAudioBuffer = await audioContext.decodeAudioData(voiceBuffer);

  const duration = voiceAudioBuffer.duration;
  const sampleRate = voiceAudioBuffer.sampleRate;
  const channels = 2; // Stereo for binaural

  // Create offline context for rendering
  const offlineCtx = new OfflineAudioContext(
    channels,
    Math.ceil(duration * sampleRate),
    sampleRate
  );

  // Load binaural audio
  const binauralConfig = BINAURAL_PRESETS[binauralPreset];
  const binauralPath = BINAURAL_AUDIO_PATHS[binauralPreset];

  try {
    // Fetch binaural audio file
    const binauralResponse = await fetch(binauralPath);
    const binauralArrayBuffer = await binauralResponse.arrayBuffer();
    const binauralAudioBuffer = await offlineCtx.decodeAudioData(binauralArrayBuffer);

    // Create source for voice
    const voiceSource = offlineCtx.createBufferSource();
    voiceSource.buffer = voiceAudioBuffer;

    // Create gain for voice
    const voiceGain = offlineCtx.createGain();
    voiceGain.gain.value = mixConfig.voiceVolume;

    // Connect voice
    voiceSource.connect(voiceGain);
    voiceGain.connect(offlineCtx.destination);

    // Create source for binaural
    const binauralSource = offlineCtx.createBufferSource();
    binauralSource.buffer = binauralAudioBuffer;
    binauralSource.loop = true; // Loop binaural to match voice duration

    // Create gain for binaural with fade in/out
    const binauralGain = offlineCtx.createGain();

    // Fade in
    binauralGain.gain.setValueAtTime(0, 0);
    binauralGain.gain.linearRampToValueAtTime(
      mixConfig.binauralVolume,
      mixConfig.fadeInDuration
    );

    // Hold
    binauralGain.gain.setValueAtTime(
      mixConfig.binauralVolume,
      duration - mixConfig.fadeOutDuration
    );

    // Fade out
    binauralGain.gain.linearRampToValueAtTime(0, duration);

    // Connect binaural
    binauralSource.connect(binauralGain);
    binauralGain.connect(offlineCtx.destination);

    // Start sources
    voiceSource.start(0);
    binauralSource.start(0);
    binauralSource.stop(duration);

    // Render
    const renderedBuffer = await offlineCtx.startRendering();

    // Convert to ArrayBuffer (WAV format)
    return audioBufferToWav(renderedBuffer);
  } catch (error) {
    console.warn('[Binaural] Failed to mix with binaural, returning voice only:', error);
    return voiceBuffer;
  } finally {
    audioContext.close();
  }
}

/**
 * Convert AudioBuffer to WAV ArrayBuffer
 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const wavLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(wavLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, wavLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write audio data
  const channelData: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, value, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
