import { DataIndex, DataIndex2, DataIndexArray } from "./DataIndex";
import traitData from "./manual/traits.json";
import cardData from "./manual/cards.json";
import evolutionData from "./manual/evolutions.json";
import expansionData from "./manual/expansions.json";
import packData from "./manual/packs.json";
import pokemonTypeData from "./manual/pokemon-types.json";
import languageData from "./manual/languages.json";
import tsvConverterHeaderOverwriteData from "./manual/tsvconverter-header-overwrites.json";
import cardRelationData from "./generated/card-relations.json";
import targetablesData from "./generated/targetables.json";
import { COLOR_LESS_JP } from "../const";

/**
 * 言語
 */
export type Language = {
  code: string;
  name: string;
  translated?: boolean;
};
export const languages: Language[] = languageData;

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
export function getEvolutionStage(pokemonName: string) {
  const evolutionFrom = getPreEvolution(pokemonName);
  return evolutionFrom === undefined
    ? 0
    : getPreEvolution(evolutionFrom)
      ? 2
      : 1;
}
export const evolutionStageNames = ["たね", "1進化", "2進化"] as const;

/**
 * 拡張パック
 */
export type Expansion = {
  名前: string;
  略号: string;
  カード種類数: number;
};
export const expansions: Expansion[] = expansionData;
export const dummyExpansion = expansions[0];
export const getExpansionByName = DataIndex(
  expansions,
  (expansion: Expansion) => expansion.名前
);
export const getSharedExpansionName = (expansionName: string) =>
  `（${expansionName}）`;
export type Pack = {
  名前: string;
  エキスパンション名: string;
};
export const packs: Pack[] = packData;
export const getExpansionByPackName = DataIndex2(
  packs,
  (pack: Pack) => pack.名前,
  (pack: Pack) => getExpansionByName(pack.エキスパンション名)
);
export const getPacksByExpansionName = DataIndexArray(
  packs,
  (pack: Pack) => pack.エキスパンション名
);

/**
 * カード
 */
export const trainerCardCategories = [
  "グッズ",
  "ポケモンのどうぐ",
  "サポート",
  "グッズ\n(化石)",
] as const;
export type TrainerCardCategories = (typeof trainerCardCategories)[number];
export type BaseCard = {
  ID: number;
  パック: string;
  コレクションナンバー: number;
  名前: string;
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
  トレーナーズ: TrainerCardCategories;
};
export type FossilCard = TrainerCard & {
  トレーナーズ: (typeof trainerCardCategories)[3];
  HP: number;
};
export type Card = BaseCard | PokemonCard | TrainerCard | FossilCard;
export const cards: Card[] = cardData;
export const dummyCard = cards[0];
export const getCardNameWithSuffix = (card: Card, reverse = false) =>
  "ex" in card !== reverse ? `${card.名前}ex` : card.名前;

/**
 * ワザ
 */
export type BaseCardTrait = {
  カードID: number;
  効果?: string;
};
export type PokemonCardTrait = BaseCardTrait & {
  名前: string;
  一致エネルギー数: number;
  無色エネルギー数: number;
  必要エネルギー上書き?: string;
  威力: number;
};
export type Trait = BaseCardTrait | PokemonCardTrait;
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
    jp: string;
  };
};
export const pokemonTypes: PokemonType[] = pokemonTypeData;
export const japaneseToTypes = DataIndex(
  pokemonTypes,
  (pokemonType: PokemonType) => pokemonType.translations.jp
);
export const colorLess = japaneseToTypes(COLOR_LESS_JP);
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
 * TSV変換
 */
export type TsvConverterHeaderOverwrite = {
  [key: string]: string;
};
export const tsvConverterHeaderOverwrites = tsvConverterHeaderOverwriteData;
