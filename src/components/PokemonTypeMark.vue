<script setup lang="ts">
import { PokemonType } from "../data/types";

defineProps<{
  simple?: boolean;
  size?: string;
  pokemonType: PokemonType;
}>();
</script>

<template>
  <span
    :class="{ 'pokemon-type-mark': true, simple }"
    :style="{
      backgroundColor: simple ? undefined : pokemonType.color,
      borderColor: pokemonType.color,
      fontSize: size,
    }"
    ><span class="pokemon-type-string">{{ pokemonType.shorten }}</span></span
  >
</template>

<style scoped>
.pokemon-type-mark {
  border-radius: 50%;
  box-shadow:
    inset -0.02em -0.01em 0.09em 0.06em #00000070,
    0 0 0.2em 0.05em var(--color-drop-shadow);
  color: #333333;
  display: table-cell;
  flex: 0 0;
  font-family: "Times New Roman", Times, serif;
  font-weight: bolder;
  height: 1em;
  line-height: 1;
  min-height: 1em;
  min-width: 1em;
  position: relative;
  text-align: center;
  transform: translate(0.03em, 0.03em);
  width: 1em;
}
/* ハイライト */
.pokemon-type-mark:not(.simple)::before {
  content: "";
  background: linear-gradient(#ffffffaa 0% 40%, #ffffff00 60% 100%);
  border-radius: 50%;
  box-shadow: 0 0 0.02em linear-gradient(#ffffffaa 0% 40%, #ffffff00 60% 100%);
  filter: blur(0.03em);
  inset: 0 25%;
  position: absolute;
  transform: rotate(-45deg);
}
.simple {
  border: solid 0.1em;
  color: var(--color-text);
  transform: unset;
}

.pokemon-type-string {
  text-shadow: 0 0 0.3em #ffffffff;
  font-size: 100%;
  font-weight: 900;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-54%, -54%);
}
</style>
