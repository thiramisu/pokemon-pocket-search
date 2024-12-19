<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Card, dummyCard } from "../data/types";
import CardCard from "./CardCard.vue";
import PageButton from "./PageButton.vue";
import CardDetailDialog from "./CardDetailDialog.vue";

const props = defineProps<{
  filteredCards: Card[];
}>();

const page = ref(1);
const cardPerPage = ref(12);
watch(cardPerPage, (newValue: number, oldValue: number) => {
  // 旧現在ページ内の最初のカードが新現在ページ内に表示されるように調整する
  const oldFirstCardIndex = (page.value - 1) * oldValue + 1;
  const mod = oldFirstCardIndex % newValue;
  page.value =
    Math.round((oldFirstCardIndex - mod) / newValue) + (mod === 0 ? 0 : 1);
});

const detailedCard = ref(dummyCard);
const detailedCardIndex = computed(() =>
  props.filteredCards.findIndex((card) => card.ID === detailedCard.value.ID)
);
const navigationButtons = computed(() => detailedCardIndex.value !== -1);
const cardDetailDialogVisible = ref(false);

watch(
  () => props.filteredCards,
  () => {
    page.value = 1;
  }
);
</script>

<template>
  <article class="result">
    <header class="result-header">
      <div class="layout-button--container">
        <slot name="layout-button"></slot>
      </div>
      <div class="flex items-center justify-center">
        検索結果: {{ filteredCards.length }}件中
        {{ filteredCards.length === 0 ? 0 : (page - 1) * cardPerPage + 1 }}
        - {{ Math.min(filteredCards.length, page * cardPerPage) }}件目
        1ページあたりの表示件数:<span class="select-container">
          <select v-model="cardPerPage">
            <option v-for="value in [12, 24, 50, 100]" :key="value" :value>
              {{ value }}
            </option>
          </select>
        </span>
      </div>
      <PageButton
        v-model="page"
        :max="Math.ceil((filteredCards.length - 0.5) / cardPerPage)"
        color="var(--color-filled-button-default)"
        :width="9"
      />
      <div v-if="filteredCards.length === 0">検索結果がありませんでした。</div>
      <div class="card-sorter">
        <slot name="card-sorter"></slot>
      </div>
    </header>
    <div class="result-cards">
      <template v-for="(card, i) in filteredCards" :key="card.ID">
        <CardCard
          v-if="(page - 1) * cardPerPage <= i && i < page * cardPerPage"
          font-size="1rem"
          :card
          button
          @click="
            detailedCard = card;
            cardDetailDialogVisible = true;
          "
        />
      </template>
      <!-- 最終ページから他ページに移動した時のスクロールずれを防止するためのダミー -->
      <div
        class="dummy"
        v-if="page * cardPerPage - filteredCards.length > 0"
        v-for="_i in page * cardPerPage - filteredCards.length"
        :key="_i"
      >
        <CardCard font-size="1rem" :card="dummyCard" />
      </div>
    </div>
    <PageButton
      v-model="page"
      :max="Math.ceil((filteredCards.length - 0.5) / cardPerPage)"
      color="var(--color-filled-button-default)"
      :width="9"
    />
    <CardDetailDialog
      v-model="cardDetailDialogVisible"
      v-model:card="detailedCard"
      :navigation-buttons
      @previous="
        detailedCard =
          filteredCards[detailedCardIndex - 1] ?? filteredCards.at(-1)
      "
      @next="
        detailedCard = filteredCards[detailedCardIndex + 1] ?? filteredCards[0]
      "
    />
  </article>
</template>

<style scoped src="../css/card-search.css"></style>

<style scoped>
.result {
  border-top: 0.1em;
  box-shadow: inset 0 0 0.2em black;
  flex: 1 1;
  overflow-y: auto;
  padding: 1.5em;
}
@media (width <= 768px) {
  .result {
    /* スクロール限界の明示 */
    padding-top: 9em;
  }
}
@media (width <= 1440px) {
  .result {
    /* fab を避ける */
    padding-bottom: calc(6em + 10vmax);
  }
}
.result-header {
  contain: layout;
  padding-bottom: 1.5em;
}
.layout-button--container {
  inset: 0 0 auto auto;
  position: absolute;
}
.result-header label {
  user-select: none;
}
.card-sorter {
  display: block grid;
  font-size: 160%;
  place-items: center;
  padding-top: 1.5em;
}
.result-cards {
  display: grid;
  gap: 3em 2em;
  grid-template-columns: repeat(auto-fill, minmax(24em, 1fr));
  justify-items: center;
  padding-bottom: 3em;
}
.dummy {
  opacity: 30%;
  user-select: none;
}
.page-button {
  justify-content: center;
}
</style>
