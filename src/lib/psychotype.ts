// Psychotype Diagnosis Module
// Determines user's mental profile for personalized defaults

import type { ScenarioType, VoiceProfile } from './elevenlabs';
import type { BinauralPreset } from './audio/binaural';

// ============ Psychotype Types ============
export type Psychotype = 'achiever' | 'thinker' | 'creative' | 'caregiver';

export interface PsychotypeProfile {
  id: Psychotype;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  emoji: string;
  defaultScenario: ScenarioType;
  defaultVoiceProfile: VoiceProfile;
  defaultBinaural: BinauralPreset;
  traits: string[];
  traitsRu: string[];
}

// ============ Psychotype Profiles ============
export const PSYCHOTYPE_PROFILES: Record<Psychotype, PsychotypeProfile> = {
  achiever: {
    id: 'achiever',
    name: 'Achiever',
    nameRu: 'Достигатор',
    description: 'Goal-oriented, driven, loves challenges',
    descriptionRu: 'Целеустремлённый, амбициозный, любит вызовы',
    emoji: '🚀',
    defaultScenario: 'morning',
    defaultVoiceProfile: 'confidence',
    defaultBinaural: 'gamma',
    traits: ['Competitive', 'Results-focused', 'High energy'],
    traitsRu: ['Конкурентный', 'Нацелен на результат', 'Высокая энергия'],
  },
  thinker: {
    id: 'thinker',
    name: 'Thinker',
    nameRu: 'Аналитик',
    description: 'Analytical, strategic, loves learning',
    descriptionRu: 'Аналитичный, стратегичный, любит учиться',
    emoji: '🧠',
    defaultScenario: 'focus',
    defaultVoiceProfile: 'mentor',
    defaultBinaural: 'alpha',
    traits: ['Logical', 'Detail-oriented', 'Curious'],
    traitsRu: ['Логичный', 'Внимателен к деталям', 'Любознательный'],
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    nameRu: 'Креатор',
    description: 'Imaginative, intuitive, loves creating',
    descriptionRu: 'Креативный, интуитивный, любит создавать',
    emoji: '🎨',
    defaultScenario: 'focus',
    defaultVoiceProfile: 'mentor',
    defaultBinaural: 'theta',
    traits: ['Innovative', 'Flexible', 'Expressive'],
    traitsRu: ['Инновативный', 'Гибкий', 'Экспрессивный'],
  },
  caregiver: {
    id: 'caregiver',
    name: 'Caregiver',
    nameRu: 'Хранитель',
    description: 'Empathetic, supportive, values harmony',
    descriptionRu: 'Эмпатичный, заботливый, ценит гармонию',
    emoji: '💚',
    defaultScenario: 'evening',
    defaultVoiceProfile: 'calmness',
    defaultBinaural: 'alpha',
    traits: ['Nurturing', 'Patient', 'Collaborative'],
    traitsRu: ['Заботливый', 'Терпеливый', 'Командный'],
  },
};

// ============ Quiz Questions ============
export interface QuizQuestion {
  id: string;
  question: string;
  questionRu: string;
  options: {
    id: string;
    text: string;
    textRu: string;
    scores: Record<Psychotype, number>;
  }[];
}

export const PSYCHOTYPE_QUIZ: QuizQuestion[] = [
  {
    id: 'morning',
    question: 'What energizes you most in the morning?',
    questionRu: 'Что даёт тебе энергию утром?',
    options: [
      {
        id: 'goals',
        text: 'Planning my goals for the day',
        textRu: 'Планирование целей на день',
        scores: { achiever: 3, thinker: 1, creative: 0, caregiver: 0 },
      },
      {
        id: 'learn',
        text: 'Reading or learning something new',
        textRu: 'Чтение или изучение нового',
        scores: { achiever: 0, thinker: 3, creative: 1, caregiver: 0 },
      },
      {
        id: 'create',
        text: 'Creative inspiration, new ideas',
        textRu: 'Творческое вдохновение, новые идеи',
        scores: { achiever: 0, thinker: 0, creative: 3, caregiver: 1 },
      },
      {
        id: 'calm',
        text: 'Peaceful start, mindful moments',
        textRu: 'Спокойное начало, осознанные моменты',
        scores: { achiever: 0, thinker: 1, creative: 0, caregiver: 3 },
      },
    ],
  },
  {
    id: 'stress',
    question: 'How do you typically handle stress?',
    questionRu: 'Как ты обычно справляешься со стрессом?',
    options: [
      {
        id: 'action',
        text: 'Take action, solve the problem',
        textRu: 'Действую, решаю проблему',
        scores: { achiever: 3, thinker: 1, creative: 0, caregiver: 0 },
      },
      {
        id: 'analyze',
        text: 'Analyze the situation carefully',
        textRu: 'Анализирую ситуацию',
        scores: { achiever: 1, thinker: 3, creative: 0, caregiver: 0 },
      },
      {
        id: 'escape',
        text: 'Find a creative outlet',
        textRu: 'Нахожу творческий выход',
        scores: { achiever: 0, thinker: 0, creative: 3, caregiver: 1 },
      },
      {
        id: 'support',
        text: 'Seek support from others',
        textRu: 'Ищу поддержку у близких',
        scores: { achiever: 0, thinker: 0, creative: 1, caregiver: 3 },
      },
    ],
  },
  {
    id: 'success',
    question: 'What does success mean to you?',
    questionRu: 'Что для тебя значит успех?',
    options: [
      {
        id: 'achieve',
        text: 'Achieving ambitious goals',
        textRu: 'Достижение амбициозных целей',
        scores: { achiever: 3, thinker: 0, creative: 1, caregiver: 0 },
      },
      {
        id: 'master',
        text: 'Mastering a skill or field',
        textRu: 'Мастерство в своём деле',
        scores: { achiever: 1, thinker: 3, creative: 1, caregiver: 0 },
      },
      {
        id: 'express',
        text: 'Creating something meaningful',
        textRu: 'Создание чего-то значимого',
        scores: { achiever: 0, thinker: 1, creative: 3, caregiver: 0 },
      },
      {
        id: 'balance',
        text: 'Living a balanced, harmonious life',
        textRu: 'Гармоничная, сбалансированная жизнь',
        scores: { achiever: 0, thinker: 0, creative: 0, caregiver: 3 },
      },
    ],
  },
  {
    id: 'focus',
    question: 'When you need to focus, you prefer:',
    questionRu: 'Когда нужно сосредоточиться, ты предпочитаешь:',
    options: [
      {
        id: 'deadline',
        text: 'Clear deadline and pressure',
        textRu: 'Чёткий дедлайн и давление',
        scores: { achiever: 3, thinker: 1, creative: 0, caregiver: 0 },
      },
      {
        id: 'quiet',
        text: 'Quiet space, no distractions',
        textRu: 'Тихое место без отвлечений',
        scores: { achiever: 0, thinker: 3, creative: 1, caregiver: 1 },
      },
      {
        id: 'inspire',
        text: 'Inspiring environment, music',
        textRu: 'Вдохновляющая обстановка, музыка',
        scores: { achiever: 0, thinker: 0, creative: 3, caregiver: 1 },
      },
      {
        id: 'together',
        text: 'Working alongside others',
        textRu: 'Работа рядом с другими',
        scores: { achiever: 1, thinker: 0, creative: 1, caregiver: 3 },
      },
    ],
  },
  {
    id: 'relax',
    question: 'Your ideal way to relax:',
    questionRu: 'Твой идеальный способ расслабиться:',
    options: [
      {
        id: 'sport',
        text: 'Active rest, sports',
        textRu: 'Активный отдых, спорт',
        scores: { achiever: 3, thinker: 0, creative: 0, caregiver: 1 },
      },
      {
        id: 'read',
        text: 'Reading, documentaries',
        textRu: 'Чтение, документалки',
        scores: { achiever: 0, thinker: 3, creative: 1, caregiver: 0 },
      },
      {
        id: 'hobby',
        text: 'Creative hobbies, art',
        textRu: 'Творческие хобби, искусство',
        scores: { achiever: 0, thinker: 1, creative: 3, caregiver: 0 },
      },
      {
        id: 'social',
        text: 'Time with loved ones',
        textRu: 'Время с близкими',
        scores: { achiever: 0, thinker: 0, creative: 1, caregiver: 3 },
      },
    ],
  },
];

// ============ Quiz Logic ============

export interface QuizResult {
  psychotype: Psychotype;
  scores: Record<Psychotype, number>;
  profile: PsychotypeProfile;
}

/**
 * Calculate psychotype from quiz answers
 * @param answers - Map of question ID to selected option ID
 */
export function calculatePsychotype(answers: Record<string, string>): QuizResult {
  const scores: Record<Psychotype, number> = {
    achiever: 0,
    thinker: 0,
    creative: 0,
    caregiver: 0,
  };

  // Sum scores from all answers
  for (const [questionId, optionId] of Object.entries(answers)) {
    const question = PSYCHOTYPE_QUIZ.find(q => q.id === questionId);
    if (!question) continue;

    const option = question.options.find(o => o.id === optionId);
    if (!option) continue;

    for (const [type, score] of Object.entries(option.scores)) {
      scores[type as Psychotype] += score;
    }
  }

  // Find highest scoring psychotype
  let maxScore = 0;
  let resultType: Psychotype = 'achiever';

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      resultType = type as Psychotype;
    }
  }

  return {
    psychotype: resultType,
    scores,
    profile: PSYCHOTYPE_PROFILES[resultType],
  };
}

/**
 * Get default settings for a psychotype
 */
export function getDefaultsForPsychotype(psychotype: Psychotype) {
  const profile = PSYCHOTYPE_PROFILES[psychotype];
  return {
    scenario: profile.defaultScenario,
    voiceProfile: profile.defaultVoiceProfile,
    binaural: profile.defaultBinaural,
  };
}
