<script setup lang="ts">
import { PokemonType } from "../data/types";
import PokemonTypeMark from "./PokemonTypeMark.vue";
import { colorLess } from "../data/types";
import { Trait } from "../data/types";
import AttackEnergyOverride from "./AttackEnergyOverride.vue";

defineProps<{
  trait: Trait;
  pokemonType?: PokemonType;
}>();
</script>

<template>
  <div v-if="'名前' in trait" class="trait column items-start">
    <div class="flex items-center full-width">
      <div class="trait-energy">
        <!-- 特性 -->
        <div
          v-if="
            trait.一致エネルギー数 === undefined &&
            trait.無色エネルギー数 === undefined
          "
          class="ability-mark"
        ></div>
        <AttackEnergyOverride
          v-else-if="trait.必要エネルギー上書き !== undefined"
          :energy-override-text="trait.必要エネルギー上書き"
          size="1.1em"
        />
        <!-- ワザ -->
        <template v-else>
          <PokemonTypeMark
            v-if="pokemonType !== undefined"
            v-for="_i in trait.一致エネルギー数"
            size="1.1em"
            :pokemon-type
          />
          <PokemonTypeMark
            v-for="_i in trait.無色エネルギー数"
            size="1.1em"
            :pokemon-type="colorLess"
          />
        </template>
      </div>
      <div
        :class="{
          'trait-name': true,
          'ability-name':
            trait.一致エネルギー数 === undefined &&
            trait.無色エネルギー数 === undefined,
        }"
      >
        {{ trait.名前 }}
      </div>
      <div v-if="trait.威力 !== 0" class="trait-damage">
        {{ trait.威力 }}
        <div class="trait-damage-suffix">
          {{
            "効果" in trait
              ? trait.効果?.includes("追加")
                ? "+"
                : trait.効果?.includes("×")
                  ? "×"
                  : undefined
              : undefined
          }}
        </div>
      </div>
    </div>
    <div v-if="'効果' in trait" class="trait-effect">
      {{ trait.効果 }}
    </div>
  </div>
  <!-- トレーナーズ用 -->
  <div v-else-if="'効果' in trait" class="trait-effect">
    {{ trait.効果 }}
  </div>
</template>

<style scoped>
.ability-mark {
  background: linear-gradient(-45deg, black, red, black);
  box-shadow: inset 0 0 0.2em #00000088;
  border: solid 0.1em #cccccc;
  border-bottom-color: #333333;
  border-right-color: #333333;
  border-radius: 0.2em;
  font-weight: bold;
  height: 0.9em;
  line-height: 1.2;
  letter-spacing: 0.2em;
  position: relative;
  width: 4.8em;
}
.ability-mark::before {
  content: "特性";
  color: #f8f8f8;
  font-size: 60%;
  inset: 0;
  margin: auto;
  position: absolute;
  transform: scaleX(1.2);
}
.trait-energy {
  width: 5.2em;
}
.trait-name {
  flex: 1 1;
  font-weight: bold;
  text-align: left;
}
.ability-name {
  color: var(--color-ability-text);
}
.trait-damage {
  contain: layout;
  font-size: 120%;
  font-weight: bold;
  line-height: 1;
}
.trait-damage-suffix {
  position: absolute;
  inset: 0 0 0 100%;
  margin: auto;
}
.trait-effect {
  font-size: 80%;
  line-height: 1.2;
  text-align: start;
  white-space: pre-line; /* json内の\nを改行として表示するため */
}
</style>
