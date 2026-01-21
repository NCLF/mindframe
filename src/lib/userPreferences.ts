// User Preferences Storage
// Handles voice and user settings with localStorage persistence

import type { VoiceGender, VoiceAge, VoiceProfile } from './elevenlabs';

const STORAGE_KEY = 'mindframe_preferences';

export interface UserPreferences {
  // Voice settings
  voiceGender: VoiceGender;
  voiceAge?: VoiceAge;
  selectedVoiceId?: string; // Custom voice selection override
  voiceProfile: VoiceProfile; // Voice beautification profile
  clonedVoiceId?: string; // User's cloned voice ID (from ElevenLabs)

  // User profile
  userGender?: VoiceGender;
  userAge?: VoiceAge;

  // Onboarding status
  hasCompletedOnboarding: boolean;
  psychotype?: 'achiever' | 'thinker' | 'creative' | 'caregiver';

  // Preferences
  autoPlayAfterGeneration: boolean;
  binauralBeatsEnabled: boolean;
  showPauseTags: boolean; // For debugging
}

const DEFAULT_PREFERENCES: UserPreferences = {
  voiceGender: 'female',
  voiceProfile: 'confidence',
  hasCompletedOnboarding: false,
  autoPlayAfterGeneration: true,
  binauralBeatsEnabled: true,
  showPauseTags: false,
};

/**
 * Get user preferences from localStorage
 */
export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn('[Preferences] Failed to load preferences:', e);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES, ...preferences };
  }

  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('[Preferences] Failed to save preferences:', e);
    return { ...DEFAULT_PREFERENCES, ...preferences };
  }
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[Preferences] Failed to reset preferences:', e);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Try to detect gender from Telegram user name
 * This is a heuristic and not always accurate
 * Russian names have gender patterns we can use
 */
export function detectGenderFromName(firstName: string): VoiceGender | null {
  if (!firstName) return null;

  const name = firstName.toLowerCase().trim();

  // Common Russian female name endings
  const femaleEndings = ['а', 'я', 'ия', 'ья'];
  // Common Russian male name endings
  const maleEndings = ['й', 'н', 'р', 'л', 'м', 'в', 'д', 'с', 'к', 'г', 'б', 'т', 'ш', 'ч', 'ж'];

  // Exceptions - male names ending in 'а'
  const maleExceptions = ['никита', 'илья', 'саша', 'миша', 'коля', 'ваня', 'женя', 'дима', 'лёша', 'леша', 'костя', 'паша'];
  // Exceptions - female names not ending in typical patterns
  const femaleExceptions = ['любовь', 'нинель', 'рахиль', 'эсфирь'];

  // Check exceptions first
  if (maleExceptions.includes(name)) return 'male';
  if (femaleExceptions.includes(name)) return 'female';

  // Check endings
  for (const ending of femaleEndings) {
    if (name.endsWith(ending)) return 'female';
  }

  for (const ending of maleEndings) {
    if (name.endsWith(ending)) return 'male';
  }

  // English names heuristics
  const englishFemale = ['alice', 'anna', 'emma', 'olivia', 'sophia', 'mia', 'isabella', 'emily', 'sarah', 'jessica', 'kate', 'mary', 'jennifer', 'elizabeth'];
  const englishMale = ['james', 'john', 'michael', 'david', 'daniel', 'alex', 'max', 'tom', 'jack', 'william', 'chris', 'andrew', 'ryan', 'mark'];

  if (englishFemale.includes(name)) return 'female';
  if (englishMale.includes(name)) return 'male';

  // Cannot determine
  return null;
}

/**
 * Initialize preferences from Telegram user data
 */
export function initPreferencesFromTelegram(user: { first_name: string; last_name?: string }): UserPreferences {
  const current = getPreferences();

  // Only detect if not already set
  if (!current.userGender) {
    const detectedGender = detectGenderFromName(user.first_name);
    if (detectedGender) {
      // Set both user gender and voice gender to match
      return savePreferences({
        userGender: detectedGender,
        voiceGender: detectedGender,
      });
    }
  }

  return current;
}
