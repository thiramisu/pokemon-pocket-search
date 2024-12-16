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
        short_name: "PP Search",
        description: "ポケポケのカードを検索できます。",
        start_url: "/",
        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
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
