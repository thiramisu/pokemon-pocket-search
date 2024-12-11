<script setup lang="ts">
defineProps<{
  string: string;
  dummyString: string;
}>();
</script>

<template>
  <span v-for="(dummyChar, i) in dummyString" class="dummy-char"
    >{{ dummyChar }}<span class="display-char">{{ string[i] }}</span></span
  >
</template>

<style scoped>
.dummy-char {
  position: relative;
  visibility: hidden;
}
.display-char {
  inset: 50% auto auto 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  visibility: visible;
}
</style>
