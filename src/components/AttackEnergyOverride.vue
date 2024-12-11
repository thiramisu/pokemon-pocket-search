<script setup lang="ts">
import PokemonTypeMark from "./PokemonTypeMark.vue";
import { shortenToTypes } from "../data/types";

defineProps<{
  energyOverrideText: string;
  size: string;
}>();
</script>

<template>
  <PokemonTypeMark
    v-for="shortenPokemonType of energyOverrideText"
    :size
    :pokemon-type="shortenToTypes(shortenPokemonType)"
  />
</template>

<style scoped></style>
