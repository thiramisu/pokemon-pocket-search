<script setup lang="ts">
const modelValue = defineModel({ default: false });
</script>

<template>
  <label class="toggle-button"
    ><slot name="off"></slot>
    <input type="checkbox" v-model="modelValue" />
    <div class="switch-container">
      <div class="bar">
        <div class="bar-background"></div>
      </div>
      <div class="thumb"></div>
    </div>
    <slot name="on"></slot
  ></label>
</template>

<style scoped>
.toggle-button {
  cursor: pointer;
  display: flex;
  gap: 0.6em;
  place-items: center;
  font-size: 1.6em;
}
input[type="checkbox"] {
  display: none;
}
.switch-container {
  height: 1.2em;
  position: relative;
  width: 2.4em;
}
.bar {
  border-radius: 10em;
  inset: 0.2em 0;
  overflow: hidden;
  position: absolute;
}
.bar-background,
.bar-background::before,
.bar-background::after,
.bar::after {
  content: "";
  inset: 0;
  position: absolute;
}
.bar-background::before {
  background-color: var(--color-primary-50);
}
.bar-background::after {
  background-color: gray;
  transition: transform 0.2s ease-out;
}
input:checked + .switch-container > .bar > .bar-background::after {
  transform: translateX(3em);
}
/* 影 */
.bar::after {
  border-radius: 10em;
  box-shadow: inset 0 0 0.3em black;
}
/* つまみ */
.thumb {
  aspect-ratio: 1 / 1;
  background-color: var(--color-primary-50);
  border-radius: 50%;
  box-shadow: 0 0 0.3em var(--color-background);
  cursor: pointer;
  inset: 0 auto;
  position: absolute;
  transition: transform 0.2s ease-out;
  transform: translateX(-20%);
}
input:checked + .switch-container > .thumb {
  transform: translateX(calc(2.4em - 80%));
}
</style>
