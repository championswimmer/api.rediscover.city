// Supported languages for the Rediscover City API
export const ENABLED_LANGUAGES = [
  "english",
  "spanish", 
  "italian",
  "french",
  "hindi",
  "bangla",
  "chinese"
] as const;

export type EnabledLanguage = typeof ENABLED_LANGUAGES[number];

export const isValidLanguage = (lang: string): lang is EnabledLanguage => {
  return ENABLED_LANGUAGES.includes(lang as EnabledLanguage);
};