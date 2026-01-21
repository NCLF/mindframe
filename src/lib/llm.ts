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
// CRITICAL: All affirmations MUST be in FIRST PERSON (Я/I) - user repeats them!
const SCENARIO_PROMPTS: Record<string, { ru: string; en: string }> = {
  morning: {
    ru: `Создай утреннюю аффирмацию для настройки на продуктивный день.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я чувствую энергию", "Я готов действовать", "Моё тело наполняется силой"
- НЕПРАВИЛЬНО: "Ты чувствуешь", "Твоё тело" — это ЗАПРЕЩЕНО!

Стиль: энергичный, утвердительный, вдохновляющий.
Используй короткие, ритмичные предложения.
Длина: 200-300 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза между фразами
- [pause] — средняя пауза для осмысления
- [long pause] — длинная пауза в ключевых моментах`,
    en: `Create a morning affirmation to set up for a productive day.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I feel energy", "I am ready to act", "My body fills with strength"
- WRONG: "You feel", "Your body" — this is FORBIDDEN!

Style: energetic, assertive, inspiring.
Use short, rhythmic sentences.
Length: 200-300 words.
Write in English.

Pause tags:
- [short pause] — brief pause between phrases
- [pause] — medium pause for reflection
- [long pause] — longer pause at key moments`,
  },
  evening: {
    ru: `Создай вечернюю аффирмацию для глубокого расслабления и сна.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я отпускаю напряжение", "Моё дыхание замедляется", "Я заслуживаю отдых"
- НЕПРАВИЛЬНО: "Ты отпускаешь", "Твоё дыхание" — это ЗАПРЕЩЕНО!

Стиль: тягучий, медитативный, убаюкивающий.
Длинные плавные предложения. Метафоры тепла, мягкости, безопасности.
Длина: 250-350 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза
- [pause] — средняя пауза для расслабления
- [long pause] — длинная пауза для погружения
Используй МНОГО пауз — это вечерняя медитация.`,
    en: `Create an evening affirmation for deep relaxation and sleep.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I release tension", "My breathing slows", "I deserve rest"
- WRONG: "You release", "Your breathing" — this is FORBIDDEN!

Style: flowing, meditative, soothing.
Long smooth sentences. Metaphors of warmth, softness, safety.
Length: 250-350 words.
Write in English.

Pause tags:
- [short pause] — brief pause
- [pause] — medium pause for relaxation
- [long pause] — longer pause for deep immersion
Use MANY pauses — this is an evening meditation.`,
  },
  focus: {
    ru: `Создай аффирмацию для глубокой концентрации и входа в состояние потока.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я фокусируюсь", "Мой разум ясен", "Я вхожу в поток"
- НЕПРАВИЛЬНО: "Ты фокусируешься", "Твой разум" — это ЗАПРЕЩЕНО!

Стиль: четкий, уверенный, направляющий внимание.
Короткие предложения.
Длина: 200-250 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза для фокуса
- [pause] — пауза для осознания
- [long pause] — длинная пауза для входа в поток`,
    en: `Create an affirmation for deep concentration and entering flow state.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I focus", "My mind is clear", "I enter the flow"
- WRONG: "You focus", "Your mind" — this is FORBIDDEN!

Style: clear, confident, attention-directing.
Short sentences.
Length: 200-250 words.
Write in English.

Pause tags:
- [short pause] — brief pause for focus
- [pause] — pause for awareness
- [long pause] — longer pause for entering flow`,
  },
  sport: {
    ru: `Создай мотивационную аффирмацию для преодоления физических барьеров.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я сильнее боли!", "Моё тело — машина!", "Я не сдаюсь!"
- НЕПРАВИЛЬНО: "Ты сильнее", "Твоё тело" — это ЗАПРЕЩЕНО!

Стиль: агрессивный, командный, без жалости к себе.
Короткие рубленые фразы. Императивы к себе.
Длина: 150-200 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — резкие короткие паузы для ритма
- [pause] — паузы перед командами
Минимум длинных пауз — держи энергию!`,
    en: `Create a motivational affirmation to break through physical barriers.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I am stronger than pain!", "My body is a machine!", "I don't give up!"
- WRONG: "You are stronger", "Your body" — this is FORBIDDEN!

Style: aggressive, commanding, no self-pity.
Short punchy phrases. Self-imperatives.
Length: 150-200 words.
Write in English.

Pause tags:
- [short pause] — sharp brief pauses for rhythm
- [pause] — pauses before commands
Minimal long pauses — keep the energy!`,
  },
  sos: {
    ru: `Создай экстренную аффирмацию для снятия тревоги/паники.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я в безопасности", "Моё дыхание спокойно", "Я здесь и сейчас"
- НЕПРАВИЛЬНО: "Ты в безопасности", "Твоё дыхание" — это ЗАПРЕЩЕНО!

Стиль: медленный, авторитетный, заземляющий.
Техника grounding: ощущения тела, дыхание, присутствие.
Длина: 200-250 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза
- [pause] — пауза для дыхания
- [long pause] — длинная пауза для успокоения
Используй [long pause] ЧАСТО — паузы дают время на глубокое дыхание!`,
    en: `Create an emergency affirmation to relieve anxiety/panic.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I am safe", "My breathing is calm", "I am here and now"
- WRONG: "You are safe", "Your breathing" — this is FORBIDDEN!

Style: slow, authoritative, grounding.
Grounding technique: body sensations, breathing, presence.
Length: 200-250 words.
Write in English.

Pause tags:
- [short pause] — brief pause
- [pause] — pause for breathing
- [long pause] — longer pause for calming
Use [long pause] FREQUENTLY — pauses give time for deep breathing!`,
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
