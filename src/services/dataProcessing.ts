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
} from "../data/types";

const processRelatedCards = () => {
  /**
   * カード名とその関連カード。
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

  console.log("Processed JSON has been written");
}
