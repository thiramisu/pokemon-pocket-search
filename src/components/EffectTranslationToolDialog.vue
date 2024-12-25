<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import CommonDialog from "./CommonDialog.vue";
import { useTranslation } from "../composables/translation";
import { cards, withSuffix, traits } from "../data/types";
import {
  extractKnownEffectFragments,
  joinExtractedResults,
} from "../services/extractKnownEffectFragments";
import { writeTextToClipboard } from "../utils";
import CardCard from "./CardCard.vue";
import DialogNavigationButtons from "./DialogNavigationButtons.vue";
import SearchButton from "./SearchButton.vue";

const { t } = useI18n();
const { getTranslatedCardName, getTranslatedName } = useTranslation();

const traitIndex = ref(traits.length - 1);
const findNextTraitIndexWithEffect = (direction: 1 | -1) => {
  const oldIndex = traitIndex.value;
  let currentIndex = oldIndex;
  do {
    currentIndex = (currentIndex + traits.length + direction) % traits.length;
    if ("効果" in traits[currentIndex]) {
      return currentIndex;
    }
  } while (currentIndex !== oldIndex);
  alert(t("ett.error.not-found-trait-with-effect"));
  return oldIndex;
};
traitIndex.value = findNextTraitIndexWithEffect(1);

const trait = computed(() => traits[traitIndex.value]);

const extractedWords = computed(() =>
  "効果" in trait.value ? extractKnownEffectFragments(trait.value.効果) : []
);
const result = computed(() => joinExtractedResults(extractedWords.value));
</script>

<template>
  <CommonDialog>
    <div class="column">
      <CardCard :card="cards[trait.カードID]" class="self-center" />
      <div class="margin-top self-center">
        ID {{ traitIndex }}:
        <span
          >「{{
            "名前" in trait
              ? getTranslatedName(trait)
              : getTranslatedCardName({
                  card: cards[trait.カードID],
                  withSuffix,
                })
          }}」</span
        >
      </div>
      <div class="margin-top column items-end">
        <template v-for="extractedWord of extractedWords">
          <div v-if="extractedWord.leadingText !== ''">
            {{ extractedWord.leadingText }} =
            <input type="text" :value="extractedWord.leadingText" />
          </div>
          <div v-if="extractedWord.source !== ''">
            {{ extractedWord.source }} =
            <input type="text" :value="extractedWord.converted" readonly />
          </div>
        </template>
      </div>
      <textarea :value="result"></textarea>
      <SearchButton
        :text="t('ett.ui.copy-to-clipboard')"
        @button-click="writeTextToClipboard(result)"
      />
      <DialogNavigationButtons
        :previous-title="t('ett.ui.previous-card')"
        :next-title="t('ett.ui.next-card')"
        @previous="traitIndex = findNextTraitIndexWithEffect(-1)"
        @next="traitIndex = findNextTraitIndexWithEffect(1)"
      />
    </div>
  </CommonDialog>
</template>

<style scoped src="../css/card-search.css"></style>

<style scoped>
.card-card {
  font-size: 1rem;
}
.margin-top {
  margin-top: 1em;
}
.self-center {
  align-self: center;
}
.self-end {
  align-self: center;
}
input[readonly] {
  background-color: var(--button-overlay);
}
</style>
