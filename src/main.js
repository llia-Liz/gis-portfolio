/**
 * Vue 应用入口文件
 * 配置 Pinia 和 Vue Router
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router/index.js'
import './router/permission.js'
import './style.css'
import App from './App.vue'

// 创建应用实例
const app = createApp(App)

// 注册 Pinia 并添加持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 注册 Vue Router
app.use(router)

// 挂载应用
app.mount('#app')