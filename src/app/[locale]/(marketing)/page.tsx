'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Mic2,
  Waves,
  Sun,
  Moon,
  Target,
  Dumbbell,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('landing');

  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20">
            <Sparkles className="mr-1 h-3 w-3" />
            AI-Powered Affirmations
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t('hero.title')}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-purple-600 to-blue-600 text-lg hover:from-purple-500 hover:to-blue-500"
              asChild
            >
              <a href="https://t.me/MindFrameBot" target="_blank" rel="noopener noreferrer">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-700 text-lg text-slate-300 hover:bg-slate-800"
              asChild
            >
              <a href="#features">
                {t('hero.ctaSecondary')}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-white sm:text-4xl">
            {t('features.title')}
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-purple-400" />}
              title={t('features.ai.title')}
              description={t('features.ai.description')}
            />
            <FeatureCard
              icon={<Mic2 className="h-8 w-8 text-blue-400" />}
              title={t('features.voice.title')}
              description={t('features.voice.description')}
            />
            <FeatureCard
              icon={<Waves className="h-8 w-8 text-cyan-400" />}
              title={t('features.binaural.title')}
              description={t('features.binaural.description')}
            />
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-white sm:text-4xl">
            {t('scenarios.title')}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ScenarioCard
              icon={<Sun className="h-6 w-6" />}
              title={t('scenarios.morning.title')}
              description={t('scenarios.morning.description')}
              gradient="from-amber-500 to-orange-500"
            />
            <ScenarioCard
              icon={<Moon className="h-6 w-6" />}
              title={t('scenarios.evening.title')}
              description={t('scenarios.evening.description')}
              gradient="from-indigo-500 to-purple-500"
            />
            <ScenarioCard
              icon={<Target className="h-6 w-6" />}
              title={t('scenarios.focus.title')}
              description={t('scenarios.focus.description')}
              gradient="from-blue-500 to-cyan-500"
            />
            <ScenarioCard
              icon={<Dumbbell className="h-6 w-6" />}
              title={t('scenarios.sport.title')}
              description={t('scenarios.sport.description')}
              gradient="from-red-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-white sm:text-4xl">
            {t('pricing.title')}
          </h2>

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

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mb-8 text-lg text-slate-400">
            {t('cta.subtitle')}
          </p>
          <Button
            size="lg"
            className="group bg-gradient-to-r from-purple-600 to-blue-600 text-lg hover:from-purple-500 hover:to-blue-500"
            asChild
          >
            <a href="https://t.me/MindFrameBot" target="_blank" rel="noopener noreferrer">
              {t('cta.button')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} MindFrame. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800">
          {icon}
        </div>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base text-slate-400">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function ScenarioCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Card className="group cursor-pointer border-slate-800 bg-slate-900/50 transition-all hover:border-slate-700 hover:bg-slate-800/50">
      <CardHeader className="pb-2">
        <div
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}
        >
          {icon}
        </div>
        <CardTitle className="text-lg text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-400">{description}</CardDescription>
      </CardContent>
    </Card>
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
    <Card
      className={`relative ${
        highlighted
          ? 'border-purple-500 bg-gradient-to-b from-purple-500/10 to-slate-900/50'
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
          <a href="https://t.me/MindFrameBot" target="_blank" rel="noopener noreferrer">
            Get Started
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
