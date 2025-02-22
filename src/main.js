import axios from 'axios'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'
import 'bootstrap-icons/font/bootstrap-icons.css';

import './assets/css/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
