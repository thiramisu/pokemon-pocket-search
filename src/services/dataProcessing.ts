import fs from "fs";
import path from "path";
import {
  CardRelations,
  cards,
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
    if (card.名前 in cardRelations) {
      cardRelations[card.名前].cardIds.push(card.ID);
    } else {
      cardRelations[card.名前] = {
        cardIds: [card.ID],
        evolutions: [],
        targetedBy: [],
      };
    }
  }
  for (const [to, from] of Object.entries(evolutions)) {
    if (!(to in cardRelations) || !(from in cardRelations)) continue;
    const preEvolution = getPreEvolution(from);
    if (preEvolution !== undefined) {
      cardRelations[preEvolution].evolutions!.push(to);
      cardRelations[to].evolutions!.push(preEvolution);
    }
    cardRelations[to].evolutions!.push(from);
    cardRelations[from].evolutions!.push(to);
  }
  const targetables: Targetables = {};
  for (const trait of traits) {
    if (trait.効果 === undefined) continue;
    for (const card of cards) {
      if (!trait.効果.includes(`「${card.名前}」`)) continue;
      if (trait.カードID in targetables) {
        targetables[trait.カードID].push(card.名前);
      } else {
        targetables[trait.カードID] = [card.名前];
      }
      cardRelations[card.名前].targetedBy!.push(trait.カードID);
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
