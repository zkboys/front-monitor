import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import frontMonitor from '../../packages/core/src';
import performance from '../../packages/performance/src';
import recordscreen from '../../packages/recordscreen/src';

// import frontMonitor from '@front-monitor/core';
// import performance from '@front-monitor/performance';
// import recordscreen from '@front-monitor/recordscreen';

Vue.use(frontMonitor, {
  dsn: 'http://localhost:8080/reportData',
  apikey: 'abcd',
  silentWhiteScreen: true,
  skeletonProject: true,
  reportOnlyOnce: true,
  userId: '123',
  handleHttpStatus(data) {
    console.log('data', data);
    let { url, response } = data;
    // code为200，接口正常，反之亦然
    let { code } = typeof response === 'string' ? JSON.parse(response) : response;
    if (url.includes('/getErrorList')) {
      return code === 200 ? true : false;
    } else {
      return true;
    }
  },
});
frontMonitor.use(performance);
frontMonitor.use(recordscreen, { recordScreentime: 15 });

Vue.use(ElementUI, { size: 'mini' });
Vue.config.productionTip = false;

setTimeout(() => {
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app');
}, 2000);
