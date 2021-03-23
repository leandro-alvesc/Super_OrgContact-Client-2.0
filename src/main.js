import Vue from 'vue';
import VueGoogleCharts from 'vue-google-charts';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;
Vue.use(VueGoogleCharts);

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
