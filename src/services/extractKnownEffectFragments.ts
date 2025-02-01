import {
  cards,
  getCardName,
  findTranslatedCardNameByName,
  japaneseToTypes,
  withSuffix,
} from "../data/types";

export type ExtractedResult = {
  leadingText: string;
  source: string;
  converted: string;
};

/**
 * カード名の連続を翻訳します。
 * 例) "「あ」「い」「う」" => "a, i, or u"
 */
export function getTranslatedCardNamesString(cardNamesString: string) {
  const translatedCardNames = cardNamesString
    .slice(1, -1)
    .split("」「")
    .map((cardName: string) => findTranslatedCardNameByName(cardName, "en"));
  if (translatedCardNames.length === 1) {
    return translatedCardNames[0];
  } else {
    const lastCardName = translatedCardNames.pop();
    return `${translatedCardNames.join(", ")}${translatedCardNames.length >= 2 ? "," : ""} or ${lastCardName}`;
  }
}

export function extractKnownEffectFragments(target: string) {
  const result: ExtractedResult[] = [];

  let lastIndex = 0;
  let found: RegExpExecArray | null = null;
  let detectedKnownWord: KnownEffectFragment | undefined = undefined;
  const knownWords = getKnownWordsAndConverters();
  while (true) {
    found = null;
    detectedKnownWord = undefined;
    // knownWords の中で最初にマッチするものを見つける
    for (const knownWord of knownWords) {
      knownWord[0].lastIndex = lastIndex;
      // TODO: 結果のキャッシュ
      const matchResult = knownWord[0].exec(target);
      if (
        matchResult !== null &&
        (found === null ||
          // 同じなら先に定義された方を優先
          found.index > matchResult.index)
      ) {
        found = matchResult;
        detectedKnownWord = knownWord;
      }
    }

    if (found === null || detectedKnownWord === undefined) {
      break;
    }
    const source = found[0];
    const [regExp, functionOrString] = detectedKnownWord;
    result.push({
      leadingText: found.index > 0 ? target.slice(lastIndex, found.index) : "",
      source,
      converted:
        // オーバーロード用
        typeof functionOrString === "string"
          ? source.replace(regExp, functionOrString)
          : source.replace(regExp, functionOrString),
    });
    lastIndex = found.index + source.length;
  }
  result.push({
    leadingText: target.slice(lastIndex),
    source: "",
    converted: "",
  });
  return result;
}

export const joinExtractedResults = (extractedResults: ExtractedResult[]) =>
  extractedResults
    .map((extractedWord) => extractedWord.leadingText + extractedWord.converted)
    .join("")
    .replace(/(?<=\.)(?=[a-zA-Z])/g, " ")
    .replace(/(?<=^|\. )[a-z]/g, (headLowerCase: string) =>
      headLowerCase.toUpperCase()
    );

export const isFullTranslated = (extractedResults: ExtractedResult[]) =>
  extractedResults.every(
    (extractedResult) => extractedResult.leadingText === ""
  );

type KnownEffectFragment = [
  RegExp,
  /** converter for String#replace */
  string | ((substring: string, ...args: any[]) => string),
];
const toHankakuDigit = (zenkakuDigit: string) =>
  String.fromCharCode(
    zenkakuDigit.charCodeAt(0) + "1".charCodeAt(0) - "１".charCodeAt(0)
  );
const toEnglishType = (pokemonType: string) =>
  japaneseToTypes(pokemonType)
    .translations.en.toLowerCase()
    .replace(/^([a-z])/, (_, headLowerCase: string) =>
      headLowerCase.toUpperCase()
    );
const getKnownWordsAndConverters = (): KnownEffectFragment[] =>
  // lastIndexを使用するため、gフラグを付与（つけ忘れると無限ループになるので注意）
  [
    // ダメージ
    [
      /相手のポケモン１匹に(\d+)ダメージ/g,
      (_, damage) =>
        `this attack does ${damage} damage to 1 of your opponent's Pokémon`,
    ],
    [
      /相手のベンチポケモン１匹に(\d+)ダメージ/g,
      (_, damage) =>
        `this attack does ${damage} damage to 1 of your opponent's Benched Pokémon`,
    ],
    [
      /相手のベンチポケモン１匹にも(\d+)ダメージ/g,
      (_, damage) =>
        `this attack also does ${damage} damage to 1 of your opponent's Benched Pokémon`,
    ],
    [
      /相手のベンチポケモン全員にも(\d+)ダメージ。/g,
      (_, damage) =>
        `this attack also does ${damage} damage to each of your opponent's Benched Pokémon.`,
    ],
    [
      /自分のベンチの(.)ポケモンの数×(\d+)ダメージ/g,
      (_, pokemonType, damage) =>
        `this attack does ${damage} damage for each of your Benched ${toEnglishType(pokemonType)} Pokémon`,
    ],
    [
      /このポケモンが、バトル場で相手のポケモンからワザのダメージを受けたとき、ワザを使ったポケモンに(\d+)ダメージ/g,
      (_, damage) =>
        `if this Pokémon is in the Active Spot and is damaged by an attack from your opponent's Pokémon, do ${damage} damage to the Attacking Pokémon`,
    ],
    // コイン
    [/コインを１回投げ、/g, "flip a coin. "],
    [/コインを１回投げ/g, "flip a coin. "],
    [/ウラが出るまでコインを投げ、/g, "flip a coin until you get tails. "],
    [
      /自分の場のポケモンの数ぶんコインを投げ、/g,
      "flip a coin for each Pokémon you have in play, ",
    ],
    [/コインを投げ/g, "flip a coin "],
    [/オモテなら、/g, "if heads, "],
    [/ウラなら、/g, "if tails, "],
    [/このワザは失敗/g, "this attack does nothing"],
    [
      /コインを([２-９])回投げ、/g,
      (_, coins) => `flip ${toHankakuDigit(coins)} coins. `,
    ],
    [
      /オモテの数×(\d+)ダメージ追加/g,
      (_, damage) => `this attack does ${damage} more damage for each heads`,
    ],
    [
      /オモテの数×(\d+)ダメージ/g,
      (_, damage) => `this attack does ${damage} damage for each heads`,
    ],
    // 追加
    [
      /追加で(.)エネルギーが([２-９])個ついているなら、/g,
      (_, energy, extraEnergyCount) =>
        `if this Pokémon has at least ${toHankakuDigit(extraEnergyCount)} extra ${toEnglishType(energy)} Energy attached, `,
    ],
    [
      /相手のバトルポケモンのエネルギーの数×(\d+)ダメージ追加/g,
      (_, damage) =>
        `this attack does ${damage} more damage for each Energy attached to your opponent's Active Pokémon`,
    ],
    [
      /(\d+)ダメージ追加/g,
      (_, additionalDamage) =>
        `this attack does ${additionalDamage} more damage`,
    ],
    [
      /が使うワザの、相手のバトルポケモンへのダメージを\+(\d+)する/g,
      (_, additionalDamage) =>
        `attacks used by do ＋${additionalDamage} damage to your opponent's Active Pokémon`,
    ],
    // 自傷
    [
      /このポケモンにも(\d+)ダメージ/g,
      (_, selfDamage) =>
        `this Pokémon also does ${selfDamage} damage to itself`,
    ],
    // 耐性
    [
      /このポケモンが、炎または水ポケモンから受けるワザのダメージを-(\d+)する。/g,
      (_, decreasedDamage) =>
        `This Pokémon takes －${decreasedDamage} damage from attacks from Fire or Water Pokémon.`,
    ],
    [
      /受けるワザのダメージを-(\d+)する/g,
      (_, decreasedDamage) => `takes －${decreasedDamage} damage from attacks`,
    ],
    [
      /このポケモンはワザのダメージや効果を受けない/g,
      (_) =>
        `prevent all damage from―and effects of―attacks done to this Pokémon`,
    ],
    // 回復
    [
      /このポケモンのHPを(\d+)回復/g,
      (_, heal) => `heal ${heal} damage from this Pokémon`,
    ],
    [
      /自分のポケモン全員のHPを(\d+)回復/g,
      (_, heal) => `heal ${heal} damage from each of your Pokémon`,
    ],
    [/HPを(\d+)回復/g, (_, heal) => `heal ${heal} damage from `],
    // エネルギートラッシュ
    [
      /このポケモンから(.)エネルギーを１個トラッシュ/g,
      (_, energy) =>
        `discard a ${toEnglishType(energy)} Energy from this Pokémon`,
    ],
    [
      /このポケモンから(.)エネルギーを([２-９])個トラッシュ/g,
      (_, energy, energyCount) =>
        `discard ${toHankakuDigit(energyCount)} ${toEnglishType(energy)} Energy from this Pokémon`,
    ],
    [
      /このポケモンから(.)エネルギーをすべてトラッシュ/g,
      (_, energy) =>
        `discard all ${toEnglishType(energy)} Energy from this Pokémon`,
    ],
    [
      /相手のバトルポケモンからエネルギーをランダムに１個トラッシュ/g,
      (_) => `discard a random Energy from your opponent's Active Pokémon`,
    ],
    // エネルギーつける
    [
      /自分のエネルギーゾーンからこのポケモンに(.)エネルギーをつけるたび、/g,
      (_, energy) =>
        `Whenever you attach a ${toEnglishType(energy)} Energy from your Energy Zone to this Pokémon, `,
    ],
    [
      /自分のエネルギーゾーンから(.)エネルギーを１個出し、/g,
      (_, energy) =>
        `take a ${toEnglishType(energy)} Energy from your Energy Zone `,
    ],
    [/自分のエネルギーゾーンから/g, "from your Energy Zone"],
    [/このポケモンにつける/g, "and attach it to this Pokémon"],
    [
      /(「.+?」)または(「.+?」)につける/g,
      (_, pokemonName1, pokemonName2) =>
        `and attach it to ${getTranslatedCardNamesString(pokemonName1)} or ${getTranslatedCardNamesString(pokemonName2)} `,
    ],
    [
      /ベンチの(.)ポケモンにつける/g,
      (_, pokemonType) =>
        `and attach it to 1 of your Benched ${toEnglishType(pokemonType)} Pokémon`,
    ],
    [/につける/g, "and attach it to "],
    [/つけ替える/g, "Move Energy from your Benched Pokémon to "],
    // 山札
    [/自分の山札を上から１枚見/g, "look at the top card of your deck"],
    [
      /て、もとにもどす/g,
      // 英語版には対応するテキストがない
      "",
    ],
    [/手札をすべて山札にもど/g, "shuffles the hand into the deck"],
    [/自分の山札を１枚引く/g, "draw a card"],
    [
      /山札を([２-９])枚引く/g,
      (_, cardCount) => `draw ${toHankakuDigit(cardCount)} cards`,
    ],
    [
      /自分の山札から(.)ポケモンをランダムに１枚、/g,
      (_, pokemonType) =>
        `put 1 random ${toEnglishType(pokemonType)} Pokémon from your deck `,
    ],
    [
      /自分の山札から「(.+?)」をランダムに１枚、/g,
      (_, pokemonName) =>
        pokemonName.includes("「")
          ? `put 1 random ${getTranslatedCardNamesString(`「${pokemonName}」`)} from your deck `
          : `put 1 random ${getCardName({
              card: cards.find(
                (card) => getCardName({ card, withSuffix }) === pokemonName
              )!,
              language: "en",
              withSuffix,
            })} from your deck `,
    ],
    [/手札に加える/g, (_) => `into your hand`],
    [/ベンチに出す/g, (_) => `onto your Bench`],
    // 特性
    [
      /このポケモンがいるかぎり、/g,
      // 英語版には対応するテキストがない
      "",
    ],
    // 妨害
    [
      /このワザを受けたポケモンが使うワザのダメージを-(\d+)する。/g,
      (_, damage) =>
        `attacks used by the Defending Pokémon do －${damage} damage.`,
    ],
    [/このワザを受けたポケモン(は|が)/g, "the Defending Pokémon"],
    // NOTE: オムスター[A1|082/226]はこの順だが、ロコン[A1|037/226]はコイントスとの組み合わせだからか
    //       during your opponent's next turn が後に来ている。
    [/ワザが使えない/g, "can't attack"],
    [/にげるができない/g, "can't retreat"],
    [
      /次の相手の番、相手は手札からサポートを出して使えない/g,
      "your opponent can't use any Supporter cards from their hand during their next turn",
    ],
    [/相手の手札のオモテをすべて見る/g, "your opponent reveals their hand"],
    [
      /相手の手札をすべて山札にもどす。/g,
      "Your opponent shuffles their hand into their deck. ",
    ],
    // 入れ替え・にげる
    [
      /このポケモンをベンチポケモンと入れ替える/g,
      "switch this Pokémon with 1 of your Benched Pokémon",
    ],
    [
      /相手のバトルポケモンをベンチポケモンと入れ替える。［バトル場に出すポケモンは相手が選ぶ。］/g,
      "switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)",
    ],
    [
      /自分のバトルポケモンのにげるためのエネルギーを、([１-９])個少なくする/g,
      (_, retreatCost) =>
        `the Retreat Cost of your Active Pokémon is ${toHankakuDigit(retreatCost)} less`,
    ],
    // バウンス
    [
      /自分のバトル場の((?:「.+?」)+)を手札にもどす/g,
      (_, cardNamesString: string) =>
        `Put your ${getTranslatedCardNamesString(cardNamesString)} in the Active Spot into your hand`,
    ],
    // 番
    [
      /このポケモンがバトル場にいるなら、自分の番に１回使える。/g,
      "once during your turn, if this Pokémon is in the Active Spot, you may ",
    ],
    [/自分の番に１回使える。/g, "once during your turn, you may "],
    [
      /自分の番に何回でも使える。/g,
      "As often as you like during your turn, you may ",
    ],
    [/この番、/g, "during this turn, "],
    [/次の相手の番、/g, "during your opponent's next turn, "],
    [/次の自分の番、/g, "during your next turn, "],
    // 特殊状態
    [/どくにする/g, "is now Poisoned"],
    [
      /相手のバトルポケモンがどくなら、/g,
      "if your opponent's Active Pokémon is Poisoned, ",
    ],
    [/ねむりにする/g, "is now Asleep"],
    [/マヒにする/g, "is now Paralyzed"],
    [/こんらんにする/g, "is now Confused"],
    [/やけどにする/g, "is now Burned"],
    // 化石
    [
      /このカードは、HP40の無色タイプのたねポケモンとして、場に出すことができる。\n自分の番の中でなら、場に出ているこのカードをトラッシュしてよい。\nこのカードはにげるができない。/g,
      "Play this card as if it were a 40-HP Basic Colorless Pokémon.\nAt any time during your turn, you may discard this card from play.\nThis card can't retreat.",
    ],
    // ポケモンのどうぐ
    [
      /このカードをつけているポケモン/g,
      "the Pokémon this card is attached to ",
    ],
    // 色々: 自動翻訳では文頭に来ないが手動で移動させるのが確定なので大文字ではじめるもの
    [/がダメージを受けているなら、/g, "If has damage on it, "],
    [
      /が持っているワザを１つ選び、このワザとして使う/g,
      "Choose 1 of attacks and use it as this attack",
    ],
    // 色々
    [
      /このポケモンに「ポケモンのどうぐ」がついているなら、/g,
      "if this Pokémon has a Pokémon Tool attacked, ",
    ],
    [/自分の/g, "your "],
    [/相手の/g, "your opponent's "],
    [/山札/g, "deck"],
    [/バトルポケモンを?/g, "Active Pokémon "],
    [/ベンチポケモン/g, "Benched Pokémon "],
    [/バトル場の/g, "in the Active Spot "],
    [/ベンチの/g, "Benched "],
    [/たね/g, "Basic "],
    [/このポケモンが?/g, "this Pokémon "],
    [/ポケモン/g, "Pokémon "],
    [/の数×/g, "for each of "],
    [/ランダムに１./g, "a random "],
    [/(?:「.+?」)+/g, (string) => `${getTranslatedCardNamesString(string)} `],
    [/。/g, "."],
  ];
