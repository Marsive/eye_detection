import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import dataV from '@jiaminghi/data-view'

import "swiper/swiper.min.css"
import * as echarts from 'echarts';
import "@/utils/echarts-wordcloud.min.js"
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import DataV from '@jiaminghi/data-view'

Vue.use(dataV)
Vue.use(DataV)
Vue.use(ElementUI);
Vue.config.productionTip = false

Vue.prototype.$echarts = echarts
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')