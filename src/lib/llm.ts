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
// TRADER-FOCUSED: New scenarios for crypto/trading emotional control
const SCENARIO_PROMPTS: Record<string, { ru: string; en: string }> = {
  morning: {
    ru: `Создай утренний протокол для настройки перед торговой сессией.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я готов к рынку", "Мой план ясен", "Я контролирую риски"
- НЕПРАВИЛЬНО: "Ты готов", "Твой план" — это ЗАПРЕЩЕНО!

Стиль: холодный, деловой, без эмоций. Это не мотивация — это подготовка.
Короткие, чёткие предложения. Фокус на дисциплине и плане.
Длина: 150-200 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза между утверждениями
- [pause] — пауза для осознания
- [long pause] — пауза для фокуса`,
    en: `Create a morning protocol for pre-trading session setup.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I am ready for the market", "My plan is clear", "I control risk"
- WRONG: "You are ready", "Your plan" — this is FORBIDDEN!

Style: cold, business-like, emotionless. This is not motivation — it's preparation.
Short, clear sentences. Focus on discipline and plan.
Length: 150-200 words.
Write in English.

Pause tags:
- [short pause] — brief pause between statements
- [pause] — pause for awareness
- [long pause] — pause for focus`,
  },
  evening: {
    ru: `Создай протокол для отключения от рынка и перехода в режим сна.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я закрываю терминал", "Рынок подождёт до утра", "Моё тело просит отдыха"
- НЕПРАВИЛЬНО: "Ты закрываешь", "Твоё тело" — это ЗАПРЕЩЕНО!

Стиль: медленный, успокаивающий, но НЕ сентиментальный.
Фокус: отпустить рынок, отпустить свечи, переключиться на восстановление.
Длина: 200-250 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза
- [pause] — пауза для расслабления
- [long pause] — пауза для глубокого дыхания
Используй МНОГО длинных пауз — это протокол засыпания.`,
    en: `Create a protocol for disconnecting from the market and transitioning to sleep mode.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I close the terminal", "Market will wait until morning", "My body needs rest"
- WRONG: "You close", "Your body" — this is FORBIDDEN!

Style: slow, calming, but NOT sentimental.
Focus: let go of market, let go of candles, switch to recovery.
Length: 200-250 words.
Write in English.

Pause tags:
- [short pause] — brief pause
- [pause] — pause for relaxation
- [long pause] — pause for deep breathing
Use MANY long pauses — this is a sleep protocol.`,
  },
  focus: {
    ru: `Создай протокол для глубокой концентрации перед анализом или входом в сделку.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я вижу паттерн", "Мой анализ точен", "Я следую системе"
- НЕПРАВИЛЬНО: "Ты видишь", "Твой анализ" — это ЗАПРЕЩЕНО!

Стиль: чёткий, аналитический, без эмоций.
Короткие предложения. Фокус на системе и дисциплине.
Длина: 150-200 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза для фокуса
- [pause] — пауза для осознания
- [long pause] — пауза для входа в состояние потока`,
    en: `Create a protocol for deep concentration before analysis or trade entry.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I see the pattern", "My analysis is precise", "I follow the system"
- WRONG: "You see", "Your analysis" — this is FORBIDDEN!

Style: clear, analytical, emotionless.
Short sentences. Focus on system and discipline.
Length: 150-200 words.
Write in English.

Pause tags:
- [short pause] — brief pause for focus
- [pause] — pause for awareness
- [long pause] — pause for entering flow state`,
  },
  sport: {
    ru: `Создай протокол для максимальной энергии и драйва.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я заряжен!", "Моя энергия на максимуме!", "Я готов действовать!"
- НЕПРАВИЛЬНО: "Ты заряжен", "Твоя энергия" — это ЗАПРЕЩЕНО!

Стиль: агрессивный, энергичный, командный.
Короткие рубленые фразы.
Длина: 100-150 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — резкие короткие паузы
- [pause] — паузы перед командами
Минимум длинных пауз — держи энергию!`,
    en: `Create a protocol for maximum energy and drive.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I am charged!", "My energy is at max!", "I am ready to act!"
- WRONG: "You are charged", "Your energy" — this is FORBIDDEN!

Style: aggressive, energetic, commanding.
Short punchy phrases.
Length: 100-150 words.
Write in English.

Pause tags:
- [short pause] — sharp brief pauses
- [pause] — pauses before commands
Minimal long pauses — keep the energy!`,
  },
  // === TRADER-SPECIFIC SCENARIOS ===
  sos: {
    ru: `Создай экстренный протокол Anti-Tilt для трейдера после убыточной сделки.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я принимаю убыток", "Это плата за бизнес", "Я убираю руки от клавиатуры"
- НЕПРАВИЛЬНО: "Ты принимаешь", "Твой убыток" — это ЗАПРЕЩЕНО!

Контекст: Пользователь только что получил стоп-лосс и хочет отыграться (revenge trade).
Цель: Остановить revenge trade, принять убыток как часть бизнеса.

Стиль: ХОЛОДНЫЙ, авторитетный, без эмоций. Короткие предложения.
Ключевые фразы для использования:
- "Убыток — это плата за бизнес"
- "Я убираю руки от клавиатуры"
- "Рынок никуда не денется"
- "Я не revenge trader"
- "Эмоции — это ликвидность для маркетмейкеров"

Длина: 150-200 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза
- [pause] — пауза для дыхания
- [long pause] — длинная пауза для успокоения
Используй [long pause] ЧАСТО!`,
    en: `Create an emergency Anti-Tilt protocol for a trader after a losing trade.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I accept the loss", "This is cost of business", "I take my hands off the keyboard"
- WRONG: "You accept", "Your loss" — this is FORBIDDEN!

Context: User just got stopped out and wants revenge trade.
Goal: Stop revenge trade, accept loss as part of business.

Style: COLD, authoritative, emotionless. Short sentences.
Key phrases to use:
- "Loss is the cost of business"
- "I take my hands off the keyboard"
- "Market will be here tomorrow"
- "I am not a revenge trader"
- "Emotions are liquidity for market makers"

Length: 150-200 words.
Write in English.

Pause tags:
- [short pause] — brief pause
- [pause] — pause for breathing
- [long pause] — longer pause for calming
Use [long pause] FREQUENTLY!`,
  },
  diamond_hands: {
    ru: `Создай протокол Diamond Hands для удержания прибыльной позиции.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я держу позицию", "Мой план работает", "Страх — не советник"
- НЕПРАВИЛЬНО: "Ты держишь", "Твой план" — это ЗАПРЕЩЕНО!

Контекст: Актив растёт по плану, но страх заставляет закрыть раньше тейк-профита.
Цель: Укрепить дисциплину, напомнить о плане, удержать позицию.

Стиль: Уверенный, поддерживающий дисциплину, НО не эмоциональный.
Ключевые фразы:
- "Я видел план — я следую ему"
- "Страх — не советник"
- "Diamond hands"
- "Я забираю всё движение"
- "Жадность здесь — это дисциплина"

Длина: 150-200 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза
- [pause] — пауза для осознания
- [long pause] — пауза для укрепления уверенности`,
    en: `Create a Diamond Hands protocol for holding a profitable position.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I hold the position", "My plan is working", "Fear is not an advisor"
- WRONG: "You hold", "Your plan" — this is FORBIDDEN!

Context: Asset is going up as planned, but fear pushes to close before take-profit.
Goal: Strengthen discipline, remind of the plan, hold the position.

Style: Confident, discipline-supporting, BUT not emotional.
Key phrases:
- "I saw the plan — I follow it"
- "Fear is not an advisor"
- "Diamond hands"
- "I take the full move"
- "Greed here is discipline"

Length: 150-200 words.
Write in English.

Pause tags:
- [short pause] — brief pause
- [pause] — pause for awareness
- [long pause] — pause for building confidence`,
  },
  fomo_killer: {
    ru: `Создай протокол FOMO Killer для остановки импульсивного входа.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я останавливаюсь", "Где мой план входа?", "FOMO — налог на нетерпение"
- НЕПРАВИЛЬНО: "Ты останавливаешься", "Твой план" — это ЗАПРЕЩЕНО!

Контекст: Пользователь видит памп и хочет войти без анализа.
Цель: Остановить FOMO, вернуть к системе.

Стиль: Жёсткий, вопросительный, заземляющий.
Ключевые фразы:
- "Где мой план входа?"
- "Это сигнал системы или эмоция?"
- "FOMO — это налог на нетерпение"
- "Упущенная сделка лучше убыточной"
- "Я не покупаю хайп"

Длина: 150-200 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза
- [pause] — пауза для вопроса к себе
- [long pause] — пауза для осознания`,
    en: `Create a FOMO Killer protocol to stop impulsive entry.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I stop", "Where is my entry plan?", "FOMO is a tax on impatience"
- WRONG: "You stop", "Your plan" — this is FORBIDDEN!

Context: User sees a pump and wants to enter without analysis.
Goal: Stop FOMO, return to system.

Style: Hard, questioning, grounding.
Key phrases:
- "Where is my entry plan?"
- "Is this a system signal or emotion?"
- "FOMO is a tax on impatience"
- "A missed trade is better than a losing trade"
- "I don't buy hype"

Length: 150-200 words.
Write in English.

Pause tags:
- [short pause] — brief pause
- [pause] — pause for self-questioning
- [long pause] — pause for awareness`,
  },
  market_close: {
    ru: `Создай протокол Market Close для отключения от рынка и глубокого сна.

КРИТИЧЕСКИ ВАЖНО: Пиши ТОЛЬКО от ПЕРВОГО ЛИЦА!
- Правильно: "Я закрываю терминал", "Рынок будет завтра", "Моё тело просит отдыха"
- НЕПРАВИЛЬНО: "Ты закрываешь", "Твой терминал" — это ЗАПРЕЩЕНО!

Контекст: Поздняя ночь, усталость, переторговка. Глаза красные от свечей.
Цель: Вывести в режим сна, отключить от рынка.

Стиль: Мягкий, успокаивающий, медленный темп.
Ключевые фразы:
- "Рынок будет завтра"
- "Моё тело просит отдыха"
- "Отпусти свечи"
- "Усталый трейдер — убыточный трейдер"
- "Сон — это часть стратегии"

Длина: 200-250 слов.
Пиши на русском языке.

Теги пауз:
- [short pause] — короткая пауза
- [pause] — пауза для расслабления
- [long pause] — пауза для погружения в сон
Используй ОЧЕНЬ МНОГО длинных пауз — это протокол засыпания!`,
    en: `Create a Market Close protocol for disconnecting from market and deep sleep.

CRITICAL: Write ONLY in FIRST PERSON!
- Correct: "I close the terminal", "Market will be here tomorrow", "My body needs rest"
- WRONG: "You close", "Your terminal" — this is FORBIDDEN!

Context: Late night, exhaustion, overtrading. Red eyes from candles.
Goal: Transition to sleep mode, disconnect from market.

Style: Soft, calming, slow pace.
Key phrases:
- "Market will be here tomorrow"
- "My body needs rest"
- "Let go of the candles"
- "A tired trader is a losing trader"
- "Sleep is part of the strategy"

Length: 200-250 words.
Write in English.

Pause tags:
- [short pause] — brief pause
- [pause] — pause for relaxation
- [long pause] — pause for sleep immersion
Use VERY MANY long pauses — this is a sleep protocol!`,
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
