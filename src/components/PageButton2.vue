<script setup lang="ts">
import SearchButton from "./SearchButton.vue";

const { max } = defineProps<{
  color: string;
  max: number;
}>();
const current = defineModel<number>({ default: 1 });
const changePage = (page: number) => {
  if (page !== current.value) {
    current.value = page;
  }
};
</script>

<template>
  <div class="page-button">
    <SearchButton
      text="＜"
      :color
      :disabled="current === 1"
      @button-click="current--"
    />
    <SearchButton
      v-for="page in max"
      :text="page.toString()"
      :color
      :filled="page === current"
      @button-click="changePage(page)"
    />
    <SearchButton
      text="＞"
      :color
      :disabled="current === max"
      @button-click="current++"
    />
  </div>
</template>

<style scoped></style>
