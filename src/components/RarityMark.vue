<script setup lang="ts">
defineProps<{
  rarity: number;
}>();
</script>

<template>
  <span v-for="_i of rarity" class="rarity-mark"></span>
</template>

<style scoped>
.rarity-mark {
  aspect-ratio: 1 / 1;
  background: linear-gradient(
    10deg,
    white 0 30%,
    #5e5e5e 43% 57%,
    white 70% 100%
  );
  filter: drop-shadow(0 0 0.1em black);
  display: inline-block;
  transform: scaleX(70%) rotate(-45deg);
  width: 1em;
}
</style>
