'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Pause, RotateCcw, Check, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  minDuration?: number; // in seconds
  maxDuration?: number; // in seconds
  sampleText?: string;
  sampleTextLabel?: string;
  locale?: string;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

export function VoiceRecorder({
  onRecordingComplete,
  minDuration = 30,
  maxDuration = 60,
  sampleText,
  sampleTextLabel,
  locale = 'en',
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (state !== 'recording') return;

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#a855f7';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, [state]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context and analyser for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setState('recorded');

        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setState('recording');
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      // Start visualization
      drawWaveform();
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert(
        locale === 'ru'
          ? 'Не удалось получить доступ к микрофону'
          : 'Failed to access microphone'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setState('recorded');
    }

    audioRef.current.play();
    setState('playing');
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState('recorded');
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setState('idle');
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    setIsSubmitting(true);
    try {
      await onRecordingComplete(audioBlob);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isValidDuration = duration >= minDuration;
  const progressPercent = Math.min((duration / maxDuration) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Sample text to read */}
      {sampleText && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            {sampleTextLabel && (
              <p className="mb-2 text-sm font-medium text-slate-400">
                {sampleTextLabel}
              </p>
            )}
            <p className="text-lg leading-relaxed text-white">
              "{sampleText}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Waveform visualization */}
      <div className="relative overflow-hidden rounded-xl bg-slate-800/50 p-4">
        <canvas
          ref={canvasRef}
          width={320}
          height={80}
          className="mx-auto block"
        />

        {/* Timer overlay */}
        <div className="mt-2 text-center">
          <span
            className={`text-2xl font-mono font-bold ${
              isValidDuration ? 'text-green-400' : 'text-white'
            }`}
          >
            {formatTime(duration)}
          </span>
          <span className="ml-2 text-sm text-slate-400">
            / {formatTime(maxDuration)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full transition-all ${
              isValidDuration
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-purple-600 to-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Min duration hint */}
        {state === 'recording' && !isValidDuration && (
          <p className="mt-2 text-center text-xs text-slate-400">
            {locale === 'ru'
              ? `Минимум ${minDuration} сек для качественного клона`
              : `Minimum ${minDuration} sec for quality clone`}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {state === 'idle' && (
          <Button
            size="lg"
            onClick={startRecording}
            className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 hover:from-purple-500 hover:to-blue-500"
          >
            <Mic className="mr-2 h-5 w-5" />
            {locale === 'ru' ? 'Начать запись' : 'Start Recording'}
          </Button>
        )}

        {state === 'recording' && (
          <Button
            size="lg"
            variant="destructive"
            onClick={stopRecording}
            className="px-8"
          >
            <Square className="mr-2 h-5 w-5" />
            {locale === 'ru' ? 'Остановить' : 'Stop'}
          </Button>
        )}

        {(state === 'recorded' || state === 'playing') && (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={resetRecording}
              className="border-slate-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {locale === 'ru' ? 'Заново' : 'Retry'}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={state === 'playing' ? pausePlayback : playRecording}
              className="border-slate-700"
            >
              {state === 'playing' ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {state === 'playing'
                ? locale === 'ru'
                  ? 'Пауза'
                  : 'Pause'
                : locale === 'ru'
                ? 'Прослушать'
                : 'Play'}
            </Button>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!isValidDuration || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {locale === 'ru' ? 'Использовать' : 'Use This'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
