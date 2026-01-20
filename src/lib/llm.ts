// LLM Integration for generating affirmation text
// Uses Anthropic Claude API

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export interface GenerateAffirmationInput {
  scenario: string;
  tags: string[];
  customText?: string;
  transcribedVoice?: string;
  language: 'ru' | 'en';
}

// System prompts for different scenarios (multilingual)
const SCENARIO_PROMPTS: Record<string, { ru: string; en: string }> = {
  morning: {
    ru: `Ты - внутренний голос пользователя, энергичный наставник.
Создай утреннюю аффирмацию для настройки на продуктивный день.
Стиль: энергичный, утвердительный, вдохновляющий.
Используй короткие, ритмичные предложения.
Обращайся от первого лица ("Я чувствую...", "Я готов...").
Длина: 200-300 слов.
Пиши на русском языке.`,
    en: `You are the user's inner voice, an energetic mentor.
Create a morning affirmation to set up for a productive day.
Style: energetic, assertive, inspiring.
Use short, rhythmic sentences.
Speak in first person ("I feel...", "I am ready...").
Length: 200-300 words.
Write in English.`,
  },
  evening: {
    ru: `Ты - внутренний голос пользователя, мягкий и успокаивающий.
Создай вечернюю аффирмацию для глубокого расслабления и сна.
Стиль: тягучий, медитативный, убаюкивающий.
Длинные плавные предложения с паузами (обозначай как "...").
Метафоры тепла, мягкости, безопасности.
Длина: 250-350 слов.
Пиши на русском языке.`,
    en: `You are the user's inner voice, soft and calming.
Create an evening affirmation for deep relaxation and sleep.
Style: flowing, meditative, soothing.
Long smooth sentences with pauses (mark as "...").
Metaphors of warmth, softness, safety.
Length: 250-350 words.
Write in English.`,
  },
  focus: {
    ru: `Ты - внутренний голос пользователя, сфокусированный ментор.
Создай аффирмацию для глубокой концентрации и входа в состояние потока.
Стиль: четкий, уверенный, направляющий внимание.
Короткие предложения, паузы для осознания.
Длина: 200-250 слов.
Пиши на русском языке.`,
    en: `You are the user's inner voice, a focused mentor.
Create an affirmation for deep concentration and entering flow state.
Style: clear, confident, attention-directing.
Short sentences, pauses for awareness.
Length: 200-250 words.
Write in English.`,
  },
  sport: {
    ru: `Ты - внутренний голос спортсмена, жесткий тренер.
Создай мотивационную аффирмацию для преодоления физических барьеров.
Стиль: агрессивный, командный, без жалости к себе.
Короткие рубленые фразы. Императивы.
Обращайся от первого лица.
Длина: 150-200 слов.
Пиши на русском языке.`,
    en: `You are the athlete's inner voice, a tough coach.
Create a motivational affirmation to break through physical barriers.
Style: aggressive, commanding, no self-pity.
Short punchy phrases. Imperatives.
Speak in first person.
Length: 150-200 words.
Write in English.`,
  },
  sos: {
    ru: `Ты - внутренний голос пользователя, спокойный и заземляющий.
Создай экстренную аффирмацию для снятия тревоги/паники.
Стиль: медленный, авторитетный, заземляющий.
Техника grounding: ощущения тела, дыхание, присутствие.
Много пауз (обозначай как "...").
Длина: 200-250 слов.
Пиши на русском языке.`,
    en: `You are the user's inner voice, calm and grounding.
Create an emergency affirmation to relieve anxiety/panic.
Style: slow, authoritative, grounding.
Grounding technique: body sensations, breathing, presence.
Many pauses (mark as "...").
Length: 200-250 words.
Write in English.`,
  },
};

/**
 * Generate personalized affirmation text using Claude
 */
export async function generateAffirmation({
  scenario,
  tags,
  customText,
  transcribedVoice,
  language,
}: GenerateAffirmationInput): Promise<string> {
  const systemPrompt =
    SCENARIO_PROMPTS[scenario]?.[language] || SCENARIO_PROMPTS.morning[language];

  // Build user context from tags and custom input
  let userContext = '';

  if (tags.length > 0) {
    userContext +=
      language === 'ru'
        ? `Фокус на: ${tags.join(', ')}.\n`
        : `Focus on: ${tags.join(', ')}.\n`;
  }

  if (customText) {
    userContext +=
      language === 'ru'
        ? `Контекст пользователя: ${customText}\n`
        : `User context: ${customText}\n`;
  }

  if (transcribedVoice) {
    userContext +=
      language === 'ru'
        ? `Пользователь сказал: "${transcribedVoice}"\n`
        : `User said: "${transcribedVoice}"\n`;
  }

  // If no context provided, use default prompt
  if (!userContext) {
    userContext =
      language === 'ru'
        ? 'Создай универсальную аффирмацию для этого сценария.'
        : 'Create a universal affirmation for this scenario.';
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userContext,
      },
    ],
  });

  // Extract text from response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in LLM response');
  }

  return textContent.text;
}

/**
 * Get token usage estimate for a text
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English, ~2 for Russian
  return Math.ceil(text.length / 3);
}
