<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import SearchButton from "./SearchButton.vue";
import { tsvConverterHeaderOverwrites } from "../data/types";
import CommonDialog from "./CommonDialog.vue";

const { t } = useI18n();
const input =
  ref(`ID	パック	コレクションナンバー	名前	ex	HP	タイプ	レアリティ	!進化	弱点	にげる
130	ミュウツー	130	ラルトス	FALSE	60	超	1	0	悪	1
131	ミュウツー	131	キルリア	FALSE	80	超	2	1	悪	1
132	ミュウツー	132	サーナイト	FALSE	110	超	3	2	悪	2`);
const output = ref(t("tsvc.message.result-placeholder"));

const propertyTypePrefix = {
  "?": Boolean,
  "+": true,
  "=": Number,
  "'": String,
  "!": null,
} as const;
type PropertyTypePrefix = keyof typeof propertyTypePrefix;
const getProperyPrefix = (data: string) => {
  return data === "TRUE"
    ? "?"
    : data === "FALSE"
      ? "+"
      : /^[0-9.,]+$/.test(data)
        ? "="
        : data !== ""
          ? "'"
          : "!";
};

const isMinifiedJSON = ref(false);
const tsvConverterHeaderOverwrite = ref<string | undefined>();

const methods = {
  convert() {
    const [header, ...rows] = input.value.split("\n");
    const getFirstData = (() => {
      if (rows[1] === undefined) {
        throw new Error("no data");
      }
      const firstRowData = rows[1].split("\t");
      return () => firstRowData;
    })();
    const properties = (tsvConverterHeaderOverwrite.value ?? header)
      .split("\t")
      .map((property, i) => {
        const specifiedPrefix = property[0] as PropertyTypePrefix;
        const specifiedType = propertyTypePrefix.hasOwnProperty(specifiedPrefix)
          ? propertyTypePrefix[specifiedPrefix]
          : undefined;
        return {
          name: specifiedType !== undefined ? property.slice(1) : property,
          typePrefix:
            specifiedType !== undefined
              ? specifiedPrefix
              : getProperyPrefix(getFirstData()[i]),
        };
      });
    output.value = JSON.stringify(
      rows.map((row) => {
        const dataObject: Record<string, any> = {};
        let i = 0;
        for (const data of row.split("\t")) {
          const property = properties[i++];
          switch (property.typePrefix) {
            // boolean (常に記録)
            case "?":
              dataObject[property.name] = data === "TRUE";
              break;
            // boolean (trueだけ記録)
            case "+":
              if (data === "TRUE") {
                dataObject[property.name] = true;
              }
              break;
            // string (空文字列以外記録)
            case "'":
              if (data !== "") {
                dataObject[property.name] = data;
              }
              break;
            // number (変換失敗以外記録)
            case "=":
              const value = parseFloat(data);
              if (!isNaN(value)) {
                dataObject[property.name] = value;
              }
              break;
            // 常に無視
            case "!":
              break;
          }
        }
        return dataObject;
      }),
      undefined,
      isMinifiedJSON.value ? undefined : 2
    ).replace(/\\\\n/g, "\\n");
  },
};
</script>

<template>
  <CommonDialog class="tsv-converter-dialog">
    <template #title>{{ t("tsvc.message.title") }}</template>
    <template #subtitle>{{ t("tsvc.message.sub-title") }}</template>
    <template #default>
      <textarea v-model="input" class="input-area" autofocus></textarea>
      <div class="flex items-center">
        {{ t("tsvc.label.current-header-preset") }}:<select
          v-model="tsvConverterHeaderOverwrite"
        >
          <option :value="undefined">
            {{ t("tsvc.ui.dont-use-header-preset") }}
          </option>
          <option
            v-for="[k, value] of Object.entries(tsvConverterHeaderOverwrites)"
            :value
          >
            {{ k }}
          </option>
        </select>
        <SearchButton
          name="converter"
          :text="t('tsvc.ui.convert')"
          filled
          @button-click="methods.convert()"
        /><label
          ><input type="checkbox" v-model="isMinifiedJSON" />{{
            t("tsvc.label.dont-format")
          }}</label
        >
      </div>
      <textarea v-model="output" readonly></textarea>
      <h2>{{ t("tsvc.p.features-h") }}</h2>
      {{ t("tsvc.p.typed-header1") }}<br />
      {{ t("tsvc.p.typed-header2") }}<br />
      {{ t("tsvc.p.typed-header3") }}
      <table>
        <thead>
          <tr>
            <th>{{ t("tsvc.label.data-type-head") }}</th>
            <th>{{ t("tsvc.label.data-type-type") }}</th>
            <th>{{ t("tsvc.label.data-type-ignore") }}</th>
            <th>{{ t("tsvc.label.data-type-algorithm") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>+</td>
            <td>{{ t("tsvc.data-type.boolean") }}</td>
            <td>FALSE</td>
            <td>FALSE</td>
          </tr>
          <tr>
            <td>?</td>
            <td>{{ t("tsvc.data-type.boolean") }}</td>
            <td>-</td>
            <td>TRUE</td>
          </tr>
          <tr>
            <td>=</td>
            <td>{{ t("tsvc.data-type.number") }}</td>
            <td>{{ t("tsvc.message.conversion-failed") }}</td>
            <td>{{ t("tsvc.message.consisted-as-number") }}</td>
          </tr>
          <tr>
            <td>!</td>
            <td>-</td>
            <td>{{ t("tsvc.message.ignore-everything") }}</td>
            <td>{{ t("tsvc.message.empty") }}</td>
          </tr>
          <tr>
            <td>'</td>
            <td>{{ t("tsvc.data-type.string") }}</td>
            <td>{{ t("tsvc.message.empty-string") }}</td>
            <td>{{ t("tsvc.message.none-of-the-above") }}</td>
          </tr>
        </tbody>
      </table>
      {{ $t("tsvc.p.header-mode") }}
      <table>
        <thead>
          <tr>
            <th>{{ t("tsvc.label.header-mode-name") }}</th>
            <th>{{ t("tsvc.label.header-mode-contents") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="[k, v] of Object.entries(tsvConverterHeaderOverwrites)">
            <th>{{ k }}</th>
            <td>{{ v }}</td>
          </tr>
        </tbody>
      </table>
      {{ $t("tsvc.p.break") }}
    </template>
  </CommonDialog>
</template>

<style scoped lang="css">
.tsv-converter-dialog {
  text-align: center;
}
table {
  border: solid 1px var(--color-text);
  margin: 0.6em;
  padding: 0.6em;
}
tbody > tr {
  position: relative;
}
tbody > tr::after {
  content: "";
  border-top: solid 0.1em var(--color-text);
  inset: 0;
  opacity: 80%;
  position: absolute;
}
th,
td {
  padding: 0.1em 0.5em 0 0.5em;
}

textarea {
  height: 5em;
  width: 100%;
}
</style>
