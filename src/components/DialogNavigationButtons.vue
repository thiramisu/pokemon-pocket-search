<script setup lang="ts">
import Icon from "./Icon.vue";

defineProps<{
  previousTitle?: string;
  nextTitle?: string;
}>();
defineEmits<{
  previous: [void];
  next: [void];
}>();
</script>

<template>
  <div class="button-container">
    <button class="button" :title="previousTitle" @click="$emit('previous')">
      <Icon icon="arrow_back_ios_new_wght100" />
    </button>
    <button class="button" :title="nextTitle" @click="$emit('next')">
      <Icon icon="arrow_forward_ios_wght100" />
    </button>
  </div>
</template>

<style scoped src="../css/button.css"></style>

<style scoped>
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
button {
  background-color: transparent;
  border: none;
  font-size: 8em;
  pointer-events: initial;
}
.button::before {
  border-radius: 0.25em;
}
</style>
