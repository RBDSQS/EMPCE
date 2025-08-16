// src/main.ts（示例！）
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router).use(ElementPlus)
app.mount('#app')             // ✅ 只能出现一次
// 别在其它地方再调用 app.mount('#app')
