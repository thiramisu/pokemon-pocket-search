import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import chokidar from "chokidar";
import { VitePWA } from "vite-plugin-pwa";
import { processJSON } from "./src/services/dataProcessing";

// https://vite.dev/config/
export default defineConfig({
  build: {
    // GitHub Pages用
    outDir: "docs",
  },
  server: {
    // ブラウザを自動で開く
    open: true,
    watch: {
      // 自動生成ファイル
      ignored: ["**/generated/**"],
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "apple-touch-icon.png",
        "arrow_back_ios_new_wght100.svg",
        "arrow_forward_ios_wght100.svg",
        "dark_mode.svg",
        "favicon-96x96.png",
        "favicon.ico",
        "favicon.svg",
        "fullscreen_portrait.svg",
        "light_mode.svg",
        "tune.svg",
      ],
      injectRegister: "auto",
      manifest: {
        name: "ポケポケ カード検索",
        lang: "ja",
        short_name: "PP Search",
        description:
          "ワザの合計エネとかでポケポケのカードを検索できるアプリです。",
        icons: [
          {
            src: "./web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "./web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "./screenshots/wide/1.png",
            sizes: "1441x1000",
            form_factor: "wide",
          },
          {
            src: "./screenshots/narrow/1.png",
            sizes: "662x1000",
            form_factor: "narrow",
          },
        ],
        theme_color: "#81e9b0",
        background_color: "#ff8585",
        display: "standalone",
      },
    }),
    {
      name: "auto-process-json",
      buildStart() {
        processJSON();
      },
      configureServer() {
        const cardDataPath = path.resolve(__dirname, "data/manual/cards.json");
        // chokidarで監視
        const watcher = chokidar.watch(cardDataPath, {
          persistent: true,
        });
        watcher.on("change", () => {
          processJSON();
        });
      },
    },
  ],
});
