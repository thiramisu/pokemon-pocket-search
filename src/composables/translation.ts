import { computed, ref, watch } from "vue";
import { Card, PokemonNameLanguages, pokemonTranslations } from "../data/types";

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

  const getPropertyName = (language: PokemonNameLanguages) =>
    language === "ja" ? "名前" : "名前_en";
  const returnValue = {
    language: languageRef,
    getTranslatedCardName: computed(
      () =>
        (card: Card, language = languageRef.value) => {
          if (card.名前 in pokemonTranslations) {
            return pokemonTranslations[card.名前][language];
          } else if (language === "ja") {
            return card.名前;
          } else if (language === "en" && card.名前_en !== undefined) {
            return card.名前_en;
          } else {
            console.error(
              `${card.名前}の${language}での名前が見つかりませんでした。`
            );
            return "";
          }
        }
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
          target[getPropertyName(language)]
    ),
  } as const;
  return () => returnValue;
})();
