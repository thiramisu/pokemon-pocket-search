import { createApp } from "vue";
import "./css/style.css";
import App from "./App.vue";
import { useTranslation } from "./composables/translation";

createApp(App).use(useTranslation().i18n).mount("#app");
