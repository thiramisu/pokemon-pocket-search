import { computed, ref, watch } from "vue";
import {
  Card,
  getTranslatedCardName,
  getTranslatedName,
  PokemonNameLanguages,
} from "../data/types";

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
      () =>
        (card: Card, language = languageRef.value) =>
          getTranslatedCardName(card, language)
    ),
    getSharedExpansionName: computed(
      () =>
        (expansionName: string, language = languageRef.value) =>
          language === "en" ? `(${expansionName})` : `（${expansionName}）`
    ),
    getTranslatedName: computed(
      () =>
        (
          target: { 名前: string; 名前_en: string },
          language = languageRef.value
        ) =>
          getTranslatedName(target, language)
    ),
  } as const;
  return () => returnValue;
})();
