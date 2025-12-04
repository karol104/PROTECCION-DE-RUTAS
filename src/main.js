import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import 'quasar/dist/quasar.css'
import './styles/variables.css'
import App from './App.vue'
import  router  from './routers/routers.js'

const myApp = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
myApp.use(router)

myApp.use(pinia)
myApp.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  },
})

myApp.mount('#app')