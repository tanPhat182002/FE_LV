import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

const app = createApp(App)

// Khôi phục auth state từ localStorage
store.dispatch('user/initializeAuth')

app.use(store)  // Quan trọng!
app.use(router)
app.use(vuetify)
app.mount('#app')