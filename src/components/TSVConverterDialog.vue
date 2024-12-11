<script setup lang="ts">
import { ref } from "vue";
import SearchButton from "./SearchButton.vue";
import { tsvConverterHeaderOverwrites } from "../data/types";
import CommonDialog from "./CommonDialog.vue";

const input =
  ref(`ID	パック	コレクションナンバー	名前	ex	HP	タイプ	レアリティ	!進化	弱点	にげる
130	ミュウツー	130	ラルトス	FALSE	60	超	1	0	悪	1
131	ミュウツー	131	キルリア	FALSE	80	超	2	1	悪	1
132	ミュウツー	132	サーナイト	FALSE	110	超	3	2	悪	2`);
const output = ref("変換結果がここに表示されます。");

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
      : /(?:[0-9.,]+)/.test(data)
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
  <CommonDialog>
    <template #title>TSV変換器</template>
    <template #subtitle>tsv形式 => json形式 へ変換</template>
    <template #default>
      <textarea v-model="input" class="input-area" autofocus></textarea>
      <div class="flex items-center">
        ヘッダーの強制:<select v-model="tsvConverterHeaderOverwrite">
          <option :value="undefined">なし</option>
          <option
            v-for="[k, value] of Object.entries(tsvConverterHeaderOverwrites)"
            :value
          >
            {{ k }}
          </option>
        </select>
        <SearchButton
          name="converter"
          text="変換"
          filled
          @button-click="methods.convert()"
        /><label
          ><input
            type="checkbox"
            v-model="isMinifiedJSON"
          />見た目を整えない</label
        >
      </div>
      <textarea v-model="output" readonly></textarea>
      <h2>機能など</h2>
      データのタイプ（文字列、数値、etc...）は2番目のデータを元に自動決定されますが、手動指定もできます。<br />
      その場合は、カラム名の先頭に文字を加えて（'名前、=レアリティ、などとして）ください。<br />
      対応している先頭文字は以下の通りです。
      <table>
        <thead>
          <tr>
            <th>先頭文字</th>
            <th>データ種類</th>
            <th>無視するもの</th>
            <th>自動決定の基準（2番目のデータが…）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>+</td>
            <td>真偽値</td>
            <td>FALSE</td>
            <td>FALSE</td>
          </tr>
          <tr>
            <td>?</td>
            <td>真偽値</td>
            <td>-</td>
            <td>TRUE</td>
          </tr>
          <tr>
            <td>=</td>
            <td>数値</td>
            <td>変換失敗したもの</td>
            <td>0-9、カンマ(,)、ピリオド(.)のみで構成されている</td>
          </tr>
          <tr>
            <td>!</td>
            <td>-</td>
            <td>全て無視</td>
            <td>空</td>
          </tr>
          <tr>
            <td>'</td>
            <td>文字列</td>
            <td>空文字列</td>
            <td>上記のいずれでもない</td>
          </tr>
        </tbody>
      </table>
      ヘッダーの強制は以下のモードがあります。
      <table>
        <thead>
          <tr>
            <th>名前</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="[k, v] of Object.entries(tsvConverterHeaderOverwrites)">
            <th>{{ k }}</th>
            <td>{{ v }}</td>
          </tr>
        </tbody>
      </table>
      また、データの途中に改行が含まれる場合は変換に失敗します。かわりに"\n"を使用してください。
    </template>
  </CommonDialog>
</template>

<style scoped lang="css">
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
