<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  icon: string;
}>();
const maskImage = computed(() => `url(./${props.icon}.svg)`);
</script>

<template>
  <div
    class="icon"
    :style="{
      WebkitMaskImage: maskImage,
      maskImage,
    }"
  ></div>
</template>

<style scoped>
.icon {
  aspect-ratio: 1 / 1;
  background-color: currentColor;
  mask: no-repeat center / 100%;
  width: 1em;
}
</style>
