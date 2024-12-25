import {
  Card,
  getEvolutionStage,
  pokemonTypes,
  trainerCardCategories,
} from "../data/types";

// メモ 昇順ソート a < b ? -1 : a > b ? 1 : 0
const getSortFunction =
  (propertyName: string, isDescend: boolean) =>
  (
    a: { ID: number; [key: string]: any },
    b: { ID: number; [key: string]: any }
  ) =>
    !(propertyName in a)
      ? propertyName in b
        ? // b にのみ propertyName がある
          1
        : // 両方 propertyName がないならID昇順
          a.ID < b.ID
          ? -1
          : 1
      : !(propertyName in b)
        ? // a にのみ propertyName がある
          -1
        : // ソート
          a[propertyName] < b[propertyName]
          ? isDescend
            ? 1
            : -1
          : a[propertyName] > b[propertyName]
            ? isDescend
              ? -1
              : 1
            : // 同じならID昇順
              a.ID < b.ID
              ? -1
              : 1;

const typeOrderByName = new Map(
  pokemonTypes.map((pokemonType, i) => [pokemonType.translations.ja, i])
);

const getTypeSortFunction =
  (propertyName: string, isDescend: boolean) =>
  (
    a: { ID: number; [key: string]: any },
    b: { ID: number; [key: string]: any }
  ) => {
    if (!(propertyName in a) && !(propertyName in b)) {
      // ID昇順
      return a.ID < b.ID ? -1 : 1;
    } else if (!(propertyName in a)) {
      return 1;
    } else if (!(propertyName in b)) {
      return -1;
    } else {
      // undefined ならタイプ「なし」なので草より小さい
      const typeOrderA = typeOrderByName.get(a[propertyName]) ?? -1;
      const typeOrderB = typeOrderByName.get(b[propertyName]) ?? -1;
      return typeOrderA === typeOrderB
        ? a.ID < b.ID
          ? -1
          : 1
        : typeOrderA < typeOrderB === isDescend
          ? 1
          : -1;
    }
  };

const trainerSubcategoryOrderByName = new Map(
  trainerCardCategories.map((trainerCardCategory, i) => [
    trainerCardCategory,
    i,
  ])
);
// たね＜たねex＜1進化＜1進化ex＜2進化＜2進化ex
// ＜グッズ＜ポケモンのどうぐ＜サポート＜化石
const getSubcategorySortFunction =
  (isDescend: boolean) => (a: Card, b: Card) => {
    const isTrainerCardA = "トレーナーズ" in a;
    const isTrainerCardB = "トレーナーズ" in b;
    if (isTrainerCardA !== isTrainerCardB) {
      return isTrainerCardA === isDescend ? -1 : 1;
    } else if (isTrainerCardA && isTrainerCardB) {
      const trainerOrderA = trainerSubcategoryOrderByName.get(a.トレーナーズ);
      const trainerOrderB = trainerSubcategoryOrderByName.get(b.トレーナーズ);
      if (trainerOrderA === undefined || trainerOrderB === undefined) {
        throw new Error(
          `${a.名前}(ID:${a.ID})の「${a.トレーナーズ}」 または ${b.名前}(ID:${b.ID})の「${b.トレーナーズ}」は有効なトレーナーズサブカテゴリ名ではありません`
        );
      }
      return trainerOrderA !== trainerOrderB
        ? trainerOrderA < trainerOrderB === isDescend
          ? 1
          : -1
        : a.ID < b.ID
          ? -1
          : 1;
    } else {
      // a も b もポケモンのカード
      const evolutionStageA = getEvolutionStage(a.名前);
      const evolutionStageB = getEvolutionStage(b.名前);
      if (evolutionStageA !== evolutionStageB) {
        return evolutionStageA < evolutionStageB === isDescend ? 1 : -1;
      } else {
        const isExA = "ex" in a;
        const isExB = "ex" in b;
        return isExA !== isExB
          ? isExA === isDescend
            ? -1
            : 1
          : a.ID < b.ID
            ? -1
            : 1;
      }
    }
  };
export const sortFunction = {
  // key は数字ではないので宣言順に列挙される
  "ui.sort.type-ascend": getTypeSortFunction("タイプ", false),
  "ui.sort.type-descend": getTypeSortFunction("タイプ", true),
  "ui.sort.sub-category-ascend": getSubcategorySortFunction(false),
  "ui.sort.sub-category-descend": getSubcategorySortFunction(true),
  "ui.sort.hp-descend": getSortFunction("HP", true),
  "ui.sort.hp-ascend": getSortFunction("HP", false),
  "ui.sort.expansion-ascend": getSortFunction("ID", false),
  "ui.sort.expansion-descend": getSortFunction("ID", true),
  "ui.sort.rarity-descend": getSortFunction("レアリティ", true),
  "ui.sort.rarity-ascend": getSortFunction("レアリティ", false),
  "ui.sort.weakness-ascend": getTypeSortFunction("弱点", false),
  "ui.sort.weakness-descend": getTypeSortFunction("弱点", true),
  "ui.sort.retreat-ascend": getSortFunction("にげる", false),
  "ui.sort.retreat-descend": getSortFunction("にげる", true),
} as const;
