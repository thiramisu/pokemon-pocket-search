<script setup lang="ts">
import { computed } from "vue";
import { POKEMON_NO_WEAK } from "../const";
import {
  getTraits,
  getPreEvolution,
  japaneseToTypes,
  Card,
  evolutionStageNames,
  getExpansionByPackName,
} from "../data/types";
import { colorLess } from "../data/types";
import { useTranslation } from "../composables/translation";
import CardCardTraits from "./CardCardTraits.vue";
import PokemonTypeMark from "./PokemonTypeMark.vue";
import PseudoMonospace from "./PseudoMonospace.vue";
import RarityMark from "./RarityMark.vue";

const { getTranslatedCardName } = useTranslation();

const props = defineProps<{
  card: Card;
  fontSize?: string;
  button?: boolean;
}>();
const evolutionFrom = computed(() => getPreEvolution(props.card.名前));
const cardType = computed(() =>
  "トレーナーズ" in props.card
    ? props.card.トレーナーズ
    : evolutionStageNames[
        evolutionFrom.value === undefined
          ? 0
          : getPreEvolution(evolutionFrom.value)
            ? 2
            : 1
      ]
);
const traits = computed(() => getTraits(props.card.ID));

const expansion = computed(() => getExpansionByPackName(props.card.パック));
</script>

<template>
  <component
    :is="button ? 'button' : 'div'"
    :class="{ 'card-card': true, button }"
    :style="{
      fontSize,
      borderColor:
        'タイプ' in card
          ? `color-mix(in srgb, ${japaneseToTypes(card.タイプ).color} 50%, var(--color-background))`
          : undefined,
    }"
  >
    <header
      :class="{
        fossil: 'HP' in card && !('タイプ' in card),
      }"
    >
      <div class="card-type x-small">{{ cardType }}</div>
      <div class="name">
        <span>{{ getTranslatedCardName({ card }) }}</span
        ><span v-if="'ex' in card" class="ex">ex</span>
        <div v-if="'HP' in card" class="hp">
          <span class="text-xs">HP </span>{{ card.HP }}
        </div>
      </div>
      <div class="x-xs flex justify-center">
        <PokemonTypeMark
          v-if="'タイプ' in card"
          size="1.25em"
          :pokemon-type="japaneseToTypes(card.タイプ)"
        />
      </div>
    </header>
    <div class="trait-container full-height column justify-evenly">
      <CardCardTraits
        v-for="trait of traits"
        :trait
        :pokemon-type="
          'タイプ' in card ? japaneseToTypes(card.タイプ) : undefined
        "
      />
    </div>
    <footer>
      <div class="expansion-mark">
        <span :class="`expansion-${expansion.略号.length}`">{{
          expansion.略号
        }}</span
        ><span class="separator"><span class="text-for-copy">|</span></span
        ><span class="collection-number-container">
          <PseudoMonospace
            :string="card.コレクションナンバー.toString().padStart(3, '0')"
            dummy-string="000" />/<PseudoMonospace
            :string="expansion.カード種類数.toString().padStart(3, '0')"
            dummy-string="000"
        /></span>
      </div>
      <div class="rarity-mark-container">
        <RarityMark :rarity="card.レアリティ" />
      </div>
      <div v-if="'タイプ' in card" class="column justify-self-start">
        <span class="type-description text-left text-xs lh-100">弱点</span>
        <span v-if="card.弱点 === POKEMON_NO_WEAK" class="lh-100">-</span>
        <span v-else class="flex items-end">
          <PokemonTypeMark :pokemon-type="japaneseToTypes(card.弱点)" />
          <span class="additional-damage">+20</span>
        </span>
      </div>
      <div v-if="'にげる' in card" class="column justify-self-start">
        <span class="type-description text-left text-xs lh-100">にげる</span>
        <span class="retreat-cost">
          <PokemonTypeMark
            v-for="_i in card.にげる"
            :pokemon-type="colorLess"
          />
        </span>
      </div>
    </footer>
  </component>
</template>

<style scoped src="../css/button.css"></style>

<style scoped>
.card-card {
  align-items: stretch;
  background: var(--color-text-background);
  border: solid 0.6em var(--color-trainer-card-border);
  border-radius: 0.3em;
  font-family: inherit;
  font-size: 2.4rem;
  display: grid;
  grid-auto-rows: 3em 9em 3em;
  margin: 0;
  padding: 0.3em 1em;
  width: 25.2em;
}
.card-type {
  white-space: pre-line;
}
header,
footer {
  align-items: center;
  display: grid;
}
header {
  grid-template-columns: 4em 16em 2em;
  line-height: 1;
}
header.fossil {
  grid-template-columns: 4em 17em 1em;
}
footer {
  height: 3.3em;
  justify-items: center;
  grid-template-columns: 8em 6em 4em 4em;
}
.name {
  align-items: baseline;
  contain: layout;
  display: flex;
  font-size: 200%;
  font-weight: 700;
}
.ex {
  background: linear-gradient(
    -45deg,
    #eec800 0% 30%,
    white 50% 55%,
    #eec800 70% 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  letter-spacing: -0.05em;
  line-height: 1;
  padding-right: 0.05em;
  position: relative;
}
.ex::before {
  content: "ex";
  text-shadow: 0 0 0.1em black;
  inset: 0;
  position: absolute;
  z-index: -1;
}
.hp {
  position: absolute;
  inset: 0.05em 0 0.05em auto;
  vertical-align: middle;
  font-size: 90%;
  font-weight: bold;
}
.trait-container {
  padding: 0 0.6em;
  position: relative;
}
.trait-container::before,
.trait-container::after {
  content: "";
  border-bottom: solid 0.02em var(--color-text);
  inset: auto 7%;
  position: absolute;
  opacity: 16%;
}
.trait-container::before {
  top: 0;
}
.trait-container::after {
  bottom: 0;
}
.expansion-mark {
  border: solid 1px var(--color-text);
  border-radius: 0.4em;
  font-weight: bold;
  justify-self: self-start;
  width: max-content;
}
.expansion-2,
.expansion-3,
.collection-number-container {
  padding: 0.1em 0.6em 0.1em 0.6em;
}

.expansion-2,
.expansion-3 {
  border-right: solid 1px var(--color-text);
}
.expansion-2 {
  letter-spacing: 0.15em;
  padding-right: 0.45em;
}

.additional-damage {
  font-size: 80%;
  line-height: 1;
}
.retreat-cost {
  min-height: 1em; /* にげるに必要なエネルギーが無い時用 */
}
.separator {
  contain: content;
  display: inline-block;
}
.text-for-copy {
  inset: 0;
  margin: auto;
  position: absolute;
}
.rarity-mark-container {
  transform: translateY(0.1em);
}

.x-xs {
  width: 2em;
}
.x-small {
  width: 4em;
}
.type-description {
  margin-bottom: 0.3em;
}
.lh-100 {
  line-height: 100%;
}
.rarity-mark {
  background-color: red;
  display: inline-block;
  height: 0.5em;
  width: 0.5em;
}
</style>
