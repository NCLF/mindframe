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
// Using ElevenLabs v3 pause tags: [pause], [short pause], [long pause]
const SCENARIO_PROMPTS: Record<string, { ru: string; en: string }> = {
  morning: {
    ru: `Ты - внутренний голос пользователя, энергичный наставник.
Создай утреннюю аффирмацию для настройки на продуктивный день.
Стиль: энергичный, утвердительный, вдохновляющий.
Используй короткие, ритмичные предложения.
Обращайся от первого лица ("Я чувствую...", "Я готов...").
Длина: 200-300 слов.
Пиши на русском языке.

ВАЖНО: Используй теги для пауз и интонации:
- [short pause] — короткая пауза между фразами
- [pause] — средняя пауза для осмысления
- [long pause] — длинная пауза в ключевых моментах
Расставляй паузы естественно между предложениями и абзацами.`,
    en: `You are the user's inner voice, an energetic mentor.
Create a morning affirmation to set up for a productive day.
Style: energetic, assertive, inspiring.
Use short, rhythmic sentences.
Speak in first person ("I feel...", "I am ready...").
Length: 200-300 words.
Write in English.

IMPORTANT: Use these pause and intonation tags:
- [short pause] — brief pause between phrases
- [pause] — medium pause for reflection
- [long pause] — longer pause at key moments
Place pauses naturally between sentences and paragraphs.`,
  },
  evening: {
    ru: `Ты - внутренний голос пользователя, мягкий и успокаивающий.
Создай вечернюю аффирмацию для глубокого расслабления и сна.
Стиль: тягучий, медитативный, убаюкивающий.
Длинные плавные предложения.
Метафоры тепла, мягкости, безопасности.
Длина: 250-350 слов.
Пиши на русском языке.

ВАЖНО: Используй теги для пауз и интонации:
- [short pause] — короткая пауза
- [pause] — средняя пауза для расслабления
- [long pause] — длинная пауза для погружения
Расставляй МНОГО пауз — это вечерняя медитация. Особенно используй [long pause] между абзацами.`,
    en: `You are the user's inner voice, soft and calming.
Create an evening affirmation for deep relaxation and sleep.
Style: flowing, meditative, soothing.
Long smooth sentences.
Metaphors of warmth, softness, safety.
Length: 250-350 words.
Write in English.

IMPORTANT: Use these pause and intonation tags:
- [short pause] — brief pause
- [pause] — medium pause for relaxation
- [long pause] — longer pause for deep immersion
Use MANY pauses — this is an evening meditation. Especially use [long pause] between paragraphs.`,
  },
  focus: {
    ru: `Ты - внутренний голос пользователя, сфокусированный ментор.
Создай аффирмацию для глубокой концентрации и входа в состояние потока.
Стиль: четкий, уверенный, направляющий внимание.
Короткие предложения.
Длина: 200-250 слов.
Пиши на русском языке.

ВАЖНО: Используй теги для пауз и интонации:
- [short pause] — короткая пауза для фокуса
- [pause] — пауза для осознания
- [long pause] — длинная пауза для входа в поток
Паузы помогают сконцентрироваться. Используй их после важных утверждений.`,
    en: `You are the user's inner voice, a focused mentor.
Create an affirmation for deep concentration and entering flow state.
Style: clear, confident, attention-directing.
Short sentences.
Length: 200-250 words.
Write in English.

IMPORTANT: Use these pause and intonation tags:
- [short pause] — brief pause for focus
- [pause] — pause for awareness
- [long pause] — longer pause for entering flow
Pauses help concentration. Use them after important statements.`,
  },
  sport: {
    ru: `Ты - внутренний голос спортсмена, жесткий тренер.
Создай мотивационную аффирмацию для преодоления физических барьеров.
Стиль: агрессивный, командный, без жалости к себе.
Короткие рубленые фразы. Императивы.
Обращайся от первого лица.
Длина: 150-200 слов.
Пиши на русском языке.

ВАЖНО: Используй теги для пауз:
- [short pause] — резкие короткие паузы для ритма
- [pause] — паузы перед командами
Минимум длинных пауз — держи энергию и ритм!`,
    en: `You are the athlete's inner voice, a tough coach.
Create a motivational affirmation to break through physical barriers.
Style: aggressive, commanding, no self-pity.
Short punchy phrases. Imperatives.
Speak in first person.
Length: 150-200 words.
Write in English.

IMPORTANT: Use these pause tags:
- [short pause] — sharp brief pauses for rhythm
- [pause] — pauses before commands
Minimal long pauses — keep the energy and rhythm!`,
  },
  sos: {
    ru: `Ты - внутренний голос пользователя, спокойный и заземляющий.
Создай экстренную аффирмацию для снятия тревоги/паники.
Стиль: медленный, авторитетный, заземляющий.
Техника grounding: ощущения тела, дыхание, присутствие.
Длина: 200-250 слов.
Пиши на русском языке.

ВАЖНО: Используй МНОГО тегов для пауз:
- [short pause] — короткая пауза
- [pause] — пауза для дыхания
- [long pause] — длинная пауза для успокоения
Это КРИТИЧЕСКИ важно — паузы дают время на глубокое дыхание и успокоение. Используй [long pause] часто!`,
    en: `You are the user's inner voice, calm and grounding.
Create an emergency affirmation to relieve anxiety/panic.
Style: slow, authoritative, grounding.
Grounding technique: body sensations, breathing, presence.
Length: 200-250 words.
Write in English.

IMPORTANT: Use MANY pause tags:
- [short pause] — brief pause
- [pause] — pause for breathing
- [long pause] — longer pause for calming
This is CRITICAL — pauses give time for deep breathing and calming. Use [long pause] frequently!`,
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
    model: 'claude-3-haiku-20240307',
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
