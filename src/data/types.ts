import { DataIndex, DataIndex2, DataIndexArray } from "./DataIndex";
import cardData from "./manual/cards.json";
import evolutionData from "./manual/evolutions.json";
import expansionData from "./manual/expansions.json";
import packData from "./manual/packs.json";
import pokemonTypeData from "./manual/pokemon-types.json";
import languageData from "./manual/languages.json";
import tsvConverterHeaderOverwriteData from "./manual/tsvconverter-header-overwrites.json";
import cardRelationData from "./generated/card-relations.json";
import pokemonTranslationData from "./generated/pokemon-translations.json";
import targetablesData from "./generated/targetables.json";
import traitData from "./generated/traits.json";
import ja from "../locales/ja.json";
import { COLOR_LESS_JA } from "../const";

/**
 * 進化
 */
export type Evolutions = {
  [key: string]: string;
};
export const evolutions: Evolutions = evolutionData;
export function getPreEvolution(pokemonName: string) {
  return evolutions.hasOwnProperty(pokemonName)
    ? evolutions[pokemonName]
    : undefined;
}
export const hasPostEvolution = (() => {
  const preEvolvutions = new Set(Object.values(evolutions));
  return function (pokemonName: string) {
    return preEvolvutions.has(pokemonName);
  };
})();
export function getEvolutionStage(pokemonName: string) {
  const evolutionFrom = getPreEvolution(pokemonName);
  return evolutionFrom === undefined
    ? 0
    : getPreEvolution(evolutionFrom)
      ? 2
      : 1;
}
export const evolutionStageNames = [
  "card-status.evolution.basic",
  "card-status.evolution.stage1",
  "card-status.evolution.stage2",
] as const;

/**
 * 拡張パック
 */
export type Expansion = {
  名前: string;
  名前_en: string;
  略号: string;
  カード種類数: number;
};
export const expansions: Expansion[] = expansionData;
export const dummyExpansion = expansions[0];
export const getExpansionByName = DataIndex(
  expansions,
  (expansion: Expansion) => expansion.名前
);
export type Pack = {
  名前: string;
  名前_en: string;
  エキスパンション名: string;
};
export const packs: Pack[] = packData;
export const getPackByName = DataIndex(packs, (pack: Pack) => pack.名前);
export const getExpansionByPackName = DataIndex2(
  packs,
  (pack: Pack) => pack.名前,
  (pack: Pack) => getExpansionByName(pack.エキスパンション名)
);
export const getPacksByExpansionName = DataIndexArray(
  packs,
  (pack: Pack) => pack.エキスパンション名
);

export const trainerCardCategories = Object.values(ja["card-status"].trainer);
export type TrainerCardCategory = (typeof trainerCardCategories)[number];
export const getTranslationKeyOfTrainerCardCategory = DataIndex2(
  Object.entries(ja["card-status"].trainer),
  ([_, ja]: [string, string]) => ja,
  ([translationKey, _]: [string, string]) =>
    `card-status.trainer.${translationKey}`
);

/**
 * カード
 */
export type BaseCard = {
  ID: number;
  パック: string;
  コレクションナンバー: number;
  名前: string;
  名前_en?: string;
  レアリティ: number;
};
export type PokemonCard = BaseCard & {
  HP: number;
  タイプ: string;
  弱点: string;
  にげる: number;
  ex?: true;
};
export type TrainerCard = BaseCard & {
  トレーナーズ: TrainerCardCategory;
};
export type FossilCard = TrainerCard & {
  トレーナーズ: (typeof trainerCardCategories)[3];
  HP: number;
};
export type Card = BaseCard | PokemonCard | TrainerCard | FossilCard;
export const cards: Card[] = cardData;
export const dummyCard = cards[0];
export const isVariant = (cardA: Card, cardB: Card) => {
  const traitsA = getTraits(cardA.ID);
  const traitsB = getTraits(cardB.ID);
  return (
    cardA.名前 === cardB.名前 &&
    (!("タイプ" in cardA) ||
      ("タイプ" in cardB &&
        cardA.タイプ === cardB.タイプ &&
        cardA.弱点 === cardB.弱点 &&
        cardA.にげる === cardB.にげる &&
        getCardName({ card: cardA, withSuffix }) ===
          getCardName({ card: cardB, withSuffix }))) &&
    (!("HP" in cardA) || ("HP" in cardB && cardA.HP === cardB.HP)) &&
    (!("トレーナーズ" in cardA) ||
      ("トレーナーズ" in cardB && cardA.トレーナーズ === cardB.トレーナーズ)) &&
    traitsA.every((trait, i) => {
      const traitB = traitsB[i];
      return (
        ((!("効果" in trait) && !("効果" in traitB)) ||
          ("効果" in trait &&
            "効果" in traitB &&
            trait.効果 === traitB.効果)) &&
        (!("一致エネルギー数" in trait) ||
          ("一致エネルギー数" in traitB &&
            trait.一致エネルギー数 === traitB.一致エネルギー数 &&
            trait.無色エネルギー数 === traitB.無色エネルギー数 &&
            trait.必要エネルギー上書き === traitB.必要エネルギー上書き &&
            trait.威力 === traitB.威力))
      );
    })
  );
};

/**
 * ワザ
 */
export type BaseCardTrait = {
  カードID: number;
};
export type BaseCardTraitWithEffect = BaseCardTrait & {
  効果: string;
  効果_en: string;
};
export type PokemonCardAbility = BaseCardTraitWithEffect & {
  名前: string;
};
export type PokemonCardAttack = (BaseCardTrait | BaseCardTraitWithEffect) & {
  名前: string;
  一致エネルギー数: number;
  無色エネルギー数: number;
  必要エネルギー上書き?: string;
  威力: number;
};
export type TrainerCardTrait = BaseCardTraitWithEffect;
export type Trait = PokemonCardAbility | PokemonCardAttack | TrainerCardTrait;
// FIXME: 型パズルに敗北
// @ts-ignore
export const traits: Trait[] = traitData;
export const getTraits = DataIndexArray(
  traits,
  (trait: Trait) => trait.カードID
);

export type PokemonType = {
  color: string;
  shorten: string;
  translations: {
    en: string;
    ja: string;
  };
};
export const pokemonTypes: PokemonType[] = pokemonTypeData;
export const japaneseToTypes = DataIndex(
  pokemonTypes,
  (pokemonType: PokemonType) => pokemonType.translations.ja
);
export const colorLess = japaneseToTypes(COLOR_LESS_JA);
export const shortenToTypes = DataIndex(
  pokemonTypes,
  (pokemonType: PokemonType) => pokemonType.shorten
);

/**
 * カード名とその関連カードのリスト。
 */
export type CardRelations = Record<
  string,
  {
    cardIds: number[];
    evolutions?: string[];
    targetedBy?: number[];
  }
>;
export const cardRelations: CardRelations = cardRelationData;

/**
 * カードidとそのカードの効果に記されているカード名。
 * 例: "123": ["ギャロップ", "ブーバー", "キュウコン"],
 */
export type Targetables = Record<string, string[]>;
export const targetables: Targetables = targetablesData;

/**
 * 言語
 */
export type Language = {
  code: string;
  name: string;
  translated?: boolean;
};
export const languages: Language[] = languageData;
const getPropertyName = (language: PokemonNameLanguages) =>
  language === "ja" ? "名前" : "名前_en";
export const getTranslatedName = (
  target: { 名前: string; 名前_en?: string },
  language: PokemonNameLanguages
) => target[getPropertyName(language)] ?? target.名前;
export const getTranslatedEffect = (
  target: { 効果: string; 効果_en?: string },
  language: PokemonNameLanguages
) => target[language === "ja" ? "効果" : "効果_en"] ?? target.効果;

export const pokemonNameLanguages = [
  "en",
  // "es", 英語と同じ
  "fr",
  "de",
  // "it", 英語と同じ
  // "pt", 英語と同じ
  "ko",
  "ja",
  "zh-Hant",
  // 不使用
  // "th",
  // "ru",
  // "zh-Hans",
] as const;
export type PokemonNameLanguages = (typeof pokemonNameLanguages)[number];

type PokemonTranslationData = {
  [jp_name in string]: {
    [language in PokemonNameLanguages]: string;
  };
};
export const pokemonTranslations: PokemonTranslationData =
  pokemonTranslationData;

export type CardNameGetterOption = {
  card: Card;
  language?: PokemonNameLanguages;
  withSuffix?: boolean;
  reverse?: boolean;
};
export const withSuffix = true;
export function getCardName({
  card,
  language = "ja",
  withSuffix = false,
  reverse = false,
}: CardNameGetterOption) {
  let baseCardName;
  if (card.名前 in pokemonTranslations) {
    baseCardName = pokemonTranslations[card.名前][language];
  } else {
    baseCardName = card[getPropertyName(language)] ?? "";
  }
  if (baseCardName === "") {
    console.error(`${card.名前}の${language}での名前が見つかりませんでした。`);
  }
  return withSuffix && "ex" in card !== reverse
    ? language === "ja"
      ? `${baseCardName}ex`
      : `${baseCardName} ex`
    : baseCardName;
}
export const findTranslatedCardNameByName = (
  cardName: string,
  language: PokemonNameLanguages
) => {
  const card = cards.find(
    (card) => getCardName({ card, withSuffix }) === cardName
  );
  if (card === undefined) {
    console.log(
      `${cardName}の${language}での名前が見つからなかったので、未翻訳状態になります。`
    );
    return cardName;
  }
  return getCardName({
    card,
    language,
    withSuffix,
  });
};

/**
 * TSV変換
 */
export type TsvConverterHeaderOverwrite = {
  [key: string]: string;
};
export const tsvConverterHeaderOverwrites = tsvConverterHeaderOverwriteData;
