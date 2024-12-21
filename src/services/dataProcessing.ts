import fs from "fs";
import path from "path";
import {
  CardRelations,
  cards,
  getCardNameWithSuffix,
  evolutions,
  getPreEvolution,
  Targetables,
  traits,
  dummyCard,
  pokemonNameLanguages,
} from "../data/types";
import pokemon, { Language } from "pokemon";

const processRelatedCards = () => {
  /**
   * key: カード名（exは別項目）。
   * value: その関連カード。
   */
  const cardRelations: CardRelations = {};
  for (const card of cards) {
    const cardName = getCardNameWithSuffix(card);
    const alternateCardName = getCardNameWithSuffix(card, true);
    if (cardName in cardRelations) {
      cardRelations[cardName].cardIds.push(card.ID);
    } else if (alternateCardName in cardRelations) {
      // cardIds は ex版 or exじゃない版 を参照
      cardRelations[cardName] = {
        cardIds: cardRelations[alternateCardName].cardIds,
        evolutions: [],
        targetedBy: [],
      };
      cardRelations[cardName].cardIds.push(card.ID);
    } else {
      // 完全新規
      cardRelations[cardName] = {
        cardIds: [card.ID],
        evolutions: [],
        targetedBy: [],
      };
    }
  }
  const pushPostEvolution = (postEvolution: string, from: string) => {
    if (postEvolution in cardRelations) {
      cardRelations[postEvolution].evolutions!.push(from);
    }
    if (`${postEvolution}ex` in cardRelations) {
      cardRelations[`${postEvolution}ex`].evolutions!.push(from);
    }
  };
  for (const [to, from] of Object.entries(evolutions)) {
    if (!(to in cardRelations) || !(from in cardRelations)) continue;
    const basicEvolutionOfStage2 = getPreEvolution(from);
    if (basicEvolutionOfStage2 !== undefined) {
      cardRelations[basicEvolutionOfStage2].evolutions!.push(to);
      pushPostEvolution(to, basicEvolutionOfStage2);
    }
    cardRelations[from].evolutions!.push(to);
    pushPostEvolution(to, from);
  }
  /**
   * key: カードID。
   * value: そのカードで選べるカードの配列。
   */
  const targetables: Targetables = {};
  for (const trait of traits) {
    if (trait.効果 === undefined) continue;
    for (const card of cards) {
      const cardName = getCardNameWithSuffix(card);
      if (trait.効果.includes(`「${cardName}」`)) {
        if (trait.カードID in targetables) {
          targetables[trait.カードID].push(cardName);
        } else {
          targetables[trait.カードID] = [cardName];
        }
        cardRelations[cardName].targetedBy!.push(trait.カードID);
      }
    }
  }
  for (const cardRelation of Object.values(cardRelations)) {
    if (cardRelation.evolutions!.length === 0) {
      // JSON.stringifyで列挙されないようにする
      cardRelation.evolutions = undefined;
    }
    if (cardRelation.targetedBy!.length === 0) {
      // JSON.stringifyで列挙されないようにする
      cardRelation.targetedBy = undefined;
    } else {
      // 重複削除
      cardRelation.targetedBy = Array.from(new Set(cardRelation.targetedBy));
    }
  }
  for (const key of Object.keys(targetables)) {
    // 重複削除
    targetables[key] = Array.from(new Set(targetables[key]));
  }
  return {
    cardRelations,
    targetables,
  };
};

const processTranslatedCards = () => {
  /**
   * カード名とその関連カード。
   */
  const translationsByCardName: Record<
    string,
    Partial<Record<Language, string>>
  > = {};
  for (const card of cards) {
    if (card.名前 === dummyCard.名前 || card.名前 in translationsByCardName) {
      continue;
    }
    let id;
    try {
      id = pokemon.getId(card.名前, "ja");
    } catch {
      continue;
    }
    if (
      // Farfetch'd(en) と Farfetch’d(es) になっている
      // pokedex ブラジル語版では「Farfetch’d」だが、アポストロフィは'に寄せて良さそう
      card.名前 !== "カモネギ" &&
      // Flabébé(en) と Flabebe(es) になっている
      // pokedex ブラジル語版では「Flabébé」
      card.名前 !== "フラベベ" &&
      //
      pokemon.getName(id, "en") !== pokemon.getName(id, "es")
    ) {
      throw new Error(
        `${pokemon.getName(id, "ja")}の英語名(${pokemon.getName(id, "en")})がスペイン語名(${pokemon.getName(id, "es")})と異なります。`
      );
    }
    translationsByCardName[card.名前] = pokemonNameLanguages.reduce(
      (translations, language) => {
        translations[language] = pokemon.getName(id, language);
        return translations;
      },
      {} as Partial<Record<Language, string>>
    );
  }
  return translationsByCardName;
};

export function processJSON() {
  const { cardRelations, targetables } = processRelatedCards();
  fs.writeFileSync(
    path.resolve(__dirname, "../data/generated/card-relations.json"),
    JSON.stringify(cardRelations, null, 2)
  );
  fs.writeFileSync(
    path.resolve(__dirname, "../data/generated/targetables.json"),
    JSON.stringify(targetables, null, 2)
  );

  fs.writeFileSync(
    path.resolve(__dirname, "../data/generated/pokemon-translations.json"),
    JSON.stringify(processTranslatedCards(), null, 2)
  );

  console.log("Processed JSON has been written");
}
