<script setup lang="ts">
import { ref, watch } from "vue";

const visible = defineModel({ default: false });

const commonDialog = ref<HTMLDialogElement>();

// <dialog :open="visible"> で開くと Escキーが効かないため
watch(visible, (newValue) => {
  if (newValue) {
    commonDialog.value!.showModal();
  } else {
    commonDialog.value!.close();
  }
});
</script>

<template>
  <dialog
    ref="commonDialog"
    @click.self="visible = false"
    @close="visible = false"
  >
    <!-- click.self の範囲を ::backdrop のみに限定するため、内側にarticleを置く -->
    <article class="dialog-container">
      <h1>
        <slot name="title"></slot>
        <div class="subtitle"><slot name="subtitle"></slot></div>
      </h1>
      <button
        title="ダイアログを閉じる"
        aria-label="ダイアログを閉じる"
        class="icon-button close-button"
        @click="visible = false"
      >
        ×
      </button>
      <slot></slot>
    </article>
  </dialog>
</template>

<style scoped src="../css/icon-button.css"></style>

<style scoped>
dialog {
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1.6em;
  padding: 0;
}
@media (width <= 768px) {
  dialog {
    margin: 0;
    min-height: 100dvh;
    min-width: 100dvw;
  }
}
.dialog-container {
  align-items: center;
  background-color: var(--color-dialog-background);
  border: solid 1.2em var(--color-dialog-border);
  border-radius: 3em;
  box-shadow: 0 0 0.2em var(--color-drop-shadow);
  display: flex;
  flex-direction: column;
  max-width: 80em;
  min-width: 40em;
  padding: 1.8em;
  position: relative;
}
@media (width <= 768px) {
  .dialog-container {
    border-left-width: 0.3em;
    border-right-width: 0.3em;
    max-width: unset;
    min-width: unset;
    padding-bottom: 7.8em;
  }
  .close-button {
    font-size: 5rem;
    z-index: 1;
  }
}
h1 {
  margin: 0;
  padding: 0 0 0.6em 0;
}
.subtitle {
  font-size: 40%;
  font-weight: normal;
}
</style>
