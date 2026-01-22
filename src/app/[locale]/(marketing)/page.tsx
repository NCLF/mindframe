'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  Diamond,
  Moon,
  ChevronRight,
  TrendingDown,
  UserX,
  Activity,
  Waves,
  Mic,
  FileCode,
  Cpu,
  Shield,
  Zap,
  Crown,
  Building,
  Check,
  Play,
  Pause,
  Headphones,
} from 'lucide-react';

/* --------------------------------------------------------------------------------
 * ANIMATED BACKGROUND WITH CANVAS
 * -------------------------------------------------------------------------------- */

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.03)';
      ctx.lineWidth = 0.5;
      const gridSize = 50;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    const handleResize = () => {
      resize();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

/* --------------------------------------------------------------------------------
 * GLITCH TEXT COMPONENT
 * -------------------------------------------------------------------------------- */

const GlitchText = ({ text, className = '' }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);

    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 100);
    }, 3000);

    return () => {
      clearInterval(typeInterval);
      clearInterval(glitchInterval);
    };
  }, [text]);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className={`${isGlitching ? 'opacity-0' : 'opacity-100'}`}>
        {displayText}
      </span>
      {isGlitching && (
        <>
          <span className="absolute inset-0 text-red-500 transform translate-x-[2px] translate-y-[1px] opacity-70">
            {displayText}
          </span>
          <span className="absolute inset-0 text-cyan-400 transform -translate-x-[2px] -translate-y-[1px] opacity-70">
            {displayText}
          </span>
        </>
      )}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="text-green-500"
      >
        _
      </motion.span>
    </span>
  );
};

/* --------------------------------------------------------------------------------
 * CANDLESTICK CHART
 * -------------------------------------------------------------------------------- */

const CandlestickChart = () => {
  const [candles, setCandles] = useState<Array<{
    open: number;
    close: number;
    high: number;
    low: number;
    isGreen: boolean;
    isVolatile: boolean;
  }>>([]);

  useEffect(() => {
    const generateCandles = () => {
      const newCandles = [];
      let basePrice = 100;

      for (let i = 0; i < 20; i++) {
        const volatility = i < 10 ? 15 : 3;
        const trend = i < 10 ? (Math.random() - 0.6) : (Math.random() - 0.3);

        const open = basePrice;
        const change = (Math.random() - 0.5) * volatility + trend * 5;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;

        newCandles.push({
          open,
          close,
          high,
          low,
          isGreen: close > open,
          isVolatile: i < 10,
        });

        basePrice = close;
      }
      setCandles(newCandles);
    };

    generateCandles();
    const interval = setInterval(generateCandles, 5000);
    return () => clearInterval(interval);
  }, []);

  if (candles.length === 0) return null;

  const minPrice = Math.min(...candles.map(c => c.low), 80);
  const maxPrice = Math.max(...candles.map(c => c.high), 120);
  const priceRange = maxPrice - minPrice;

  const scaleY = (price: number) => {
    return 180 - ((price - minPrice) / priceRange) * 160;
  };

  return (
    <div className="relative w-full max-w-lg mx-auto h-64 bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 50 + 20}
            x2="100%"
            y2={i * 50 + 20}
            stroke="rgba(34, 197, 94, 0.1)"
            strokeWidth="0.5"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <line
            key={`v-${i}`}
            x1={i * 50 + 20}
            y1="0"
            x2={i * 50 + 20}
            y2="100%"
            stroke="rgba(34, 197, 94, 0.1)"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
        {candles.map((candle, i) => {
          const x = i * 20 + 10;
          const wickTop = scaleY(candle.high);
          const wickBottom = scaleY(candle.low);
          const bodyTop = scaleY(Math.max(candle.open, candle.close));
          const bodyBottom = scaleY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(bodyBottom - bodyTop, 2);

          const color = candle.isVolatile
            ? (candle.isGreen ? '#22c55e' : '#ef4444')
            : '#22c55e';

          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <line
                x1={x}
                y1={wickTop}
                x2={x}
                y2={wickBottom}
                stroke={color}
                strokeWidth="1"
              />
              <rect
                x={x - 4}
                y={bodyTop}
                width="8"
                height={bodyHeight}
                fill={candle.isGreen ? color : 'transparent'}
                stroke={color}
                strokeWidth="1"
              />
            </motion.g>
          );
        })}
      </svg>

      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-zinc-500">
        VOLATILITY → STABILITY
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-mono text-zinc-500">LIVE</span>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------------
 * HEADER
 * -------------------------------------------------------------------------------- */

const Header = () => {
  const [gasPrice, setGasPrice] = useState(12);
  const locale = useLocale();

  useEffect(() => {
    const interval = setInterval(() => {
      setGasPrice(Math.floor(Math.random() * 20) + 8);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-mono text-lg sm:text-xl font-bold text-white tracking-tight">
              MINDFRAME
              <span className="text-green-500">_</span>
              TERMINAL
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-green-500"
              >
                ▌
              </motion.span>
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-xs text-zinc-400">
                Status: <span className="text-green-500">ONLINE</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 font-mono text-xs text-zinc-400">
              <span className="text-zinc-500">Gas:</span>
              <motion.span
                key={gasPrice}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-cyan-400"
              >
                {gasPrice} Gwei
              </motion.span>
            </div>

            <motion.a
              href="https://t.me/Mind_Frame_bot"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative px-4 py-2 font-mono text-xs sm:text-sm font-medium text-green-400 border border-green-500/50 bg-green-500/5 hover:bg-green-500/10 transition-all duration-200 group"
            >
              <span className="relative z-10">[ CONNECT ]</span>
              <motion.div
                className="absolute inset-0 bg-green-500/20"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

/* --------------------------------------------------------------------------------
 * HERO SECTION
 * -------------------------------------------------------------------------------- */

const Hero = () => {
  const t = useTranslations('landing');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 border border-zinc-700 bg-zinc-900/50 font-mono text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              SYSTEM ALERT: EMOTIONAL RISK DETECTED
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-mono font-bold text-white leading-tight mb-6">
              <GlitchText
                text={t('hero.titlePart1')}
                className="block"
              />
              <span className="block mt-2 text-green-500">
                {t('hero.titlePart2')}
              </span>
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                href="https://t.me/Mind_Frame_bot"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group px-8 py-4 bg-green-500 text-black font-mono font-bold text-sm sm:text-base overflow-hidden"
              >
                <span className="relative z-10">[ {t('hero.cta')} ]</span>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.a>
              <span className="text-zinc-500 font-mono text-xs self-center">
                {t('hero.ctaSubtext')}
              </span>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-zinc-800 pt-8">
              {[
                { value: '2,847', label: 'ACTIVE TRADERS' },
                { value: '$12.4M', label: 'SAVED FROM TILT' },
                { value: '99.2%', label: 'UPTIME' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-mono text-xl sm:text-2xl font-bold text-green-500">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[10px] sm:text-xs text-zinc-500 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 blur-3xl opacity-30" />
            <CandlestickChart />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-4 -right-4 bg-zinc-900 border border-zinc-700 px-3 py-2 font-mono text-xs"
            >
              <span className="text-zinc-500">EMOTION LEVEL:</span>
              <span className="text-green-500 ml-2">STABLE</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border border-zinc-600 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-green-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* --------------------------------------------------------------------------------
 * PAIN SECTION
 * -------------------------------------------------------------------------------- */

const PainSection = () => {
  const t = useTranslations('landing');
  const locale = useLocale();

  const painCards = [
    {
      title: 'REVENGE TRADE',
      icon: TrendingDown,
      text: locale === 'ru'
        ? 'Попытка отыграться с плечом x20. Итог: Ликвидация.'
        : 'Trying to recover with x20 leverage. Result: Liquidation.',
      loss: '-$5,420',
    },
    {
      title: 'WEAK HANDS',
      icon: UserX,
      text: locale === 'ru'
        ? 'Паника на коррекции. Продажа дна. Итог: Упущенные иксы.'
        : 'Panic on correction. Selling the bottom. Result: Missed gains.',
      loss: '-$12,800',
    },
    {
      title: 'OVERTRADING',
      icon: Activity,
      text: locale === 'ru'
        ? 'Торговля от скуки во флете. Итог: Сжигание депозита.'
        : 'Trading from boredom in sideways market. Result: Burned deposit.',
      loss: '-$3,200',
    },
  ];

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-red-500/30 bg-red-500/5 font-mono text-xs text-red-400 mb-6">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            WARNING: HIGH RISK PATTERNS
          </div>
          <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t('problem.title')}
            <span className="block text-red-500">{t('problem.titleHighlight')}</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {painCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative bg-[#0a0a0a] border border-zinc-800 p-6 hover:border-red-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <card.icon className="w-8 h-8 text-red-500" />
                  <span className="font-mono text-xs text-zinc-600">
                    #{String(i + 1).padStart(3, '0')}
                  </span>
                </div>

                <h3 className="font-mono text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                  {card.title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {card.text}
                </p>

                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-500">AVG LOSS</span>
                    <span className="font-mono text-lg font-bold text-red-500">
                      {card.loss}
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500/30 group-hover:border-red-500 transition-colors" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red-500/30 group-hover:border-red-500 transition-colors" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-red-500/30 group-hover:border-red-500 transition-colors" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-500/30 group-hover:border-red-500 transition-colors" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-zinc-900/50 border border-zinc-800">
            <span className="font-mono text-sm text-zinc-400">
              {locale === 'ru'
                ? '95% трейдеров теряют деньги из-за эмоций'
                : '95% of traders lose money due to emotions'}
            </span>
            <span className="text-red-500 font-mono font-bold">
              {locale === 'ru' ? 'НЕ БУДЬ СТАТИСТИКОЙ' : "DON'T BE A STATISTIC"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* --------------------------------------------------------------------------------
 * TECH FEATURES
 * -------------------------------------------------------------------------------- */

const TechFeatures = () => {
  const t = useTranslations('landing');
  const locale = useLocale();

  const features = [
    {
      icon: Waves,
      title: 'FREQUENCY SHIFT',
      code: 'FSH_001',
      description: locale === 'ru'
        ? 'Мгновенный сброс Beta-волн в Alpha-режим.'
        : 'Instant Beta-wave reset to Alpha-mode.',
      specs: ['40Hz → 10Hz', 'Latency: <200ms', 'Neural sync: Active'],
    },
    {
      icon: Mic,
      title: 'WHALE VOICE 2.0',
      code: 'WV_002',
      description: locale === 'ru'
        ? 'Голос, который управляет миллиардами. AI убирает дрожь и эмоции.'
        : 'Voice that manages billions. AI removes tremor and emotion.',
      specs: ['Voice cloning: Yes', 'Confidence boost: +340%', 'Languages: 12'],
    },
    {
      icon: FileCode,
      title: 'CONTEXT SCRIPTS',
      code: 'CS_003',
      description: locale === 'ru'
        ? "Никаких мантр. Только жесткие команды: 'Прими убыток', 'Держи строй'."
        : "No mantras. Only hard commands: 'Accept the loss', 'Hold the line'.",
      specs: ['Scripts: 847+', 'Market-aware: Yes', 'Custom: Available'],
    },
  ];

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-green-500/30 bg-green-500/5 font-mono text-xs text-green-400 mb-6">
            <Cpu className="w-3 h-3" />
            TECHNICAL SPECIFICATION v2.4.1
          </div>
          <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t('solution.title')}
            <span className="block text-green-500">{t('solution.titleHighlight')}</span>
          </h2>
        </motion.div>

        <div className="space-y-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-[#0a0a0a] border border-zinc-800 hover:border-green-500/30 transition-all duration-300">
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <span className="font-mono text-xs text-zinc-500">
                      module://{feature.code.toLowerCase()}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-zinc-600">
                    {feature.code}
                  </span>
                </div>

                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 border border-green-500/30 bg-green-500/5 flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                        <feature.icon className="w-8 h-8 text-green-500" />
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-mono text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0 lg:text-right">
                      <div className="space-y-1">
                        {feature.specs.map((spec, j) => (
                          <div
                            key={j}
                            className="font-mono text-xs text-zinc-500"
                          >
                            <span className="text-green-500/50 mr-2">›</span>
                            {spec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-0.5 bg-zinc-800">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {[
            { icon: Shield, text: 'SOC 2 Compliant' },
            { icon: Zap, text: '99.99% Uptime' },
            { icon: Cpu, text: 'Edge Computing' },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-900/50 font-mono text-xs text-zinc-400"
            >
              <badge.icon className="w-3 h-3 text-green-500" />
              {badge.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* --------------------------------------------------------------------------------
 * PROTOCOLS SECTION
 * -------------------------------------------------------------------------------- */

const Protocols = () => {
  const [activeProtocol, setActiveProtocol] = useState('sos');
  const locale = useLocale();

  const protocols = [
    {
      id: 'sos',
      title: 'SOS / STOP-LOSS',
      subtitle: 'Emergency Protocol',
      icon: AlertOctagon,
      color: 'red',
      description: locale === 'ru'
        ? 'Остановка тильта. Сохранение депозита.'
        : 'Tilt shutdown. Deposit preservation.',
      details: locale === 'ru'
        ? [
          'Мгновенная активация при обнаружении паттернов тильта',
          'Принудительный cooldown на 15-60 минут',
          'Guided breathing + аудио-реорентация',
          'Блокировка торговых приложений (опционально)',
        ]
        : [
          'Instant activation on tilt pattern detection',
          'Forced cooldown for 15-60 minutes',
          'Guided breathing + audio reorientation',
          'Trading app blocking (optional)',
        ],
      status: 'CRITICAL',
    },
    {
      id: 'diamond',
      title: 'DIAMOND HANDS',
      subtitle: 'Hold Protocol',
      icon: Diamond,
      color: 'cyan',
      description: locale === 'ru'
        ? 'Удержание позиции до тейка.'
        : 'Holding position to take profit.',
      details: locale === 'ru'
        ? [
          'Укрепление решимости через нейро-программирование',
          'Визуализация целевой цены',
          'Whale Voice мотивация каждые 4 часа',
          'Реалтайм мониторинг уровня уверенности',
        ]
        : [
          'Resolution strengthening through neuro-programming',
          'Target price visualization',
          'Whale Voice motivation every 4 hours',
          'Real-time confidence level monitoring',
        ],
      status: 'ACTIVE',
    },
    {
      id: 'sleep',
      title: 'DEEP SLEEP',
      subtitle: 'Recovery Protocol',
      icon: Moon,
      color: 'purple',
      description: locale === 'ru'
        ? 'Принудительный вход в Delta-сон.'
        : 'Forced entry into Delta-sleep.',
      details: locale === 'ru'
        ? [
          'Биноуральные ритмы для глубокого сна',
          '8-часовой цикл восстановления',
          'Отключение всех уведомлений',
          'Утренний брифинг по рынку',
        ]
        : [
          'Binaural beats for deep sleep',
          '8-hour recovery cycle',
          'All notifications disabled',
          'Morning market briefing',
        ],
      status: 'STANDBY',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, {
      border: string;
      bg: string;
      text: string;
      glow: string;
    }> = {
      red: {
        border: 'border-red-500/50',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        glow: 'shadow-red-500/20',
      },
      cyan: {
        border: 'border-cyan-500/50',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        glow: 'shadow-cyan-500/20',
      },
      purple: {
        border: 'border-purple-500/50',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
      },
    };
    return colors[color];
  };

  const activeData = protocols.find((p) => p.id === activeProtocol)!;
  const colorClasses = getColorClasses(activeData.color);

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-700 bg-zinc-900/50 font-mono text-xs text-zinc-400 mb-6">
            SELECT PROTOCOL
          </div>
          <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            OPERATIONAL
            <span className="block text-green-500">PROTOCOLS</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {protocols.map((protocol, i) => {
            const pColors = getColorClasses(protocol.color);
            const isActive = activeProtocol === protocol.id;

            return (
              <motion.button
                key={protocol.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => setActiveProtocol(protocol.id)}
                className={`relative p-4 border text-left transition-all duration-300 ${
                  isActive
                    ? `${pColors.border} ${pColors.bg} shadow-lg ${pColors.glow}`
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <protocol.icon
                    className={`w-5 h-5 ${isActive ? pColors.text : 'text-zinc-500'}`}
                  />
                  <span
                    className={`font-mono text-[10px] ${
                      isActive ? pColors.text : 'text-zinc-600'
                    }`}
                  >
                    {protocol.status}
                  </span>
                </div>
                <h3
                  className={`font-mono text-sm font-bold ${
                    isActive ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {protocol.title}
                </h3>
                <p className="font-mono text-xs text-zinc-500 mt-1">
                  {protocol.subtitle}
                </p>

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${pColors.bg.replace('/10', '')}`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeProtocol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`relative bg-[#0a0a0a] border ${colorClasses.border} p-6 lg:p-8`}
          >
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-20 h-20 border ${colorClasses.border} ${colorClasses.bg} flex items-center justify-center`}
                  >
                    <activeData.icon className={`w-10 h-10 ${colorClasses.text}`} />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-mono text-2xl font-bold text-white">
                      {activeData.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 font-mono text-xs ${colorClasses.bg} ${colorClasses.text}`}
                    >
                      {activeData.status}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-lg mb-6">
                    {activeData.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeData.details.map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-zinc-400"
                      >
                        <ChevronRight
                          className={`w-4 h-4 ${colorClasses.text} flex-shrink-0 mt-0.5`}
                        />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 lg:self-center">
                  <motion.a
                    href="https://t.me/Mind_Frame_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`inline-block px-6 py-3 border ${colorClasses.border} ${colorClasses.bg} ${colorClasses.text} font-mono text-sm font-bold hover:bg-opacity-20 transition-all`}
                  >
                    [ ACTIVATE ]
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* --------------------------------------------------------------------------------
 * PRICING SECTION
 * -------------------------------------------------------------------------------- */

const Pricing = () => {
  const t = useTranslations('landing');
  const locale = useLocale();

  const plans = [
    {
      name: 'TRADER',
      price: '$49',
      period: '/mo',
      description: locale === 'ru' ? 'Для депозитов до $10k' : 'For deposits up to $10k',
      icon: Zap,
      features: locale === 'ru'
        ? ['SOS Protocol', 'Basic Frequency Shift', '3 Context Scripts', 'Community Support']
        : ['SOS Protocol', 'Basic Frequency Shift', '3 Context Scripts', 'Community Support'],
      highlight: false,
    },
    {
      name: 'WHALE',
      price: '$99',
      period: '/mo',
      description: locale === 'ru' ? 'Для профи' : 'For professionals',
      badge: 'BEST VALUE',
      icon: Crown,
      features: locale === 'ru'
        ? ['All Protocols', 'Advanced Frequency Shift', 'Whale Voice Cloning', 'Anti-Panic Button', 'Unlimited Scripts', 'Priority Support', 'Custom Triggers']
        : ['All Protocols', 'Advanced Frequency Shift', 'Whale Voice Cloning', 'Anti-Panic Button', 'Unlimited Scripts', 'Priority Support', 'Custom Triggers'],
      highlight: true,
    },
    {
      name: 'INSTITUTIONAL',
      price: '$2,499',
      period: '',
      description: locale === 'ru' ? 'Lifetime License. B2B.' : 'Lifetime License. B2B.',
      icon: Building,
      features: locale === 'ru'
        ? ['Everything in Whale', 'Team Dashboard', 'API Access', 'White-label Option', 'Dedicated Account Manager', 'Custom Integration']
        : ['Everything in Whale', 'Team Dashboard', 'API Access', 'White-label Option', 'Dedicated Account Manager', 'Custom Integration'],
      highlight: false,
    },
  ];

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-green-500/30 bg-green-500/5 font-mono text-xs text-green-400 mb-6">
            ROI CALCULATOR
          </div>
          <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {locale === 'ru' ? 'СКОЛЬКО СТОИТ' : 'HOW MUCH IS'}
            <span className="block text-red-500">{locale === 'ru' ? 'ТВОЯ ОШИБКА?' : 'YOUR MISTAKE?'}</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/30 p-6 text-center">
              <div className="font-mono text-sm text-zinc-400 mb-2">
                {locale === 'ru' ? 'Тильтовый вход' : 'Tilt entry'}
              </div>
              <div className="font-mono text-3xl font-bold text-red-500">
                -$2,000
              </div>
              <div className="font-mono text-xs text-zinc-500 mt-2">
                Average loss per incident
              </div>
            </div>
            <div className="bg-green-500/5 border border-green-500/30 p-6 text-center">
              <div className="font-mono text-sm text-zinc-400 mb-2">
                MindFrame Whale Plan
              </div>
              <div className="font-mono text-3xl font-bold text-green-500">
                $99
              </div>
              <div className="font-mono text-xs text-zinc-500 mt-2">
                Monthly investment
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 font-mono">
              <span className="text-zinc-400">ROI:</span>
              <span className="text-2xl font-bold text-green-500">2000%+</span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative ${
                plan.highlight
                  ? 'md:-mt-4 md:mb-4'
                  : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-4 py-1 bg-green-500 text-black font-mono text-xs font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div
                className={`h-full bg-[#0a0a0a] border p-6 flex flex-col ${
                  plan.highlight
                    ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                    : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <plan.icon
                    className={`w-6 h-6 ${
                      plan.highlight ? 'text-green-500' : 'text-zinc-500'
                    }`}
                  />
                  <span className="font-mono text-xs text-zinc-600">
                    PLAN_{String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="font-mono text-xl font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span
                    className={`font-mono text-4xl font-bold ${
                      plan.highlight ? 'text-green-500' : 'text-white'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="font-mono text-sm text-zinc-500">
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-3 flex-grow mb-6">
                  {plan.features.map((feature, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 text-sm text-zinc-400"
                    >
                      <Check
                        className={`w-4 h-4 ${
                          plan.highlight ? 'text-green-500' : 'text-zinc-600'
                        }`}
                      />
                      {feature}
                    </div>
                  ))}
                </div>

                <motion.a
                  href="https://t.me/Mind_Frame_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 font-mono text-sm font-bold text-center transition-all ${
                    plan.highlight
                      ? 'bg-green-500 text-black hover:bg-green-400'
                      : 'border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
                >
                  [ SELECT PLAN ]
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-900/50 font-mono text-xs text-zinc-400">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            7-DAY MONEY-BACK GUARANTEE • NO QUESTIONS ASKED
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* --------------------------------------------------------------------------------
 * FOOTER
 * -------------------------------------------------------------------------------- */

const Footer = () => {
  const locale = useLocale();

  return (
    <footer className="relative py-16 px-4 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {locale === 'ru' ? 'ПРЕКРАТИ БЫТЬ ЛИКВИДНОСТЬЮ.' : "STOP BEING LIQUIDITY."}
            <span className="block text-green-500">
              {locale === 'ru' ? 'СТАНЬ ОПЕРАТОРОМ РЫНКА.' : 'BECOME A MARKET OPERATOR.'}
            </span>
          </h2>
          <motion.a
            href="https://t.me/Mind_Frame_bot"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block mt-6 px-8 py-4 bg-green-500 text-black font-mono font-bold text-sm sm:text-base"
          >
            [ {locale === 'ru' ? 'НАЧАТЬ БЕСПЛАТНО' : 'START FREE'} ]
          </motion.a>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-zinc-800/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-zinc-400">
              MINDFRAME<span className="text-green-500">_</span>TERMINAL
            </span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-xs text-zinc-600">
              © 2024
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-mono text-xs text-zinc-500 hover:text-green-500 transition-colors"
            >
              Privacy Protocol
            </Link>
            <Link
              href="/terms"
              className="font-mono text-xs text-zinc-500 hover:text-green-500 transition-colors"
            >
              Terms of Execution
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-mono text-xs text-zinc-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 text-center">
          <p className="font-mono text-xs text-zinc-600 leading-relaxed">
            {locale === 'ru'
              ? 'MindFrame не даёт финансовых советов. Мы даём инструменты для сохранения рассудка.'
              : 'MindFrame does not provide financial advice. We provide tools to preserve your sanity.'}
          </p>
        </div>

        <div className="mt-12 text-center overflow-hidden">
          <pre className="font-mono text-[8px] sm:text-[10px] text-zinc-800 leading-tight whitespace-pre">
{`
███╗   ███╗██╗███╗   ██╗██████╗ ███████╗██████╗  █████╗ ███╗   ███╗███████╗
████╗ ████║██║████╗  ██║██╔══██╗██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝
██╔████╔██║██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝███████║██╔████╔██║█████╗
██║╚██╔╝██║██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝
██║ ╚═╝ ██║██║██║ ╚████║██████╔╝██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗
╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
`}
          </pre>
        </div>
      </div>
    </footer>
  );
};

/* --------------------------------------------------------------------------------
 * MAIN PAGE
 * -------------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <AnimatedBackground />

      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )`,
        }}
      />

      <div className="relative z-10">
        <Header />
        <Hero />
        <PainSection />
        <TechFeatures />
        <Protocols />
        <Pricing />
        <Footer />
      </div>
    </div>
  );
}
