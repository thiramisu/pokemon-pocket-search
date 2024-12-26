import { computed, ref, watch } from "vue";
import { createI18n } from "vue-i18n";
import {
  CardNameGetterOption,
  getCardName,
  getTranslatedEffect,
  getTranslatedName,
  PokemonNameLanguages,
} from "../data/types";
import en from "../locales/en.json";
import ja from "../locales/ja.json";

/**
 * 言語
 */
export const useTranslation = (() => {
  const languageRef = (() => {
    const savedLanguage = localStorage.getItem(
      "language"
    ) as PokemonNameLanguages;
    return ref<PokemonNameLanguages>(savedLanguage ?? "ja");
  })();
  const i18n = {
    legacy: false,
    locale: languageRef.value,
    fallbackLocale: "en",
    messages: {
      en,
      ja,
    },
  };

  watch(
    languageRef,
    (newValue) => {
      if (newValue !== undefined) {
        localStorage.setItem("language", newValue);
      }
    },
    { immediate: true }
  );

  const returnValue = {
    language: languageRef,
    getTranslatedCardName: computed(
      () => (options: CardNameGetterOption) =>
        getCardName({
          language: options.language ?? languageRef.value,
          ...options,
        })
    ),
    getTranslatedName: computed(
      () =>
        (
          target: { 名前: string; 名前_en?: string },
          language = languageRef.value
        ) =>
          getTranslatedName(target, language)
    ),
    getTranslatedEffect: computed(
      () =>
        (
          target: { 効果: string; 効果_en?: string },
          language = languageRef.value
        ) =>
          getTranslatedEffect(target, language)
    ),
    i18n: createI18n(i18n),
  } as const;
  return () => returnValue;
})();
