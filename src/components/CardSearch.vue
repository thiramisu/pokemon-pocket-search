<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  cards,
  dummyCard,
  getTraits,
  Trait,
  evolutionStageNames,
  getEvolutionStage,
  trainerCardCategories,
  TrainerCardCategory,
  getTranslationKeyOfTrainerCardCategory,
  expansions,
  dummyExpansion,
  getExpansionByName,
  getPacksByExpansionName,
  getExpansionByPackName,
  hasPostEvolution,
} from "../data/types";
import { POKEMON_NAME_DATALIST_ID } from "../const";
import { toggleSetItem } from "../utils";
import { sortFunction } from "../services/cardSorting";
import { useTranslation } from "../composables/translation";
import CardSearchPokemonTypeTr from "./CardSearchPokemonTypeTr.vue";
import CardSearchRangeSliderTr from "./CardSearchRangeSliderTr.vue";
import SearchButton from "./SearchButton.vue";
import CardSearchResult from "./CardSearchResult.vue";
import { useI18n } from "vue-i18n";

const { getTranslatedCardName, getTranslatedEffect, getTranslatedName } =
  useTranslation();

const { t } = useI18n();

/** width <= 1440px では true なら open, 1440px < width では true なら close */
const filterPanelToggle = defineModel({ default: false });

const evolutionStage = ref(new Set<number>());
const evolutionProgresses = [
  "card-status.evolution.final",
  "card-status.evolution.intermidate",
] as const;
const evolutionProgress = ref<(typeof evolutionProgresses)[number] | undefined>(
  undefined
);
const selectedTrainerCategory = ref(new Set<TrainerCardCategory>());

const cardName = ref("");
const isEx = ref<true | undefined>(undefined);

const hpMin = ref(-Infinity);
const hpMax = ref(Infinity);

const selectedPokemonTypes = ref(new Set<string>());

const hasAbility = ref<boolean | undefined>(undefined);
const attackCount = ref<number | undefined>(undefined);

const cardText = ref("");
const cardTextLowerCase = computed(() => cardText.value.toLowerCase());
const includesText = (trait: Trait, text: string) =>
  ("効果" in trait &&
    getTranslatedEffect.value(trait).toLowerCase().includes(text)) ||
  ("名前" in trait &&
    getTranslatedName.value(trait).toLowerCase().includes(text));
const includesSearchText = (trait: Trait) =>
  includesText(trait, cardTextLowerCase.value);

const suggestionGroups = [
  [
    "ui.suggestion.your-opponents-active-pokemon",
    "ui.suggestion.your-opponents-benched-pokemon",
  ],
  ["ui.suggestion.your-active-pokemon", "ui.suggestion.your-benched-pokemon"],
  [
    "ui.suggestion.during-your-opponents-next-turn",
    "ui.suggestion.energy",
    "ui.suggestion.coin",
  ],
  ["ui.suggestion.poisoned", "ui.suggestion.burned"],
  ["ui.suggestion.paralyzed", "ui.suggestion.asleep", "ui.suggestion.confused"],
  ["ui.suggestion.more-damage", "ui.suggestion.heal"],
] as const;
type Suggestion = (typeof suggestionGroups)[number][number];
const selectedSuggestions = ref(new Set<Suggestion>());

const selectedWeakness = ref(new Set<string>());

const totalAttackCostMin = ref(-Infinity);
const totalAttackCostMax = ref(Infinity);

const attackCostEnergyColor = ref<
  "colorlessOnly" | "coloredOnly" | "mixed" | undefined
>(undefined);

const damageMin = ref(-Infinity);
const damageMax = ref(Infinity);

const expansionName = ref<string | undefined>(undefined);
const packName = ref<string | undefined | null>(undefined);
const cardNumber = ref<number | undefined>(undefined);
const cardNumberMax = computed(() =>
  expansionName.value === undefined
    ? 0
    : getExpansionByName(expansionName.value).カード種類数
);
const sharedExpansionNameInJapanese = computed(
  () => (name: string) =>
    t("pack.formatted-shared-pack-name", { name }, { locale: "ja" })
);

const rarityMin = ref(-Infinity);
const rarityMax = ref(Infinity);

const retreatCostMin = ref(-Infinity);
const retreatCostMax = ref(Infinity);

// set.size には computed が効かない点に注意
const isPokemonCardOptionActivated = () =>
  selectedPokemonTypes.value.size !== 0 ||
  evolutionStage.value.size !== 0 ||
  evolutionProgress.value !== undefined ||
  isEx.value !== undefined ||
  hasAbility.value !== undefined ||
  attackCostEnergyColor.value !== undefined ||
  selectedWeakness.value.size !== 0;
const isTrainerCardOptionActivated = () =>
  selectedTrainerCategory.value.size !== 0;
const isOnlyShowingPokemonCard = () =>
  isPokemonCardOptionActivated() && !isTrainerCardOptionActivated();
const isOnlyShowingTrainerCard = () =>
  !isPokemonCardOptionActivated() && isTrainerCardOptionActivated();

const sortFunctionName = ref<keyof typeof sortFunction>(
  "ui.sort.expansion-descend"
);
const sortedCards = computed(() =>
  cards.toSorted(sortFunction[sortFunctionName.value])
);
const filteredCards = computed(() =>
  sortedCards.value.filter((card) => {
    if (card.名前 === dummyCard.名前) return false;
    const traits = getTraits(card.ID);
    return (
      // カード名
      getTranslatedCardName.value({ card }).includes(cardName.value) &&
      // HP
      (!("HP" in card) || (hpMin.value <= card.HP && card.HP <= hpMax.value)) &&
      // カードテキスト
      traits.some(includesSearchText) &&
      (!("タイプ" in card)
        ? // トレーナーズカード
          !isOnlyShowingPokemonCard()
        : // ポケモンのカード絞り込み
          // ex
          (isEx.value === undefined || isEx.value === card.ex) &&
          // 進化
          (evolutionStage.value.size === 0 ||
            evolutionStage.value.has(getEvolutionStage(card.名前))) &&
          (evolutionProgress.value === undefined ||
            (evolutionProgress.value === "card-status.evolution.final") ===
              ("ex" in card || !hasPostEvolution(card.名前))) &&
          // ポケモンタイプ
          (selectedPokemonTypes.value.size === 0 ||
            selectedPokemonTypes.value.has(card.タイプ)) &&
          // 攻撃の数
          (attackCount.value === undefined ||
            attackCount.value === traits.length) &&
          // 特性持ち
          (hasAbility.value === undefined ||
            hasAbility.value ===
              traits.some((trait) => !("一致エネルギー数" in trait))) &&
          // 必要エネルギー と ダメージ
          traits.some((trait) => {
            if (!("一致エネルギー数" in trait)) {
              // 特性
              return false;
            }
            const totalAttackCost =
              trait.必要エネルギー上書き !== undefined
                ? trait.必要エネルギー上書き.length
                : trait.一致エネルギー数 + trait.無色エネルギー数;
            // 必要エネルギー
            return (
              totalAttackCostMin.value <= totalAttackCost &&
              totalAttackCost <= totalAttackCostMax.value &&
              // エネルギーの色
              (attackCostEnergyColor.value === "coloredOnly"
                ? trait.無色エネルギー数 === 0
                : attackCostEnergyColor.value === "colorlessOnly"
                  ? trait.無色エネルギー数 === totalAttackCost
                  : attackCostEnergyColor.value === "mixed"
                    ? // FIXME: 条件が不正確（必要有色エネルギーがタイプ違いの1つなどでもtrueになる）
                      "必要エネルギー上書き" in trait
                    : true) &&
              // ダメージ
              damageMin.value <= trait.威力 &&
              trait.威力 <= damageMax.value
            );
          }) &&
          // 弱点
          (selectedWeakness.value.size === 0 ||
            selectedWeakness.value.has(card.弱点)) &&
          // にげる
          retreatCostMin.value <= card.にげる &&
          card.にげる <= retreatCostMax.value &&
          true) &&
      (!("トレーナーズ" in card)
        ? // ポケモンのカード
          !isOnlyShowingTrainerCard()
        : // トレーナーズカード絞り込み
          selectedTrainerCategory.value.size === 0 ||
          selectedTrainerCategory.value.has(card.トレーナーズ)) &&
      // エキスパンション
      (expansionName.value === undefined ||
        (expansionName.value === getExpansionByPackName(card.パック).名前 &&
          // パック
          (packName.value === undefined ||
            card.パック === packName.value ||
            // エキスパンション内共通カード
            (card.パック ===
              sharedExpansionNameInJapanese.value(expansionName.value) &&
              // 検索パック名に部分的にエキスパンション名が含まれる場合は完全一致以外除外する
              !packName.value?.includes(expansionName.value))) &&
          // コレクションナンバー
          (cardNumber.value === undefined ||
            cardNumber.value === card.コレクションナンバー))) &&
      // レアリティ範囲
      rarityMin.value <= card.レアリティ &&
      card.レアリティ <= rarityMax.value &&
      // キーワード
      // 多重ループで重そうなのでなるべく最後に判定する
      Array.from(selectedSuggestions.value).every((suggestion) =>
        traits.some((trait) => includesText(trait, t(suggestion).toLowerCase()))
      )
    );
  })
);
const emits = defineEmits<{
  change: [resultCount: number];
}>();
watch(filteredCards, () => {
  emits("change", filteredCards.value.length);
});
</script>

<template>
  <div
    :class="[
      'card-search',
      filterPanelToggle ? 'filter-panel-changed' : undefined,
    ]"
  >
    <div class="card-search-filter-container">
      <table class="card-search-filter">
        <tbody>
          <tr
            :class="{
              changed: cardName !== '',
            }"
          >
            <th>
              Card Name<br />
              <SearchButton
                text="clear"
                :disabled="cardName === ''"
                class="action-button"
                @button-click="cardName = ''"
              />
            </th>
            <td>
              <div class="flex">
                <input
                  type="text"
                  v-model="cardName"
                  :list="POKEMON_NAME_DATALIST_ID"
                />
              </div>
            </td>
          </tr>
          <CardSearchPokemonTypeTr name="Type" v-model="selectedPokemonTypes" />
          <tr
            :class="{
              changed: cardText !== '',
            }"
          >
            <th>
              Card Text<br />
              <SearchButton
                text="clear"
                :disabled="cardText === ''"
                class="action-button"
                @button-click="cardText = ''"
              />
            </th>
            <td>
              <div class="flex column">
                <input type="text" v-model="cardText" />
              </div>
            </td>
          </tr>
          <tr
            :class="{
              changed: selectedSuggestions.size !== 0,
            }"
          >
            <th>
              Keywords<br />
              <SearchButton
                text="clear"
                :disabled="selectedSuggestions.size === 0"
                class="action-button"
                @button-click="selectedSuggestions.clear()"
              />
            </th>
            <td>
              <div v-for="suggestionGroup in suggestionGroups" class="flex">
                <SearchButton
                  v-for="suggestion in suggestionGroup"
                  :key="suggestion"
                  :text="t(suggestion)"
                  :filled="selectedSuggestions.has(suggestion)"
                  @button-click="toggleSetItem(selectedSuggestions, suggestion)"
                />
              </div>
            </td>
          </tr>
          <tr
            :class="{
              changed:
                evolutionStage.size !== 0 ||
                isEx !== undefined ||
                selectedTrainerCategory.size !== 0,
            }"
          >
            <th>
              Subcategory<br />
              <SearchButton
                text="clear"
                :disabled="
                  evolutionStage.size === 0 &&
                  evolutionProgress === undefined &&
                  isEx === undefined &&
                  selectedTrainerCategory.size === 0
                "
                class="action-button"
                @button-click="
                  evolutionStage.clear();
                  evolutionProgress = undefined;
                  isEx = undefined;
                  selectedTrainerCategory.clear();
                "
              />
            </th>
            <td class="column items-start">
              <div class="flex flex-wrap">
                <SearchButton
                  v-for="(text, i) of evolutionStageNames"
                  :key="i"
                  :text="t(text)"
                  :filled="evolutionStage.has(i)"
                  @button-click="toggleSetItem(evolutionStage, i)"
                />
                <SearchButton
                  text="ex"
                  :filled="isEx"
                  @button-click="isEx = isEx ? undefined : true"
                />
              </div>
              <div class="flex flex-wrap">
                <SearchButton
                  v-for="text of evolutionProgresses"
                  :key="text"
                  :text="t(text)"
                  :filled="evolutionProgress === text"
                  @button-click="
                    evolutionProgress =
                      evolutionProgress === text ? undefined : text
                  "
                />
              </div>
              <div class="flex flex-wrap">
                <SearchButton
                  v-for="category of trainerCardCategories"
                  :key="category"
                  :text="t(getTranslationKeyOfTrainerCardCategory(category))"
                  :filled="selectedTrainerCategory.has(category)"
                  @button-click="
                    toggleSetItem(selectedTrainerCategory, category)
                  "
                />
              </div>
            </td>
          </tr>
          <CardSearchRangeSliderTr
            name="HP"
            :min="30"
            :max="190"
            v-model:min-value="hpMin"
            v-model:max-value="hpMax"
            :step="10"
            :sub-tick-interval="5"
            :main-tick-offset="2"
          />
          <tr
            :class="{
              changed: hasAbility !== undefined,
            }"
          >
            <th>
              Number of Attacks<br />
              <SearchButton
                text="clear"
                :disabled="
                  hasAbility === undefined && attackCount === undefined
                "
                class="action-button"
                @button-click="
                  hasAbility = undefined;
                  attackCount = undefined;
                "
              />
            </th>
            <td>
              <div class="flex">
                <SearchButton
                  text="1"
                  :filled="hasAbility === false && attackCount === 1"
                  @button-click="
                    if (hasAbility === false && attackCount === 1) {
                      hasAbility = undefined;
                      attackCount = undefined;
                    } else {
                      hasAbility = false;
                      attackCount = 1;
                    }
                  "
                />
                <SearchButton
                  text="Ability + 1"
                  :filled="hasAbility === true && attackCount === 2"
                  @button-click="
                    if (hasAbility === true && attackCount === 2) {
                      hasAbility = undefined;
                      attackCount = undefined;
                    } else {
                      hasAbility = true;
                      attackCount = 2;
                    }
                  "
                />
                <SearchButton
                  text="2"
                  :filled="hasAbility === false && attackCount === 2"
                  @button-click="
                    if (hasAbility === false && attackCount === 2) {
                      hasAbility = undefined;
                      attackCount = undefined;
                    } else {
                      hasAbility = false;
                      attackCount = 2;
                    }
                  "
                />
              </div>
            </td>
          </tr>
          <CardSearchRangeSliderTr
            name="Total Attack Cost"
            :min="1"
            :max="4"
            v-model:min-value="totalAttackCostMin"
            v-model:max-value="totalAttackCostMax"
          />
          <tr
            :class="{
              changed: attackCostEnergyColor !== undefined,
            }"
          >
            <th>
              Attack Cost Color<br />
              <SearchButton
                text="clear"
                :disabled="attackCostEnergyColor === undefined"
                class="action-button"
                @button-click="attackCostEnergyColor = undefined"
              />
            </th>
            <td class="flex">
              <SearchButton
                text="Colorless Only"
                :filled="attackCostEnergyColor === 'colorlessOnly'"
                @button-click="
                  attackCostEnergyColor =
                    attackCostEnergyColor === 'colorlessOnly'
                      ? undefined
                      : 'colorlessOnly'
                "
              />
              <SearchButton
                text="Colored Only"
                :filled="attackCostEnergyColor === 'coloredOnly'"
                @button-click="
                  attackCostEnergyColor =
                    attackCostEnergyColor === 'coloredOnly'
                      ? undefined
                      : 'coloredOnly'
                "
              />
              <SearchButton
                text="Mixed"
                :filled="attackCostEnergyColor === 'mixed'"
                @button-click="
                  attackCostEnergyColor =
                    attackCostEnergyColor === 'mixed' ? undefined : 'mixed'
                "
              />
            </td>
          </tr>
          <CardSearchRangeSliderTr
            name="damage"
            :min="0"
            :max="200"
            v-model:min-value="damageMin"
            v-model:max-value="damageMax"
            :step="10"
            :sub-tick-interval="5"
          />
          <tr
            :class="{
              changed: expansionName !== undefined,
            }"
          >
            <th>
              Expansion<br />
              <SearchButton
                text="clear"
                :disabled="expansionName === undefined"
                class="action-button"
                @button-click="expansionName = undefined"
              />
            </th>
            <td>
              <div class="flex items-center flex-wrap">
                <div class="select-container">
                  <select
                    v-model="expansionName"
                    class="expansion-name"
                    @change="
                      packName = undefined;
                      cardNumber = undefined;
                    "
                  >
                    <option :value="undefined" selected>
                      {{ t("pack.no-filtered") }}
                    </option>

                    <template
                      v-for="expansion of expansions"
                      :key="expansion.略号"
                    >
                      <option
                        v-if="expansion !== dummyExpansion"
                        :value="expansion.名前"
                      >
                        {{ expansion.略号 }}：{{ getTranslatedName(expansion) }}
                      </option>
                    </template>
                  </select>
                </div>
                <template v-if="expansionName !== undefined">
                  <div class="select-container">
                    <select v-model="packName">
                      <option :value="undefined" selected>
                        {{ t("pack.no-filtered") }}
                      </option>
                      <template
                        v-for="pack of getPacksByExpansionName(expansionName)"
                        :key="pack.名前"
                      >
                        <option
                          v-if="
                            pack.名前 !==
                            sharedExpansionNameInJapanese(expansionName)
                          "
                          :value="pack.名前"
                        >
                          {{
                            getTranslatedName(pack).replace(
                              t("pack.formatted-shared-pack-name", {
                                name: getTranslatedName(
                                  getExpansionByName(expansionName)
                                ),
                              }),
                              ""
                            )
                          }}
                        </option>
                      </template>
                      <option :value="null" selected>
                        {{ t("pack.shared-only") }}
                      </option>
                    </select>
                  </div>
                  <div class="flex items-center">
                    <!-- ミュウ[A1|283/226] が番号内に存在しないカードなのでmaxは指定しないことにする -->
                    <input type="number" v-model="cardNumber" min="1" /><span
                      class="card-number-max"
                      >/{{ cardNumberMax }}</span
                    >
                  </div>
                </template>
              </div>
            </td>
          </tr>
          <CardSearchRangeSliderTr
            name="Rarity"
            :min="0"
            :max="4"
            v-model:min-value="rarityMin"
            v-model:max-value="rarityMax"
          />
          <CardSearchPokemonTypeTr name="Weakness" v-model="selectedWeakness" />
          <CardSearchRangeSliderTr
            name="Retreat Cost"
            :min="0"
            :max="4"
            v-model:min-value="retreatCostMin"
            v-model:max-value="retreatCostMax"
          />
        </tbody>
      </table>
    </div>
    <CardSearchResult :filteredCards>
      <template #layout-button>
        <div class="layout-button">
          <SearchButton
            :text="t('ui.button.filter')"
            :title="t('ui.button.filter-button-description')"
            color="var(--color-attention)"
            :text-color="
              filterPanelToggle ? 'var(--color-fab-text)' : undefined
            "
            :filled="filterPanelToggle"
            @button-click="filterPanelToggle = !filterPanelToggle"
          />
          <slot name="result-width-maximize-button"></slot>
        </div>
      </template>
      <template #card-sorter>
        <div class="select-container">
          <select v-model="sortFunctionName">
            <option
              v-for="sortName in Object.keys(sortFunction)"
              :value="sortName"
            >
              {{ t(sortName) }}
            </option>
          </select>
        </div>
      </template>
    </CardSearchResult>
  </div>
</template>

<style scoped src="../css/card-search.css"></style>

<style scoped>
.card-search {
  contain: content;
  display: flex;
  flex-direction: row-reverse;
  height: calc(100dvh - 2em);
  max-height: calc(100dvh - 2em);
}
@media (width <= 768px) {
  .card-search {
    height: 100dvh;
    max-height: 100dvh;
  }
}

.card-search-filter-container {
  --border-spacing: 0.6em;
  background-color: var(--color-background);
  contain: content;
  font-size: 1.6rem;
  height: 100%;
  overflow-y: scroll;
  padding: 2em 0 4em 0;
  transition: transform 0.2s;
  z-index: 1;
}
.card-search-filter {
  background-color: var(--color-background);
  border-spacing: var(--border-spacing);
}
@media (width <= 1440px) {
  .card-search-filter-container {
    inset: 0 0 auto calc(-1 * var(--border-spacing));
    /* fab を避ける */
    padding-bottom: calc(2em + 10vmax);
    position: absolute;
  }
  :not(.filter-panel-changed) > .card-search-filter-container {
    transform: translateX(100vw);
  }
  .card-search-filter {
    width: 100%;
  }
  .layout-button {
    display: none;
  }
}

@media (1440px < width) {
  /* フィルタを固定サイドパネルとして表示 */
  .card-search-filter {
    background-color: var(--color-background);
    inset: 0 0 auto 0;
    max-width: 560px;
    width: 560px;
  }

  /* アニメーション中のカード一覧の表示が汚いのでアニメーションしない */
  .filter-panel-changed > .result {
    min-width: 100%;
  }

  .layout-button {
    display: flex;
    flex-direction: column;
  }
}

.card-number-max {
  font-size: 125%;
  font-weight: bold;
  line-height: 1;
}
</style>
