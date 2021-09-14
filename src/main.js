import Vue from "vue";
import LoadScript from "vue-plugin-load-script";
import App from "./App.vue";

import { initContract } from "./utils";

Vue.use(LoadScript);
Vue.config.productionTip = false;
Vue.loadScript(
  "https://cdn.blockpass.org/widget/scripts/release/3.0.2/blockpass-kyc-connect.prod.js"
);

window.nearInitPromise = initContract().then(() => {
  new Vue({
    render: (h) => h(App),
  }).$mount("#app");
});
