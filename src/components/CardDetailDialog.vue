<script setup lang="ts">
import { computed, watch } from "vue";
import {
  Card,
  cards,
  cardRelations,
  getExpansionByPackName,
  targetables,
  getEvolutionStage,
  evolutionStageNames,
  dummyCard,
  isVariant,
  getCardNameWithSuffix,
  getPackByName,
} from "../data/types";
import { SHARED_PACK } from "../const";
import { partition } from "../utils";
import { useTranslation } from "../composables/translation";
import CardCard from "./CardCard.vue";
import CommonDialog from "./CommonDialog.vue";
import Icon from "./Icon.vue";

const { getTranslatedCardName, getSharedExpansionName, getTranslatedName } =
  useTranslation();

const card = defineModel<Card>("card", { default: dummyCard });

defineProps<{ navigationButtons: boolean }>();

const relations = computed(
  () => cardRelations[getCardNameWithSuffix(card.value)]
);
const targetableNames = computed(() => targetables[card.value.ID]);
const expansionName = computed(() =>
  getTranslatedName.value(getExpansionByPackName(card.value.パック))
);

const predicatedVariants = computed(() =>
  partition(relations.value.cardIds, (cardId2) =>
    isVariant(card.value, cards[cardId2])
  )
);

const dialogVisible = defineModel({ default: false });
const applyCardIdFromQuery = () => {
  const currentUrl = new URL(window.location.href);
  const cardId = parseInt(currentUrl.searchParams.get("card_id") ?? "-1");
  if (
    !Number.isInteger(cardId) ||
    cardId < 0 ||
    cards.length <= cardId ||
    cards[cardId].名前 === dummyCard.名前
  ) {
    dialogVisible.value = false;
  } else {
    dialogVisible.value = true;
    card.value = cards[cardId];
  }
};
const pushState = (mode: "set" | "delete") => {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams[mode]("card_id", card.value.ID.toString());
  const url = currentUrl.toString();
  if (window.location.href !== url) {
    history.pushState(undefined, "", url);
  }
};
watch(card, () => {
  pushState("set");
});
watch(dialogVisible, () => {
  pushState(dialogVisible.value ? "set" : "delete");
});
window.addEventListener("load", applyCardIdFromQuery);
window.addEventListener("popstate", applyCardIdFromQuery);

defineEmits<{
  previous: [void];
  next: [void];
}>();
</script>

<template>
  <CommonDialog v-model="dialogVisible" class="card-detail-dialog">
    <div class="column-grid">
      <CardCard :card />
      <div class="card-header">
        <h1>{{ getTranslatedCardName(card) }}</h1>
        <div>{{ expansionName }}</div>
        <div>
          {{
            card.パック === getSharedExpansionName(expansionName)
              ? SHARED_PACK
              : getTranslatedName(getPackByName(card.パック))
          }}
        </div>
      </div>
    </div>
    <div class="flex items-center">
      <div class="column">
        <template v-if="predicatedVariants.pass.length !== 1">
          <h2>同型</h2>
          <div class="flex flex-wrap justify-center">
            <template v-for="cardId of predicatedVariants.pass">
              <CardCard
                v-if="card.ID !== cardId"
                :card="cards[cardId]"
                button
                @click="card = cards[cardId]"
              />
            </template>
          </div>
        </template>
        <template v-if="predicatedVariants.fail.length !== 0">
          <h2>同名/ex</h2>
          <div class="flex flex-wrap justify-center">
            <template v-for="cardId of predicatedVariants.fail">
              <CardCard
                :card="cards[cardId]"
                button
                @click="card = cards[cardId]"
              />
            </template>
          </div>
        </template>
        <template
          v-if="relations.evolutions !== undefined"
          v-for="evolutionName of relations.evolutions"
        >
          <h2>
            {{ evolutionStageNames[getEvolutionStage(evolutionName)] }}：{{
              evolutionName
            }}
          </h2>
          <div class="flex flex-wrap justify-center">
            <CardCard
              v-for="cardId of cardRelations[evolutionName].cardIds"
              :card="cards[cardId]"
              button
              @click="card = cards[cardId]"
            />
          </div>
        </template>
        <template v-if="targetableNames !== undefined">
          <h2>このカードで選べるカード</h2>
          <template v-for="targetableName of targetableNames">
            <h3>{{ targetableName }}</h3>
            <div class="flex flex-wrap justify-center">
              <template v-for="cardId of cardRelations[targetableName].cardIds">
                <CardCard
                  v-if="getCardNameWithSuffix(cards[cardId]) === targetableName"
                  :card="cards[cardId]"
                  button
                  @click="card = cards[cardId]"
                />
              </template>
            </div>
          </template>
        </template>
        <template v-if="relations.targetedBy !== undefined">
          <h2>このカードを選べるカード</h2>
          <div class="flex flex-wrap justify-center">
            <CardCard
              v-for="cardId of relations.targetedBy"
              :card="cards[cardId]"
              button
              @click="card = cards[cardId]"
            />
          </div>
        </template>
        <!-- TODO: <h3>イラスト違いカード</h3> -->
      </div>
    </div>
    <div v-if="navigationButtons" class="button-container">
      <button class="button" title="前のカードへ" @click="$emit('previous')">
        <Icon icon="arrow_back_ios_new_wght100" />
      </button>
      <button class="button" title="次のカードへ" @click="$emit('next')">
        <Icon icon="arrow_forward_ios_wght100" />
      </button>
    </div>
  </CommonDialog>
</template>

<style scoped src="../css/button.css"></style>

<style scoped>
.column-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
}
@media (width <= 768px) {
  .column-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  .card-header {
    order: -1;
  }
}
.card-card {
  font-size: 1.2rem;
}
@media (width <= 768px) {
  .card-card {
    font-size: 1rem;
  }
}
h1 {
  line-height: 1;
  margin: 0;
  padding: 0.3em 0;
}
h2,
h3 {
  line-height: 1.2;
  margin: 1.2em 0 0.6em 0;
  padding: 0;
}
.button-container {
  align-items: center;
  cursor: pointer;
  display: flex;
  filter: drop-shadow(0 0 0.2em black);
  justify-content: space-between;
  inset: 0;
  margin: auto;
  pointer-events: none;
  position: fixed;
}
:not(.width-maximized) .button-container {
  max-width: calc(1440px + 5em);
}
.button {
  background-color: transparent;
  border: none;
  font-size: 8em;
  pointer-events: initial;
}
.button::before {
  border-radius: 0.25em;
}
</style>
