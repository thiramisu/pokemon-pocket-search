<script setup lang="ts">
import SearchButton from "./SearchButton.vue";
import { pokemonTypes } from "../data/types";
import { toggleSetItem } from "../utils";

defineProps<{
  name: string;
}>();

const selectedPokemonTypes = defineModel<Set<string>>({ default: new Set() });
const reversePokemonTypeSet = () => {
  for (const pokemonType of pokemonTypes) {
    toggleSetItem(selectedPokemonTypes.value, pokemonType.translations.ja);
  }
};
</script>

<template>
  <tr
    :class="{
      changed: selectedPokemonTypes.size !== 0,
    }"
  >
    <th>
      {{ name }}<br />
      <SearchButton
        text="reverse"
        class="action-button"
        @button-click="reversePokemonTypeSet()"
      /><br />
      <SearchButton
        text="clear"
        :disabled="selectedPokemonTypes.size === 0"
        class="action-button"
        @button-click="selectedPokemonTypes.clear()"
      />
    </th>
    <td>
      <template v-for="pokemonType in pokemonTypes">
        <!-- 未実装のフェアリータイプは飛ばす -->
        <SearchButton
          v-if="pokemonType.shorten !== 'Y'"
          :text="pokemonType.translations.en"
          :color="pokemonType.color"
          :filled="selectedPokemonTypes.has(pokemonType.translations.ja)"
          @button-click="
            toggleSetItem(selectedPokemonTypes, pokemonType.translations.ja)
          "
        />
      </template>
    </td>
  </tr>
</template>

<style scoped src="../css/card-search.css"></style>
