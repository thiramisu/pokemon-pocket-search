<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SearchButton from "./SearchButton.vue";
import FaviconLayer from "./FaviconLayer.vue";
import CommonDialog from "./CommonDialog.vue";

defineProps<{}>();

const borderWidths = ["normal", "thin", "none"] as const;
type BorderWidth = (typeof borderWidths)[number];

const topBottom = ["top", "bottom"] as const;
const leftRight = ["left", "right"] as const;
const horizontalVertical = ["horizontal", "vertical"] as const;

export type Layer = {
  name: string;
  cropChildren: boolean;
  positionPercentage: {
    x: number;
    y: number;
  };
  widthPercentage: number;
  heightPercentage: number;
  rotationDeg: number;
  color: string;
  borderWidth: BorderWidth;
  /** layer自身の width, height に対する角の丸みの割合。 */
  borderRadiusPercentage: Record<
    (typeof topBottom)[number],
    Record<
      (typeof leftRight)[number],
      Record<(typeof horizontalVertical)[number], number>
    >
  >;
};
const usedLayerNames = computed(
  () => new Set(layers.value.map((layer) => layer.name))
);

const DEFAULT_LAYER_NAME = "新しいレイヤー";
const getNewLayer = (name?: string): Layer => ({
  name: name ?? toUniqueLayerName(DEFAULT_LAYER_NAME),
  cropChildren: true,
  positionPercentage: { x: 50, y: 50 },
  widthPercentage: 100,
  heightPercentage: 100,
  rotationDeg: 0,
  color: "#ffffff",
  borderWidth: "normal",
  borderRadiusPercentage: {
    top: {
      left: {
        horizontal: 50,
        vertical: 50,
      },
      right: {
        horizontal: 50,
        vertical: 50,
      },
    },
    bottom: {
      left: {
        horizontal: 50,
        vertical: 50,
      },
      right: {
        horizontal: 50,
        vertical: 50,
      },
    },
  },
});
// 初期化時エラー防止用ダミー
const dummyLayer = getNewLayer(DEFAULT_LAYER_NAME);

const layers = ref<Layer[]>([]);
const addLayer = () => {
  layers.value.unshift(getNewLayer());
  selectedLayerIndex.value = 0;
};

const toUniqueLayerName = (layerName: string) => {
  let i = 1;
  let newLayerName = layerName;
  while (usedLayerNames.value.has(newLayerName)) {
    newLayerName = `${layerName} #${i++}`;
  }
  return newLayerName;
};
const selectedLayerIndex = ref<number>(0);
const selectedLayer = computed(
  () => layers.value[selectedLayerIndex.value] ?? dummyLayer
);

const size = ref(128);

const canvas = ref<HTMLElement>();
const saveDialogVisible = ref(false);

const rotatePreview = () => {
  const layer = selectedLayer.value;
  [layer.widthPercentage, layer.heightPercentage] = [
    layer.heightPercentage,
    layer.widthPercentage,
  ];
  layer.rotationDeg = (layer.rotationDeg - 90) % 360;
  const radius = layer.borderRadiusPercentage;
  [
    radius.top.left.vertical,
    radius.top.right.horizontal,
    radius.bottom.right.vertical,
    radius.bottom.left.horizontal,
  ] = [
    radius.bottom.left.horizontal,
    radius.top.left.vertical,
    radius.top.right.horizontal,
    radius.bottom.right.vertical,
  ];
  [
    radius.top.left.horizontal,
    radius.top.right.vertical,
    radius.bottom.right.horizontal,
    radius.bottom.left.vertical,
  ] = [
    radius.bottom.left.vertical,
    radius.top.left.horizontal,
    radius.top.right.vertical,
    radius.bottom.right.horizontal,
  ];
};

onMounted(() => {
  addLayer();
});
</script>

<template>
  <CommonDialog>
    <CommonDialog v-model="saveDialogVisible">
      <textarea v-if="saveDialogVisible" class="result-textarea">
<div style="font-size: {{
          size
        }}px; width: 1em; aspect-ratio: 1 / 1; contain: content;">{{
          canvas!.innerHTML
            .replace("<!--v-if-->", "")
            .replace(/data-v-[^ ]+? /g, "")
        }}</div></textarea
      >
    </CommonDialog>
    <div class="favicon-editor flex items-start">
      <h1 class="title">cssでお絵描き</h1>
      <div class="left-panel">
        <div class="canvas-wrapper">
          <div class="canvas-option">
            大きさ:
            <div class="select-container">
              <select v-model="size">
                <option v-for="size of [7, 8, 9]" :value="1 << size">
                  {{ 1 << size }}px
                </option>
              </select>
            </div>
          </div>
          <div
            ref="canvas"
            class="canvas"
            :style="{
              fontSize: `${size}px`,
            }"
          >
            <FaviconLayer
              v-if="layers.length !== 0"
              :layers
              :layer-index="layers.length - 1"
              :width-per-canvas="1"
              :height-per-canvas="1"
            />
          </div>
          <SearchButton text="結果" @click="saveDialogVisible = true" />
        </div>
        <div class="layer-list">
          <div class="layer-item layer-example">
            <div class="layer-name">レイヤー</div>
            <div class="layer-details">(中心), [大きさ], 角度°</div>
          </div>
          <SearchButton
            text="+"
            title="レイヤーを追加"
            color="var(--color-filled-button-default)"
            filled
            @button-click="addLayer()"
          />
          <div
            v-for="(layer, i) of layers"
            :key="layer.name"
            class="layer-item"
            @click="selectedLayerIndex = i"
          >
            <div class="layer-name flex justify-center">
              <span
                class="layer-color"
                :style="{ backgroundColor: layer.color }"
              ></span>
              {{ layer.name }}
            </div>
            <div class="layer-details">
              ({{ layer.positionPercentage.x }},
              {{ layer.positionPercentage.y }}), [{{ layer.widthPercentage }},
              {{ layer.heightPercentage }}], {{ layer.rotationDeg }}°
            </div>
          </div>
          <div
            class="selected-layer-indicator"
            :style="{
              transform: `translateY(${8.4 + selectedLayerIndex * 4}em)`,
            }"
          ></div>
        </div>
      </div>
      <div class="layer-setting">
        <div>
          <SearchButton
            text="削除"
            :disabled="layers.length === 1"
            @button-click="
              if (selectedLayerIndex === layers.length - 1) {
                selectedLayerIndex -= 1;
              }
              layers.splice(selectedLayerIndex, 1);
            "
          />
          <SearchButton
            text="↑"
            :disabled="selectedLayerIndex === 0"
            @button-click="
              [layers[selectedLayerIndex], layers[selectedLayerIndex - 1]] = [
                layers[selectedLayerIndex - 1],
                layers[selectedLayerIndex],
              ];
              selectedLayerIndex -= 1;
            "
          />
          <SearchButton
            text="↓"
            :disabled="selectedLayerIndex === layers.length - 1"
            @button-click="
              [layers[selectedLayerIndex], layers[selectedLayerIndex + 1]] = [
                layers[selectedLayerIndex + 1],
                layers[selectedLayerIndex],
              ];
              selectedLayerIndex += 1;
            "
          />
          <SearchButton text="プレビュー回転" @button-click="rotatePreview" />
        </div>
        <div class="column items-start">
          名前
          <input type="text" v-model="selectedLayer.name" />

          <label>
            <input
              type="checkbox"
              v-model="selectedLayer.cropChildren"
            />子レイヤーを切り抜く
          </label>
          色
          <input type="color" v-model="selectedLayer.color" />
          中心 (x, y)
          <div class="flex">
            (<input
              type="number"
              v-model="selectedLayer.positionPercentage.x"
            /><span class="self-end">,</span>
            <input
              type="number"
              v-model="selectedLayer.positionPercentage.y"
            />)
          </div>
          大きさ［幅, 高さ］
          <div class="flex">
            [<input
              type="number"
              v-model="selectedLayer.widthPercentage"
            /><span class="self-end">,</span>
            <input type="number" v-model="selectedLayer.heightPercentage" />]
          </div>
          角度
          <div class="flex items-baseline">
            <input type="number" v-model="selectedLayer.rotationDeg" />deg
          </div>
          角の丸み
          <div class="border-preview-container">
            <div
              v-if="
                selectedLayer.widthPercentage !== 0 &&
                selectedLayer.heightPercentage !== 0
              "
              class="border-radius-preview"
              :style="{
                '--border-radius-top-left-horizontal':
                  selectedLayer.borderRadiusPercentage.top.left.horizontal,
                '--border-radius-top-left-vertical':
                  selectedLayer.borderRadiusPercentage.top.left.vertical,
                '--border-radius-top-right-horizontal':
                  selectedLayer.borderRadiusPercentage.top.right.horizontal,
                '--border-radius-top-right-vertical':
                  selectedLayer.borderRadiusPercentage.top.right.vertical,
                '--border-radius-bottom-right-horizontal':
                  selectedLayer.borderRadiusPercentage.bottom.right.horizontal,
                '--border-radius-bottom-right-vertical':
                  selectedLayer.borderRadiusPercentage.bottom.right.vertical,
                '--border-radius-bottom-left-horizontal':
                  selectedLayer.borderRadiusPercentage.bottom.left.horizontal,
                '--border-radius-bottom-left-vertical':
                  selectedLayer.borderRadiusPercentage.bottom.left.vertical,
                backgroundColor: selectedLayer.color,
                aspectRatio: `${selectedLayer.widthPercentage} / ${selectedLayer.heightPercentage}`,
              }"
            >
              <template v-for="topOrBottom of topBottom">
                <template v-for="leftOrRight of leftRight">
                  <template v-for="horizontalOrVertical of horizontalVertical">
                    <div
                      :class="[
                        'border-radius',
                        topOrBottom,
                        leftOrRight,
                        horizontalOrVertical,
                      ]"
                    >
                      <input
                        type="number"
                        class="border-radius-direct-input"
                        v-model="
                          selectedLayer.borderRadiusPercentage[topOrBottom][
                            leftOrRight
                          ][horizontalOrVertical]
                        "
                      />
                    </div>
                  </template>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CommonDialog>
</template>

<style lang="css" scoped src="../css/card-search.css"></style>

<style scoped>
.favicon-editor {
  color: var(--color-text);
  font-size: 1rem;
  margin: 0 5em;
  position: relative;
}
.title {
  font-size: 320%;
  inset: 0 auto auto 0;
  margin: 0 0.2em 0 0;
  padding: 0 0 0.6em 0;
  position: absolute;
  transform: rotate(-90deg) translate(-100%, -100%);
  transform-origin: top left;
}

.left-panel {
  display: flex;
  flex-wrap: wrap;
}

.canvas-wrapper {
  contain: layout;
}
.canvas-option {
  align-items: center;
  bottom: calc(100% - 100% / 7);
  display: flex;
  height: calc(100% / 7);
  position: absolute;
  right: calc(100% / 7);
}
.canvas {
  aspect-ratio: 1 / 1;
  box-shadow: 0 0 0.2em black;
  contain: content;
  height: 1em;
  margin: 0.2em;
}

.layer-list {
  align-items: center;
  align-self: stretch;
  box-shadow: inset 0 0 1em black;
  contain: content;
  display: grid;
  flex: 1 0;
  grid-auto-rows: 4em;
  line-height: 1;
  padding: 0.4em;
  user-select: none;
}
.layer-item {
  contain: layout;
  cursor: pointer;
  display: grid;
  grid-template-rows: 1.6em 1.6em 0;
  padding: 0.4em 0.4em 0.4em 1em;
  place-items: center start;

  text-align: left;
  z-index: 1;
}
.layer-item:not(.layer-example)::before {
  content: "";
  background-color: var(--color-button-overlay);
  inset: 0;
  opacity: 0;
  position: absolute;
  transition: opacity 0.2s;
}
.layer-item:not(.layer-example):hover::before,
.layer-item:not(.layer-example):focus-visible::before {
  opacity: 16%;
}
.layer-item:not(.layer-example):active::before {
  opacity: 16%;
}
.layer-example {
  contain: layout;
  cursor: initial;
  width: 100%;
}
.layer-example::before {
  content: "";
  border-bottom: solid 0.1em var(--color-text);
  inset: 0 -0.4em;
  position: absolute;
}

.selected-layer-indicator {
  background-color: var(--color-background);
  box-shadow: 0 0 1em black;
  height: 4em;
  inset: 0 0 0 0.4em;
  position: absolute;
  transition: transform 0.2s ease-out;
}
.selected-layer-indicator::before {
  content: "";
  background-color: var(--color-attention);
  inset: 0.4em auto 0.4em 0.4em;
  position: absolute;
  transition: transform 0.2s ease-out;
  width: 0.2em;
}
.layer-name {
  font-size: 160%;
}
.layer-color {
  aspect-ratio: 1 / 1;
  display: inline-block;
  height: 1em;
}
.layer-details {
  font-size: 128%;
  opacity: 0.8;
}
.layer-setting {
  font-size: 160%;
  padding: 0 0.3em;
}

.border-preview-container {
  aspect-ratio: 1 / 1;
  align-self: stretch;
}
.border-radius-preview {
  background-color: black;
  border-radius: calc(1% * var(--border-radius-top-left-horizontal))
    calc(1% * var(--border-radius-top-right-horizontal))
    calc(1% * var(--border-radius-bottom-right-horizontal))
    calc(1% * var(--border-radius-bottom-left-horizontal)) /
    calc(1% * var(--border-radius-top-left-vertical))
    calc(1% * var(--border-radius-top-right-vertical))
    calc(1% * var(--border-radius-bottom-right-vertical))
    calc(1% * var(--border-radius-bottom-left-vertical));
  contain: layout;
  height: auto;
  max-height: 20em;
  margin: 2em;
  max-width: 100%;
}

.border-radius {
  position: absolute;
}
.border-radius.top.horizontal {
  bottom: 100%;
}
.border-radius.bottom.horizontal {
  top: 100%;
}
.border-radius.right.vertical {
  left: 100%;
}
.border-radius.left.vertical {
  right: 100%;
}

.border-radius.top.left.horizontal {
  right: calc(1% * (100 - var(--border-radius-top-left-horizontal)));
}
.border-radius.top.right.horizontal {
  left: calc(1% * (100 - var(--border-radius-top-right-horizontal)));
}
.border-radius.bottom.right.horizontal {
  left: calc(1% * (100 - var(--border-radius-bottom-right-horizontal)));
}
.border-radius.bottom.left.horizontal {
  right: calc(1% * (100 - var(--border-radius-bottom-left-horizontal)));
}
.border-radius.top.left.vertical {
  bottom: calc(1% * (100 - var(--border-radius-top-left-vertical)));
}
.border-radius.top.right.vertical {
  bottom: calc(1% * (100 - var(--border-radius-top-right-vertical)));
}
.border-radius.bottom.right.vertical {
  top: calc(1% * (100 - var(--border-radius-bottom-right-vertical)));
}
.border-radius.bottom.left.vertical {
  top: calc(1% * (100 - var(--border-radius-bottom-left-vertical)));
}

.border-radius-direct-input {
  width: 4em;
}

.result-textarea {
  height: 100%;
  width: 100%;
}
</style>
