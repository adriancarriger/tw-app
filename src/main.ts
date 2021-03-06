import Vue from 'vue';
import VueResource from 'vue-resource';

import App from '@/App.vue';
import Auth from '@/auth';
import '@/registerServiceWorker';
import router from '@/router';
import store from '@/store';
import { createProvider } from '@/vue-apollo';

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.use(Auth);

Vue.http.options.root = `${process.env.VUE_APP_SERVER_URI}`;

new Vue({
  router,
  store,
  provide: createProvider().provide(),
  render: (h) => h(App)
}).$mount('#app');
