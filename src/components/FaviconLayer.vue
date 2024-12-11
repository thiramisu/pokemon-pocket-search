<script setup lang="ts">
import { computed } from "vue";
import { Layer } from "./FaviconEditorDialog.vue";

const props = defineProps<{
  layers: Layer[];
  layerIndex: number;
  widthPerCanvas: number;
  heightPerCanvas: number;
}>();
const layer = computed(() => props.layers[props.layerIndex]);

const transform = computed(() => {
  const parentLayer = props.layers[props.layerIndex + 1];
  return parentLayer === undefined
    ? `translate(${
        (layer.value.positionPercentage.x - layer.value.widthPercentage / 2) /
        100
      }em, ${
        (layer.value.positionPercentage.y - layer.value.heightPercentage / 2) /
        100
      }em) rotate(${layer.value.rotationDeg}deg)`
    : `translate(${
        (parentLayer.widthPercentage / 2 - layer.value.widthPercentage / 2) /
        100
      }em, ${
        (parentLayer.heightPercentage / 2 - layer.value.heightPercentage / 2) /
        100
      }em) rotate(${-1 * parentLayer.rotationDeg}deg) translate(${
        (layer.value.positionPercentage.x - parentLayer.positionPercentage.x) /
        100
      }em, ${
        (layer.value.positionPercentage.y - parentLayer.positionPercentage.y) /
        100
      }em) rotate(${layer.value.rotationDeg}deg)`;
});
</script>

<template>
  <div
    :class="`border-${layer.borderWidth}`"
    :style="{
      position: 'absolute',
      backgroundColor: layer.color,
      overflow: layer.cropChildren ? 'hidden' : undefined,
      height: `${layer.heightPercentage / 100}em`,
      width: `${layer.widthPercentage / 100}em`,
      borderRadius: `${layer.borderRadiusPercentage.top.left.horizontal}% ${layer.borderRadiusPercentage.top.right.horizontal}% ${layer.borderRadiusPercentage.bottom.right.horizontal}% ${layer.borderRadiusPercentage.bottom.left.horizontal}% / ${layer.borderRadiusPercentage.top.left.vertical}% ${layer.borderRadiusPercentage.top.right.vertical}% ${layer.borderRadiusPercentage.bottom.right.vertical}% ${layer.borderRadiusPercentage.bottom.left.vertical}%`,
      transform,
      // デバッグ用
      '--layer-index': layerIndex,
    }"
  >
    <FaviconLayer
      v-if="layerIndex > 0"
      :layers
      :layer-index="layerIndex - 1"
      :width-per-canvas="widthPerCanvas * layer.widthPercentage"
      :height-per-canvas="heightPerCanvas * layer.heightPercentage"
    />
  </div>
</template>

<style scoped>
.border-normal::before {
  content: "";
}
.border-thin {
  content: "";
}
</style>
