<script setup lang="ts">
import { ref } from "vue";

const widthPercent = ref(0);
</script>

<template>
  <div
    class="box1"
    :style="{
      '--width-percent': widthPercent,
    }"
  ></div>
  <div
    class="box2"
    :style="{
      width: `${widthPercent}%`,
    }"
  ></div>
</template>

<style module>
.box1 {
  background-color: red;
  height: 50px;
  width: calc(1% * var(--size-percent));
}
.box2 {
  background-color: green;
  height: 50px;
}
</style>
