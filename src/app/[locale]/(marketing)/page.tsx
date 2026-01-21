'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Mic2,
  Waves,
  Sun,
  Moon,
  Target,
  Briefcase,
  Check,
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  Sparkles,
  Activity,
  HeartPulse,
  Play,
  Pause,
  Volume2,
  Shield,
  Award,
  Lock,
  X,
  Headphones,
} from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const [demoProgress, setDemoProgress] = useState(0);
  const [activeTrack, setActiveTrack] = useState<'generic' | 'neuroself'>('neuroself');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Audio paths based on locale
  const morningAudioUrl = `/audio/samples/morning_${locale}.mp3`;
  const eveningAudioUrl = `/audio/samples/evening_${locale}.mp3`;

  const handlePlayDemo = (demoId: string, audioUrl: string) => {
    if (playingDemo === demoId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setPlayingDemo(null);
      setDemoProgress(0);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setPlayingDemo(null);
        setDemoProgress(0);
        if (progressInterval.current) clearInterval(progressInterval.current);
      };
      audioRef.current.onerror = () => {
        setPlayingDemo(null);
        setDemoProgress(0);
      };
      audioRef.current.play().catch(() => {
        setPlayingDemo(null);
      });
      setPlayingDemo(demoId);

      // Progress simulation
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setDemoProgress(progress || 0);
        }
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <main className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"
          />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 px-4 py-2 rounded-full border border-purple-500/20">
              <Brain className="mr-2 h-4 w-4 text-purple-400" />
              {t('hero.badge')}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
          >
            <span className="text-white">{t('hero.titlePart1')}</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t('hero.titlePart2')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mb-8 max-w-3xl text-lg text-slate-400 sm:text-xl leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Benefits Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-white/90 text-sm font-medium">{t('hero.benefit1')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-white/90 text-sm font-medium">{t('hero.benefit2')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Moon className="w-4 h-4 text-blue-400" />
              <span className="text-white/90 text-sm font-medium">{t('hero.benefit3')}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-lg hover:from-purple-500 hover:to-blue-500 px-8 py-6 rounded-full font-semibold shadow-2xl shadow-purple-500/30 border-0"
                asChild
              >
                <a href="https://t.me/Mind_Frame_bot" target="_blank" rel="noopener noreferrer">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-br from-purple-400/20 to-blue-400/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Users className="w-4 h-4 text-white/50" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{t('hero.socialProofNumber')}</p>
              <p className="text-white/50 text-sm">{t('hero.socialProofText')}</p>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white/50"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('problem.title')}
              <span className="text-red-400"> {t('problem.titleHighlight')}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Bad Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl blur-xl opacity-50" />
              <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-red-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white/80">{t('problem.badTitle')}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <Volume2 className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-white/60 leading-relaxed">{t('problem.bad1')}</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <X className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-white/60 leading-relaxed">{t('problem.bad2')}</p>
                  </div>
                </div>

                {/* Static Waveform */}
                <div className="mt-6 p-4 rounded-xl bg-black/30">
                  <div className="flex items-center gap-1 h-12">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-red-500/30 rounded-full"
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-sm text-white/30 mt-2">{t('problem.badWaveText')}</p>
                </div>
              </div>
            </motion.div>

            {/* Good Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-70" />
              <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{t('problem.goodTitle')}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{t('problem.good1Title')}</p>
                      <p className="text-white/60 text-sm mt-1">{t('problem.good1')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Waves className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{t('problem.good2Title')}</p>
                      <p className="text-white/60 text-sm mt-1">{t('problem.good2')}</p>
                    </div>
                  </div>
                </div>

                {/* Animated Waveform */}
                <div className="mt-6 p-4 rounded-xl bg-black/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5" />
                  <div className="flex items-center gap-1 h-12 relative">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-full bg-gradient-to-t from-purple-500 to-blue-400"
                        animate={{
                          height: ['30%', `${Math.random() * 80 + 20}%`, '30%'],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.02,
                          ease: 'easeInOut',
                        }}
                        style={{ height: '30%' }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-sm text-purple-300/70 mt-2">{t('problem.goodWaveText')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-blue-500/30 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Headphones className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">{t('demo.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('demo.title')}{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t('demo.titleHighlight')}
              </span>
            </h2>
          </motion.div>

          {/* Demo Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Morning Demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <button
                onClick={() => handlePlayDemo('morning', morningAudioUrl)}
                className="relative w-full p-8 rounded-3xl bg-white/[0.02] border border-amber-500/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-amber-500/50 text-left"
              >
                <div className="flex items-start gap-5">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                    {playingDemo === 'morning' ? (
                      <Pause className="w-8 h-8 text-amber-400" />
                    ) : (
                      <Play className="w-8 h-8 text-amber-400 ml-1" />
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 blur-lg opacity-50" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('demo.morning.title')}</h3>
                    <p className="text-white/50 leading-relaxed">{t('demo.morning.description')}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {t('demo.morning.tag1')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        40Hz Gamma
                      </span>
                    </div>
                  </div>
                </div>
                {playingDemo === 'morning' && (
                  <div className="mt-4 h-1 rounded-full bg-amber-500/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
                      style={{ width: `${demoProgress}%` }}
                    />
                  </div>
                )}
              </button>
            </motion.div>

            {/* Evening Demo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <button
                onClick={() => handlePlayDemo('evening', eveningAudioUrl)}
                className="relative w-full p-8 rounded-3xl bg-white/[0.02] border border-indigo-500/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-indigo-500/50 text-left"
              >
                <div className="flex items-start gap-5">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    {playingDemo === 'evening' ? (
                      <Pause className="w-8 h-8 text-indigo-400" />
                    ) : (
                      <Play className="w-8 h-8 text-indigo-400 ml-1" />
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-lg opacity-50" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('demo.evening.title')}</h3>
                    <p className="text-white/50 leading-relaxed">{t('demo.evening.description')}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {t('demo.evening.tag1')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        6Hz Theta
                      </span>
                    </div>
                  </div>
                </div>
                {playingDemo === 'evening' && (
                  <div className="mt-4 h-1 rounded-full bg-indigo-500/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-400"
                      style={{ width: `${demoProgress}%` }}
                    />
                  </div>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('features.title')}{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t('features.titleHighlight')}
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  number: '01',
                  icon: Mic2,
                  title: t('features.step1.title'),
                  description: t('features.step1.description'),
                  accent: 'purple',
                },
                {
                  number: '02',
                  icon: Target,
                  title: t('features.step2.title'),
                  description: t('features.step2.description'),
                  accent: 'pink',
                },
                {
                  number: '03',
                  icon: Sparkles,
                  title: t('features.step3.title'),
                  description: t('features.step3.description'),
                  accent: 'blue',
                },
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm text-center group hover:bg-white/[0.04] transition-all duration-300">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                          step.accent === 'purple'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-400'
                            : step.accent === 'pink'
                            ? 'bg-gradient-to-r from-pink-600 to-pink-400'
                            : 'bg-gradient-to-r from-blue-600 to-blue-400'
                        }`}
                      >
                        <span className="text-xs font-bold text-white">{step.number}</span>
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative mt-4 ${
                        step.accent === 'purple'
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                          : step.accent === 'pink'
                          ? 'bg-gradient-to-br from-pink-500/20 to-rose-500/20'
                          : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                      }`}
                    >
                      <step.icon
                        className={`w-10 h-10 ${
                          step.accent === 'purple'
                            ? 'text-purple-400'
                            : step.accent === 'pink'
                            ? 'text-pink-400'
                            : 'text-blue-400'
                        }`}
                      />
                      <div
                        className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                          step.accent === 'purple'
                            ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30'
                            : step.accent === 'pink'
                            ? 'bg-gradient-to-br from-pink-500/30 to-rose-500/30'
                            : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30'
                        }`}
                      />
                    </motion.div>

                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-white/50 leading-relaxed">{step.description}</p>

                    <div
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        step.accent === 'purple'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : step.accent === 'pink'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                    />
                  </div>

                  {index < 2 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 w-12 items-center justify-center">
                      <motion.svg
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-6 text-purple-500/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </motion.svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('scenarios.title')}
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('scenarios.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: t('scenarios.morning.title'),
                description: t('scenarios.morning.description'),
                gradient: 'from-amber-500/20 to-orange-500/20',
                borderColor: 'border-amber-500/30',
                iconColor: 'text-amber-400',
              },
              {
                icon: Shield,
                title: t('scenarios.anxiety.title'),
                description: t('scenarios.anxiety.description'),
                gradient: 'from-emerald-500/20 to-teal-500/20',
                borderColor: 'border-emerald-500/30',
                iconColor: 'text-emerald-400',
              },
              {
                icon: Brain,
                title: t('scenarios.focus.title'),
                description: t('scenarios.focus.description'),
                gradient: 'from-violet-500/20 to-fuchsia-500/20',
                borderColor: 'border-violet-500/30',
                iconColor: 'text-violet-400',
              },
              {
                icon: Moon,
                title: t('scenarios.sleep.title'),
                description: t('scenarios.sleep.description'),
                gradient: 'from-blue-500/20 to-indigo-500/20',
                borderColor: 'border-blue-500/30',
                iconColor: 'text-blue-400',
              },
            ].map((scenario, index) => (
              <motion.div
                key={scenario.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${scenario.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative p-8 rounded-3xl bg-white/[0.02] border ${scenario.borderColor} backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-opacity-50`}>
                  <div className="flex items-start gap-5">
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${scenario.gradient} flex items-center justify-center flex-shrink-0`}>
                      <scenario.icon className={`w-7 h-7 ${scenario.iconColor}`} />
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${scenario.gradient} blur-lg opacity-50`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                        {scenario.title}
                      </h3>
                      <p className="text-white/50 leading-relaxed group-hover:text-white/60 transition-colors">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust/Science Section */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">{t('science.badge')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
              {t('science.title')}{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t('science.titleHighlight')}
              </span>
            </h2>

            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('science.description')}
            </p>
          </motion.div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            {[
              { icon: Brain, label: t('science.badge1'), sublabel: t('science.badge1Sub') },
              { icon: Award, label: t('science.badge2'), sublabel: t('science.badge2Sub') },
              { icon: Lock, label: t('science.badge3'), sublabel: t('science.badge3Sub') },
              { icon: Shield, label: t('science.badge4'), sublabel: t('science.badge4Sub') },
            ].map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm text-center hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                    <badge.icon className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">{badge.label}</h4>
                  <p className="text-xs text-white/40 leading-relaxed">{badge.sublabel}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-3 gap-8"
          >
            {[
              { value: t('stats.sleepImprovement'), label: t('stats.sleepLabel') },
              { value: t('stats.stressReduction'), label: t('stats.stressLabel') },
              { value: '100%', label: t('stats.personalizationLabel') },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: index * 0.1 + 0.5,
                  }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-sm text-white/40">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('pricing.title')}
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            <PricingCard
              name={t('pricing.free.name')}
              price={t('pricing.free.price')}
              features={t.raw('pricing.free.features') as string[]}
            />
            <PricingCard
              name={t('pricing.basic.name')}
              price={t('pricing.basic.price')}
              features={t.raw('pricing.basic.features') as string[]}
              highlighted
            />
            <PricingCard
              name={t('pricing.pro.name')}
              price={t('pricing.pro.price')}
              features={t.raw('pricing.pro.features') as string[]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              {t('cta.title')}{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t('cta.titleHighlight')}
              </span>
            </h2>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="relative group px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white text-lg font-semibold shadow-2xl shadow-purple-500/30 border-0"
                asChild
              >
                <a href="https://t.me/Mind_Frame_bot" target="_blank" rel="noopener noreferrer">
                  <span className="relative z-10">{t('cta.button')}</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-white">MindFrame</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} MindFrame. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className="relative"
    >
      {highlighted && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl" />
      )}
      <Card
        className={`relative ${
          highlighted
            ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-slate-900/50'
            : 'border-slate-800 bg-slate-900/50'
        }`}
      >
        {highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-purple-500 text-white">Popular</Badge>
          </div>
        )}
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">{name}</CardTitle>
          <div className="mt-4">
            <span className="text-4xl font-bold text-white">${price}</span>
            {price !== '0' && <span className="text-slate-400">/mo</span>}
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-slate-300">
                <Check className="mr-2 h-4 w-4 text-green-400" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className={`mt-6 w-full ${
              highlighted
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            asChild
          >
            <a href="https://t.me/Mind_Frame_bot" target="_blank" rel="noopener noreferrer">
              Get Started
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
