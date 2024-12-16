<script setup lang="ts">
import { computed } from "vue";
import SearchButton from "./SearchButton.vue";

/*
例えばmax=5, width=7の場合は以下のように表示される。
---[1]2.5
--1[2]345
-12[3]45-
123[4]5--
1.4[5]----
*/

const { max, width } = defineProps<{
  color: string;
  max: number;
  /**
   * buttonの横幅を1とした場合の全体の横幅。
   * 7以上の奇数。
   */
  width: number;
}>();
if (width < 7 || width - 5 !== ((width - 5) >> 1) << 1) {
  throw new Error("widthは7以上の奇数にする必要があります。");
}
const wingWidth = computed(() => (width - 5) / 2);

const current = defineModel<number>({ default: 1 });
const changePage = (page: number) => {
  if (page !== current.value) {
    current.value = page;
  }
};

const shouldVisibleEllipsisBefore = computed(
  () => current.value >= wingWidth.value + 4
);
const shouldVisibleEllipsisAfter = computed(
  () => current.value <= max - wingWidth.value - 3
);
</script>

<template>
  <div class="page-button flex">
    <div :class="{ dummy: current - wingWidth < 3 }">
      <SearchButton text="1" :color filled @button-click="changePage(1)" />
    </div>
    <div
      :class="{
        dummy: shouldVisibleEllipsisBefore || current - wingWidth < 2,
      }"
    >
      <SearchButton
        :text="(current - wingWidth - 1).toString()"
        :color
        filled
        @button-click="changePage(current - wingWidth - 1)"
      />
      <div v-if="shouldVisibleEllipsisBefore" class="display-text">…</div>
    </div>
    <div
      v-for="deltaPageNumber in wingWidth"
      :class="{
        dummy: current - wingWidth + deltaPageNumber < 2,
      }"
    >
      <SearchButton
        :text="(current - wingWidth + deltaPageNumber - 1).toString()"
        :color
        filled
        @button-click="changePage(current - wingWidth + deltaPageNumber - 1)"
      />
    </div>
    <SearchButton :text="current.toString()" :color />
    <div
      v-for="deltaPageNumber in wingWidth"
      :class="{
        dummy: current + deltaPageNumber > max,
      }"
    >
      <SearchButton
        :text="(current + deltaPageNumber).toString()"
        :color
        filled
        @button-click="changePage(current + deltaPageNumber)"
      />
    </div>
    <div
      :class="{
        dummy: shouldVisibleEllipsisAfter || current + wingWidth + 1 > max,
      }"
    >
      <SearchButton
        :text="(current + wingWidth + 1).toString()"
        :color
        filled
        @button-click="changePage(current + wingWidth + 1)"
      />
      <div v-if="shouldVisibleEllipsisAfter" class="display-text">…</div>
    </div>
    <div :class="{ dummy: current + wingWidth >= max - 1 }">
      <SearchButton
        :text="max.toString()"
        :color
        filled
        @button-click="changePage(max)"
      />
    </div>
  </div>
</template>

<style scoped>
.page-button {
  user-select: none;
}
.dummy {
  contain: content;
  visibility: hidden;
}
.display-text {
  inset: 50% auto auto 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  visibility: visible;
  user-select: none;
}
</style>
