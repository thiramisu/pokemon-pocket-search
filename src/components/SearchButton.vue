<script setup lang="ts">
import { ref } from "vue";
defineProps<{
  text: string;
  title?: string;
  filled?: boolean;
  color?: string;
  textColor?: string;
  disabled?: boolean;
}>();
const isPlayingClickAnimation = ref(false);
const playAnimation = async () => {
  isPlayingClickAnimation.value = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isPlayingClickAnimation.value = true;
    });
  });
};
</script>

<template>
  <button
    :title="title ?? text"
    :class="{
      'search-button': true,
      filled,
      clicked: isPlayingClickAnimation,
    }"
    :style="{
      borderColor: color,
      backgroundColor: filled ? color : undefined,
      color: textColor,
    }"
    :disabled
    @click="
      // Edge系だとdisabledなbuttonでも@clickが発火するようなので回避
      if (!disabled) {
        playAnimation();
        $emit('buttonClick');
      }
    "
  >
    {{ text }}
  </button>
</template>

<style scoped>
.search-button {
  background-color: var(--color-text-background);
  border: solid 0.1em #ffffff33;
  border-left-width: 0.2em;
  border-radius: 10em;
  color: var(--color-text);
  filter: drop-shadow(-0.25em 0 0.25em var(--color-drop-shadow))
    drop-shadow(0.25em 0.5em 0.5em var(--color-drop-shadow));
  cursor: pointer;
  font-size: 1.6rem;
  font-weight: 500;
  font-family: inherit;
  padding: 0.5em 1.1em 0.5em 1em;
  position: relative;
  transition:
    transform 0.5s,
    opacity 0.2s;
}
.search-button.filled {
  background-color: var(--color-filled-button-default);
}
.search-button:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.search-button::before {
  content: "";
  background-color: var(--color-button-overlay);
  border-radius: 10em;
  inset: -0.1em -0.1em -0.1em -0.2em;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  transition: opacity 0.2s;
}

.search-button:not(:disabled):hover::before {
  opacity: 16%;
}

.search-button:not(:disabled):active::before {
  opacity: 24%;
}

.search-button:not(:disabled):focus-visible {
  outline: 0.4em auto -webkit-focus-ring-color;
}

.clicked {
  animation: 0.1s ease-out scaling;
}

@keyframes scaling {
  from {
    transform: scale(1);
  }

  66% {
    transform: scale(0.85);
  }

  to {
    transform: scale(1);
  }
}
</style>
