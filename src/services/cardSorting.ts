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
  タイプ順: getTypeSortFunction("タイプ", false),
  タイプ逆順: getTypeSortFunction("タイプ", true),
  サブカテゴリ順: getSubcategorySortFunction(false),
  サブカテゴリ逆順: getSubcategorySortFunction(true),
  HP高い順: getSortFunction("HP", true),
  HP低い順: getSortFunction("HP", false),
  エキスパンション順: getSortFunction("ID", false),
  エキスパンション逆順: getSortFunction("ID", true),
  レアリティ高い順: getSortFunction("レアリティ", true),
  レアリティ低い順: getSortFunction("レアリティ", false),
  弱点順: getTypeSortFunction("弱点", false),
  弱点逆順: getTypeSortFunction("弱点", true),
  にげるコスト少ない順: getSortFunction("にげる", false),
  にげるコスト多い順: getSortFunction("にげる", true),
} as const;
