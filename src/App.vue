<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { POKEMON_NAME_DATALIST_ID } from "./const";
import { cards, dummyCard, languages } from "./data/types";
import { useTranslation } from "./composables/translation";
import CardSearch from "./components/CardSearch.vue";
import EffectTranslationToolDialog from "./components/EffectTranslationToolDialog.vue";
import FaviconEditorDialog from "./components/FaviconEditorDialog.vue";
import Icon from "./components/Icon.vue";
// import Sandbox from "./components/Sandbox.vue";
import SearchButton from "./components/SearchButton.vue";
import TSVConverterDialog from "./components/TSVConverterDialog.vue";
import ToggleButton from "./components/ToggleButton.vue";
const { language, getTranslatedCardName } = useTranslation();

const pageTitle = import.meta.env.VITE_APP_TITLE;

const tsvConverterDialogVisible = ref(false);
const FaviconEditorDialogVisible = ref(false);
const EffectTranslationToolDialogVisible = ref(false);

const shouldMaximizeWidth = ref(false);

const fabId = useId();
const filterPanelOpen = ref(false);

const filteredCardCount = ref(0);
const onSearch = (count: number) => {
  filteredCardCount.value = count;
};

const isLightTheme = (() => {
  const savedTheme = localStorage.getItem("theme");

  return ref(
    savedTheme === "light" ||
      // 初回
      (savedTheme === null &&
        window.matchMedia("(prefers-color-scheme: light)").matches)
  );
})();
watch(
  isLightTheme,
  (newValue) => {
    if (newValue !== undefined) {
      localStorage.setItem("theme", newValue ? "light" : "dark");
      document.documentElement.classList.toggle("light", newValue);
      document.documentElement.classList.toggle("dark", !newValue);
    }
  },
  { immediate: true }
);

// 重複削除
const cardNames = computed(
  // () => new Set(cards.map((card) => getTranslatedCardName.value(card)))
  () => new Set(cards.map((card) => getTranslatedCardName.value(card)))
);
</script>

<template>
  <div
    :class="[
      'main-container',
      shouldMaximizeWidth ? 'width-maximized' : undefined,
    ]"
  >
    <div>
      <input type="checkbox" v-model="filterPanelOpen" :id="fabId" />
      <label
        :for="fabId"
        title="検索条件の表示/非表示を切り替える"
        :class="[
          'fab',
          'button',
          'filter-button',
          filterPanelOpen ? 'opened' : 'closed',
        ]"
        ><div class="filter-button-icon">
          <div class="filter-button-text">
            <div class="filter-button-text-stroke">
              ×{{ filteredCardCount }}
            </div>
            ×{{ filteredCardCount }}
          </div>
        </div></label
      >
    </div>
    <!-- <Sandbox /> -->
    <CardSearch v-model="filterPanelOpen" @change="onSearch">
      <template #result-width-maximize-button>
        <SearchButton
          text="横幅最大"
          title="表示領域の横幅を限界まで伸ばすかを切り替える"
          class="maximum-cards"
          :filled="shouldMaximizeWidth"
          @button-click="shouldMaximizeWidth = !shouldMaximizeWidth"
        />
      </template>
    </CardSearch>
    <footer class="page-footer flex items-center justify-center">
      <h1>{{ pageTitle }}</h1>
      <div class="column">
        <ToggleButton
          v-model="isLightTheme"
          class="justify-center theme-switch"
        >
          <template #off>
            <Icon icon="dark_mode" color="blue" />
          </template>
          <template #on>
            <Icon icon="light_mode" color="blue" />
          </template>
        </ToggleButton>
        <div class="language-select">
          Language:
          <span class="select-container">
            <select v-model="language">
              <template v-for="language in languages">
                <option
                  v-if="language.code === 'ja' || language.code === 'en'"
                  :value="language.code"
                >
                  {{ language.name }}
                </option>
              </template>
            </select>
          </span>
          (Experimental)
        </div>
        開発用ツールなど（PC向け）
        <SearchButton
          text="tsv変換器をひらく"
          @button-click="tsvConverterDialogVisible = true"
        />
        <SearchButton
          text="faviconエディタをひらく"
          @button-click="FaviconEditorDialogVisible = true"
        />
        <SearchButton
          text="翻訳用ツールをひらく"
          @button-click="EffectTranslationToolDialogVisible = true"
        />
      </div>
    </footer>
  </div>

  <TSVConverterDialog v-model="tsvConverterDialogVisible" />
  <FaviconEditorDialog v-model="FaviconEditorDialogVisible" />
  <EffectTranslationToolDialog v-model="EffectTranslationToolDialogVisible" />

  <datalist :id="POKEMON_NAME_DATALIST_ID">
    <template v-for="cardName of cardNames" :key="cardName">
      <option
        v-if="cardName !== getTranslatedCardName(dummyCard)"
        :value="cardName"
      ></option>
    </template>
  </datalist>
</template>

<style scoped src="./css/button.css"></style>
<!-- <select>用 -->
<style scoped src="./css/card-search.css"></style>

<style scoped>
.main-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  width: 100%;
}
@media (width <= 768px) {
  .main-container {
    padding: 0;
  }
}
.main-container.width-maximized {
  max-width: revert;
}

@media (width <= 1440px) {
  .main-container {
    padding-bottom: calc(4em + 10vmax);
  }
}

input[type="checkbox"] {
  display: none;
}
.fab {
  aspect-ratio: 1 / 1;
  background: var(--color-fab-background);
  border-radius: 20%;
  box-shadow: 0 0 1.5em var(--color-drop-shadow);
  color: var(--color-fab-text);
  position: fixed;
  inset: auto 3em 3em auto;
  user-select: none;
  width: 10vmax;
  width: 10vmax;
  z-index: 100;
}
@media (1440px < width) {
  .fab {
    display: none;
  }
}

footer {
  background-color: var(--color-dialog-background);
  border: solid 1.2em var(--color-dialog-border);
  border-radius: 2em;
  margin-top: 2em;
  padding: 1.5em;
}
h1 {
  font-size: 300%;
  padding: 1em;
}

.filter-button::before {
  border-radius: 20%;
}

.filter-button-icon::before,
.filter-button-icon::after {
  content: "";
  background: no-repeat center / 65%;
  border-radius: 20%;
  inset: 0.1em;
  position: absolute;
  transition: opacity 0.2s;
  z-index: -2;
}
.filter-button-icon::before {
  background-image: url("/fullscreen_portrait.svg");
}
.filter-button-icon::after {
  background-color: var(--color-fab-background);
  background-image: url("/tune.svg");
}
.filter-button.opened > .filter-button-icon::after {
  opacity: 0;
}
.filter-button-text {
  font-size: 2vmax;
  font-weight: bold;
  position: absolute;
  inset: auto 15% 15% auto;
  z-index: -2;
}
.filter-button-text-stroke {
  inset: 0;
  position: absolute;
  -webkit-text-stroke: 0.4em var(--color-fab-background);
  z-index: -1;
}
.theme-switch,
.language-select {
  padding: 1em 0;
}
.select-container {
  display: inline-block;
}
</style>
