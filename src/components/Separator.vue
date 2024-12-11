<script setup lang="ts">
defineProps<{
  higherIs: "top" | "left" | "right" | "bottom";
}>();
</script>

<template>
  <div :class="['separator', higherIs]"></div>
</template>

<style scoped>
.top {
  box-shadow: inset 0 2em 1.2em -2em var(--color-drop-shadow);
  margin-top: 3em;
  height: 3em;
}
.bottom {
  box-shadow: inset 0 -2em 1.5em -2em var(--color-drop-shadow);
  margin-bottom: 3em;
  height: 3em;
}
</style>
