<script setup lang="ts">
import SearchButton from "./SearchButton.vue";
import MultiRangeSlider from "./MultiRangeSliderEx.vue";
const { min, max, name } = defineProps<{
  name: string;
  min: number;
  max: number;
  step?: number;
  label?: "all" | "mainTickAndEndpoints" | "endpoints";
  labels?: (string | undefined)[];
  mainTickOffset?: number;
  subTickInterval?: number;
}>();

const minValue = defineModel<number>("minValue");
const maxValue = defineModel<number>("maxValue");
// definePropsはトランスパイル時にrefに展開されるため、初期化のタイミングをずらす必要がある
minValue.value ??= min;
maxValue.value ??= max;
</script>

<template>
  <tr
    :class="{
      changed: minValue !== min || maxValue !== max,
    }"
  >
    <th>
      {{ name }}<br />
      <SearchButton
        text="reset"
        :disabled="minValue === min && maxValue === max"
        class="action-button"
        @button-click="
          minValue = min;
          maxValue = max;
        "
      />
    </th>
    <td>
      <MultiRangeSlider
        :min="min"
        :max="max"
        v-model:min-value="minValue"
        v-model:max-value="maxValue"
        ruler
        :range-margin="0"
        :step
        caption="changed"
        :label
        :labels
        :sub-tick-interval
        :main-tick-offset
      />
    </td>
  </tr>
</template>

<style scoped src="../css/card-search.css"></style>
