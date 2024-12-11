import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import chokidar from "chokidar";
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
