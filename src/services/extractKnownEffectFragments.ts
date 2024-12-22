import { japaneseToTypes } from "../data/types";

export type ExtractedResult = {
  leadingText: string;
  source: string;
  converted: string;
};

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
    .replace(/(?<=^|\. )([a-z])/g, (_, headLowerCase: string) =>
      headLowerCase.toUpperCase()
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
  // TODO: カード名指定のカード名を翻訳
  // lastIndexを使用するため、gフラグを付与（つけ忘れると無限ループになるので注意）
  [
    // ダメージ
    [
      /相手のポケモン１匹に(\d+)ダメージ/g,
      (_, damage) =>
        `this attack does ${damage} to 1 of your opponent's Pokémon`,
    ],
    [
      /相手のベンチポケモン１匹に(\d+)ダメージ/g,
      (_, damage) =>
        `this attack does ${damage} to 1 of your opponent's Benched Pokémon`,
    ],
    [
      /自分のベンチの(.)ポケモンの数×(\d+)ダメージ/g,
      (_, pokemonType, damage) =>
        `This attack does ${damage} damage for each of your Benched ${toEnglishType(pokemonType)} Pokémon`,
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
    [/コインを投げ/g, "flip a coin "],
    [/オモテなら、/g, "if heads, "],
    [/ウラなら、/g, "if tails, "],
    [/このワザは失敗/g, "this attack does nothing"],
    [
      /コインを([２-９])回投げ、/g,
      (_, coins) => `Flip ${toHankakuDigit(coins)} coins. `,
    ],
    [
      /オモテの数×(\d+)ダメージ/g,
      (_, damage) => `This attack does ${damage} damage for each heads`,
    ],
    // 追加
    [
      /追加で(.)エネルギーが([２-９])個ついているなら、/g,
      (_, energy, extraEnergyCount) =>
        `If this Pokémon has at least ${toHankakuDigit(extraEnergyCount)} ${toEnglishType(energy)} Energy attached, `,
    ],
    [
      /相手のバトルポケモンのエネルギーの数×(\d+)ダメージ追加/g,
      (_, damage) =>
        `This attack does ${damage} more damage for each Energy attached to your opponent's Active Pokémon`,
    ],
    [
      /(\d+)ダメージ追加/g,
      (_, additionalDamage) =>
        `this attack does ${additionalDamage} more damage`,
    ],
    [
      /が使うワザの、相手のバトルポケモンへのダメージを+(\d+)する/g,
      (additionalDamage) =>
        `do ＋${additionalDamage} damage to your opponent's Active Pokémon`,
    ],
    // 自傷
    [
      /このポケモンにも(\d+)ダメージ/g,
      (_, selfDamage) =>
        `this Pokémon also does ${selfDamage} damage to itself`,
    ],
    // 耐性
    [
      /このポケモンが受けるワザのダメージを-(\d+)する/g,
      (_, decreasedDamage) =>
        `this Pokémon takes －${decreasedDamage} damage from attacks`,
    ],
    [
      /このポケモンはワザのダメージや効果を受けない/g,
      (_) =>
        `prevent all damage from―and effect of―attacks done to this Pokémon`,
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
        `Discard a ${toEnglishType(energy)} Energy from this Pokémon`,
    ],
    [
      /このポケモンから(.)エネルギーを([２-９])個トラッシュ/g,
      (_, energy, energyCount) =>
        `Discard ${toHankakuDigit(energyCount)} ${toEnglishType(energy)} Energy from this Pokémon`,
    ],
    [
      /相手のバトルポケモンからエネルギーをランダムに１個トラッシュ/g,
      (_) => `Discard a random Energy from your opponent's Active Pokémon`,
    ],
    // エネルギーつける
    [
      /自分のエネルギーゾーンから(.)エネルギーを１個出し、/g,
      (_, energy) =>
        `Take a ${toEnglishType(energy)} Energy from your Energy Zone `,
    ],
    [/自分のエネルギーゾーンから/g, "from your Energy Zone"],
    [/このポケモンにつける/g, "and attach it to this pokemon"],
    [
      /ベンチの(.)ポケモンにつける/g,
      (_, pokemonType) =>
        `and attach it to 1 of your Benched ${toEnglishType(pokemonType)} pokemon`,
    ],
    [/につける/g, "and attach it to "],
    // 山札
    [/自分の山札を１枚引く/g, "draw a card"],
    [
      /自分の山札から(.)ポケモンをランダムに１枚、/g,
      (_, pokemonType) =>
        `Put 1 random ${toEnglishType(pokemonType)} Pokémon from your deck `,
    ],
    [
      /自分の山札から「(.+?)」をランダムに１枚、/g,
      (_, pokemonName) => `Put 1 random ${pokemonName} from your deck `,
    ],
    [/手札に加える/g, (_) => `into your hand`],
    [/ベンチに出す/g, (_) => `onto your Bench`],
    // 特性
    [
      /このポケモンがバトル場にいるなら、/g,
      "If this Pokémon is in the Active Spot, ",
    ],
    [
      /このポケモンがいるかぎり、/g,
      // 英語版には対応するテキストがない
      "",
    ],
    // 妨害
    [
      /次の相手の番、このワザを受けたポケモンはワザが使えない/g,
      "the Defending Pokémon can't attack during your opponent's next turn",
    ],
    [
      /このワザを受けたポケモンはにげるができない/g,
      "the Defending Pokémon can't retreat",
    ],
    [
      /このワザを受けたポケモンが使うワザのダメージを-(\d+)する。/g,
      (_, damage) =>
        `attacks used by the Defending Pokémon do －${damage} damage.`,
    ],
    [
      /次の相手の番、相手は手札からサポートを出して使えない/g,
      "your opponent can't use any Supporter cards from their hand during their next turn",
    ],
    [/相手の手札のオモテをすべて見る/g, "your opponent reveals their hand"],
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
    // 番
    [/自分の番に１回使える。/g, "once during your turn, "],
    [/この番、/g, "during this turn, "],
    [/次の相手の番、/g, "during your opponent's next turn, "],
    // 特殊状態
    [/どくにする/g, "is now Poisoned"],
    [
      /相手のバトルポケモンがどくなら、/g,
      "if your opponent's Active Pokémon is Poisoned, ",
    ],
    [/ねむりにする/g, "is now Asleep"],
    [/マヒにする/g, "is now Paralyzed"],
    // 化石
    [
      /このカードは、HP40の無色タイプのたねポケモンとして、場に出すことができる。\n自分の番の中でなら、場に出ているこのカードをトラッシュしてよい。\nこのカードはにげるができない。/g,
      "Play this card as if it were a 40-HP Basic Colorless Pokémon.\nAt any time during your turn, you may discard this card from play.\nThis card can't retreat.'",
    ],
    // 色々
    [/がダメージを受けているなら、/g, "If has damage on it, "],
    [/自分の/g, "your "],
    [/相手の/g, "your opponent's "],
    [/バトルポケモンを?/g, "Active Pokémon "],
    [/ベンチポケモン/g, "Benched Pokémon "],
    [/バトル場の/g, "in the Active Spot "],
    [/ベンチの/g, "Benched "],
    [/たね/g, "Basic "],
    [/このポケモン/g, "this Pokémon "],
    [/ポケモン/g, "Pokémon "],
    [/の数×/g, "for each of "],
    [/。/g, "."],
  ];
