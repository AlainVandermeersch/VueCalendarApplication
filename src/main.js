import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/index'
import vuetify from './plugins/vuetify'
import VueTextareaAutosize from 'vue-textarea-autosize'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
Vue.use(VueTextareaAutosize)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
