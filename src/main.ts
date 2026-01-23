import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Configure Pinia state management
app.use(createPinia())

// Configure Element Plus UI library
app.use(ElementPlus)

// Configure Vue Router
app.use(router)

// Global error handler
app.config.errorHandler = (err, _instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  // You can add additional error reporting here (e.g., send to monitoring service)
}

// Global warning handler (development only)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, _instance, trace) => {
    console.warn('Global warning:', msg)
    console.warn('Warning trace:', trace)
  }
}

app.mount('#app')
