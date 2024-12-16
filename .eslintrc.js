module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    "plugin:vue/vue3-recommended",
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    semi: ["error", "always"], // 文の末尾にセミコロンを強制
    "comma-dangle": ["error", "always-multiline"], // 複数行のリストでカンマを強制
    indent: ["error", 2], // インデントを2スペースに強制
    "import/order": [
      "error",
      {
        groups: [
          ["builtin", "external"], // 外部モジュールのインポート
          "internal", // 内部モジュール（自作）のインポート
          "parent", // 親ディレクトリからのインポート
          "sibling", // 同じディレクトリのインポート
          "index", // index.js や index.ts のインポート
        ],
        "newlines-between": "always", // 各グループ間に改行を挿入
      },
    ],
    "prettier/prettier": "error", // Prettier のルールをエラーとして扱う
  },
};
