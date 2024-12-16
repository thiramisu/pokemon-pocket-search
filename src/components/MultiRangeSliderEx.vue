<script setup lang="ts">
import { computed, Ref, ref, watch } from "vue";

const {
  min = 0,
  max,
  step = 1,
  preventWheel = false,
  caption = "auto",
  label = "mainTickAndEndpoints",
  labels,
  minCaption,
  maxCaption,
  rangeMargin,
  subTickInterval = 1,
  mainTickOffset = 0,
} = defineProps<{
  /** 入力可能な最小値。 */
  min?: number;
  /** 入力可能な最大値。 */
  max?: number;
  step?: number;
  /** マウスホイールでの操作を許可しないか。 */
  preventWheel?: boolean;
  /** ルーラーの表示位置。 */
  ruler?: boolean;
  /** 現在値の表示タイミング。"auto"ならドラッグ中のみ表示。 */
  caption?: "auto" | "none" | "always" | "changed";
  /** 現在値が最小値の場合にキャプションに表示する内容。 */
  minCaption?: string;
  /** 現在値が最大値の場合にキャプションに表示する内容。 */
  maxCaption?: string;
  // ラベルの表示位置
  label?: "all" | "mainTickAndEndpoints" | "endpoints";
  // ラベルの直接指定
  labels?: (string | undefined)[];
  /** 最小の選択範囲幅。 */
  rangeMargin?: number;
  /** 大きい目盛りはいくつ置きに表示するか。 */
  subTickInterval?: number;
  /** 大きい目盛りを小さな目盛りいくつ分ずらして表示するか。 */
  mainTickOffset?: number;
}>();

type InputData = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
};
const emit = defineEmits<{
  input: [data: InputData];
}>();

if (max !== undefined && max < min) {
  throw new Error("Invalid props min or max");
}
const labelsComputed = computed(() => {
  return (
    labels ??
    (label === "endpoints"
      ? [min, maxComputed.value]
      : Array.from({ length: ruleCount.value }, (_, i) =>
          i !== 0 &&
          i !== ruleCount.value - 1 &&
          label === "mainTickAndEndpoints" &&
          (i - mainTickOffset) % subTickInterval
            ? undefined
            : min + step * i
        ))
  );
});
const maxComputed = computed(
  () => max ?? (labels !== undefined ? labels.length - 1 : 100)
);

const rangeMarginValue = ref(
  (() => {
    let _rangeMargin = rangeMargin ?? step;
    const m = _rangeMargin % step;
    if (m !== 0) {
      _rangeMargin = _rangeMargin + step - m;
    }
    return _rangeMargin;
  })()
);

const valueMin = defineModel<number>("minValue", {
  default: NaN,
  set(valueMin: number) {
    return Math.min(
      Math.max(valueMin, min),
      valueMax.value - rangeMarginValue.value
    );
  },
});

const valueMax = defineModel<number>("maxValue", {
  default: NaN,
  set(valueMax: number) {
    return Math.max(
      Math.min(valueMax, maxComputed.value),
      valueMin.value + rangeMarginValue.value
    );
  },
});
// definePropsはトランスパイル時にrefに展開されるため、初期化のタイミングをずらす必要がある
valueMin.value = isNaN(valueMin.value)
  ? labels !== undefined
    ? 1
    : 25
  : Math.max(valueMin.value, min);
valueMax.value = isNaN(valueMax.value)
  ? labels !== undefined
    ? labels.length - 2
    : 75
  : Math.min(valueMax.value, maxComputed.value);

const ruleCount = computed(() => {
  return Math.round((maxComputed.value - min) / step) + 1;
});
const barLeftWidth = computed(() => {
  let per = ((valueMin.value - min) / (maxComputed.value - min)) * 100;
  return per;
});
const barRightWidth = computed(() => {
  let per = 100 - ((valueMax.value - min) / (maxComputed.value - min)) * 100;
  return per;
});
const barMinVal = computed(() => {
  let fixed = 0;
  if (step.toString().includes(".")) {
    fixed = 2;
  }
  return valueMin.value.toFixed(fixed);
});
const barMaxVal = computed(() => {
  let fixed = 0;
  if (step.toString().includes(".")) {
    fixed = 2;
  }
  return valueMax.value.toFixed(fixed);
});

const isMinThumbActivated = ref(false);
const isMaxThumbActivated = ref(false);
const bar = ref<HTMLElement>();
const onThumbMousedown = (
  e: MouseEvent | TouchEvent,
  thumbKind: "min" | "max"
) => {
  const valueRef = thumbKind === "min" ? valueMin : valueMax;
  const barBox = bar.value!.getBoundingClientRect();
  const isThumbActivated =
    thumbKind === "min" ? isMinThumbActivated : isMaxThumbActivated;
  isThumbActivated.value = true;

  const changeValue = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const clientX = (e instanceof TouchEvent ? e.touches[0] : e).clientX;
    const per = (clientX - barBox.left) / barBox.width;
    valueRef.value =
      min + Math.round(((maxComputed.value - min) * per) / step) * step;
  };
  changeValue(e);
  document.addEventListener("mousemove", changeValue);
  document.addEventListener("touchmove", changeValue);

  const removeThumbEvents = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    document.removeEventListener("mousemove", changeValue);
    document.removeEventListener("touchmove", changeValue);
    document.removeEventListener("mouseup", removeThumbEvents);
    document.removeEventListener("touchend", removeThumbEvents);
    isThumbActivated.value = false;
  };
  document.addEventListener("mouseup", removeThumbEvents);
  document.addEventListener("touchend", removeThumbEvents);
};

const onInputChange = (e: Event, valueRef: Ref<number, number>) => {
  if (!(e.target instanceof HTMLInputElement)) {
    throw new Error("!(e.target instanceof HTMLInputElement)");
  }
  const beforeValue = valueRef.value;
  valueRef.value = e.target.valueAsNumber;
  // 不正な数値だった場合
  if (beforeValue === valueRef.value) {
    e.target.valueAsNumber = valueRef.value;
    return;
  }
};

const methods = {
  onInnerBarLeftClick() {
    valueMin.value += step;
  },
  onInnerBarRightClick() {
    valueMax.value -= step;
  },
  onInputMinChange(e: Event) {
    onInputChange(e, valueMin);
  },
  onInputMaxChange(e: Event) {
    onInputChange(e, valueMax);
  },
  onLeftThumbMousedown(e: MouseEvent | TouchEvent) {
    onThumbMousedown(e, "min");
  },
  onRightThumbMousedown(e: MouseEvent | TouchEvent) {
    onThumbMousedown(e, "max");
  },
  onMouseWheel(e: WheelEvent) {
    if (preventWheel) {
      return;
    }
    if (!e.shiftKey && !e.ctrlKey) {
      return;
    }
    e.preventDefault();

    const val = e.deltaY < 0 ? -step : step;
    if (e.shiftKey && e.ctrlKey) {
      if (
        valueMin.value + val >= min &&
        valueMax.value + val <= maxComputed.value
      ) {
        valueMin.value = valueMin.value + val;
        valueMax.value = valueMax.value + val;
      }
    } else if (e.ctrlKey) {
      valueMax.value += val;
    } else if (e.shiftKey) {
      valueMin.value += val;
    }
  },
  triggerInput() {
    const fixed = step.toString().includes(".") ? 2 : 0;

    emit("input", {
      min,
      max: maxComputed.value,
      minValue: parseFloat(valueMin.value.toFixed(fixed)),
      maxValue: parseFloat(valueMax.value.toFixed(fixed)),
    });
  },
};

watch(valueMin, () => {
  methods.triggerInput();
});
watch(valueMax, () => {
  methods.triggerInput();
});
</script>

<template>
  <div
    class="multi-range-slider"
    :style="{
      '--rule-count': ruleCount,
      '--sub-tick-interval': subTickInterval,
      '--main-tick-offset': mainTickOffset,
      '--sub-ruler-display': subTickInterval === 1 ? 'none' : 'unset',
    }"
    @mousewheel.stop="methods.onMouseWheel"
  >
    <div class="bar-hitbox">
      <div v-if="label" class="labels">
        <div v-for="label of labelsComputed" :key="label" class="label">
          {{ label }}
        </div>
      </div>
      <div
        class="bar-outer-outer"
        @mousedown.prevent="methods.onLeftThumbMousedown"
        @touchstart.prevent="methods.onLeftThumbMousedown"
      ></div>
      <div class="bar" ref="bar">
        <div
          :class="{
            'bar-outer': true,
            'bar-left': true,
            activated: isMinThumbActivated,
          }"
          :style="{ width: barLeftWidth + '%' }"
          @mousedown.prevent="methods.onLeftThumbMousedown"
          @touchstart.prevent="methods.onLeftThumbMousedown"
        >
          <input
            class="input-type-range"
            type="range"
            :min
            :max="maxComputed"
            :step
            :value="valueMin"
            @input.stop.prevent="methods.onInputMinChange"
          />
          <div class="thumb thumb-left"></div>
          <div
            :class="{
              caption: true,
              'force-visible':
                caption === 'always' ||
                (caption === 'changed' && valueMin !== min),
            }"
          >
            {{ minCaption ?? barMinVal }}
          </div>
        </div>
        <div class="bar-inner">
          <div
            class="bar-inner-left"
            @mousedown.prevent="methods.onLeftThumbMousedown"
            @touchstart.prevent="methods.onLeftThumbMousedown"
          ></div>
          <div
            class="bar-inner-right"
            @mousedown.prevent="methods.onRightThumbMousedown"
            @touchstart.prevent="methods.onRightThumbMousedown"
          ></div>
        </div>
        <div
          :class="{
            'bar-outer': true,
            'bar-right': true,
            activated: isMaxThumbActivated,
          }"
          :style="{ width: barRightWidth + '%' }"
          @mousedown.prevent="methods.onRightThumbMousedown"
          @touchstart.prevent="methods.onRightThumbMousedown"
        >
          <input
            class="input-type-range"
            type="range"
            :min
            :max="maxComputed"
            :step
            :value="valueMax"
            @input.stop.prevent="methods.onInputMaxChange"
          />
          <div class="thumb thumb-right"></div>
          <div
            :class="{
              caption: true,
              'force-visible':
                caption === 'always' ||
                (caption === 'changed' && valueMax !== maxComputed),
            }"
          >
            {{ maxCaption ?? barMaxVal }}
          </div>
        </div>
      </div>
      <div
        class="bar-outer-outer"
        @mousedown.prevent="methods.onRightThumbMousedown"
        @touchstart.prevent="methods.onRightThumbMousedown"
      ></div>
      <div v-if="ruler" class="ruler"></div>
      <div class="current-range-container">
        <span class="current-range">
          <span class="current-min">{{ minValue }}</span>
          - <span class="current-max">{{ maxValue }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.multi-range-slider {
  box-shadow: inset 0.1em 0.1em 0.4em black;
  contain: content;
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
  padding: 0.8em 0.8em 1.6em 0.8em;
  -webkit-touch-callout: none;
  /* iOS Safari */
  -webkit-user-select: none;
  /* Safari */
  -khtml-user-select: none;
  /* Konqueror HTML */
  -moz-user-select: none;
  /* Old versions of Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
  user-select: none;
  /* Non-prefixed version, currently supported by Chrome, Edge,*/
}

.bar-hitbox {
  display: flex;
  height: 3.6em;
  position: relative;
}

.bar-outer-outer {
  cursor: pointer;
  width: 1.2em;
}

.bar {
  display: flex;
  flex: 1 1;
}

.bar-outer {
  cursor: pointer;
  position: relative;
  transition: width 0.2s ease-out;
}

/** 選択範囲外の見た目上の線 */
.bar-outer::before {
  content: "";
  background-color: var(--color-text);
  inset: 2.1em -0.125em 1.3em -0.125em;
  opacity: 0.08;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.2s;
}

.bar-outer:hover::before {
  opacity: 0.16;
}

.bar-outer.activated::before {
  opacity: 0.24;
}

.bar-inner {
  cursor: pointer;
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  justify-content: space-between;
  position: relative;
}
/** 選択範囲内の見た目上の線 */
.bar-inner::before {
  content: "";
  inset: 2em -0.125em 1.2em -0.125em;
  position: absolute;
  background-color: var(--color-text);
  pointer-events: none;
}

.bar-inner-left,
.bar-inner-right {
  width: 50%;
}

.input-type-range {
  /* TODO: visually hidden に置き換え */
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
}

.thumb {
  position: absolute;
}
/** つまみ */
.thumb::before {
  content: "";
  aspect-ratio: 1 / 1;
  background-color: var(--color-text);
  border-radius: 50%;
  box-shadow: 0 0 0.3em var(--color-background);
  cursor: pointer;
  inset: 1.6em -0.6em auto -0.6em;
  position: absolute;
  transition: transform 0.2s;
  z-index: 1;
}
.bar-outer.activated .thumb::before,
.input-type-range:focus-visible + .thumb::before {
  transform: scale(0.5);
}
.thumb-left {
  right: 0.55em;
}
.thumb-right {
  left: 0.55em;
}

/** つまみ上の現在値 */
.caption {
  background-color: var(--color-range-slider-caption-background);
  border-radius: 100em;
  bottom: 2.5em;
  box-shadow: 0 0 0.5em var(--color-drop-shadow);
  color: var(--color-text);
  display: table-cell;
  font-size: 85%;
  font-weight: bold;
  height: 2.2em;
  line-height: 2.2em;
  min-width: 2.2em;
  opacity: 0;
  overflow: visible;
  padding: 0 0.8em;
  position: absolute;
  text-align: center;
  transform: translateX(-50%);
  transition:
    width 0.2s ease-in,
    opacity 0.2s ease-out;
  white-space: nowrap;
}
.caption.force-visible,
.activated .caption {
  opacity: 1;
}
.bar-left > .caption {
  left: 100%;
}

.ruler {
  inset: 1.2em 1.2em 1.6em 1.2em;
  pointer-events: none;
  position: absolute;
}
/** 小目盛り */
.ruler::before {
  content: "";
  background: repeating-linear-gradient(
    to right,
    var(--color-text) 0,
    var(--color-text) 0.1em,
    transparent 0.1em,
    transparent calc((100% - 0.1em) / (var(--rule-count) - 1))
  );
  font-size: 62.5%;
  inset: 50% -0.1em 0 -0.1em;
  display: var(--sub-ruler-display);
  position: absolute;
}
/** 大目盛り */
.ruler::after {
  content: "";
  background: linear-gradient(
    to right,
    var(--color-text) 0.4em,
    transparent 0.4em
  );
  /* 
    %指定の場合以下の計算式になる。
    (コンテナーの幅 - 画像の幅) * (position x%) = (x オフセット値)
  */
  background-position-x: calc(
    (100% - 0.4em) / (var(--rule-count) - 1 - var(--sub-tick-interval)) *
      var(--main-tick-offset)
  );
  background-size: calc(
      (100% - 0.4em) / (var(--rule-count) - 1) * var(--sub-tick-interval)
    )
    100%;
  font-size: 62.5%;
  inset: -0.1em -0.2em 0 -0.2em;
  position: absolute;
}

.labels {
  display: flex;
  inset: -0.2em calc(1.2em - (100% - 2.4em) / (var(--rule-count) - 1) / 2);
  justify-content: space-between;
  position: absolute;
  pointer-events: none;
}

.label {
  flex: 1 1 0;
  font-size: 80%;
  font-weight: bold;
  text-align: center;
  width: 3em;
}

.current-range-container {
  inset: 2.4em 0 0 0;
  position: absolute;
  text-align: center;
  pointer-events: none;
}
.current-range {
  padding: 0 0.3em;
  position: relative;
}
.current-min {
  font-weight: bold;
  inset: 0 100% 0 auto;
  position: absolute;
}
.current-max {
  font-weight: bold;
  inset: 0 auto 0 100%;
  position: absolute;
}
</style>
