import axios from 'axios'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useModalStore } from './stores/modal'
import { common } from './config'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'
import 'bootstrap-icons/font/bootstrap-icons.css'

import './assets/css/base.css'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
// axios.defaults.headers.common['key'] = 'rest-api-test';
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.must_change_password) {
      const modalStore = useModalStore()
      modalStore.openMessageModal(
        common.modal.failed,
        'You must change your temporary password before continuing.'
      )
      
      router.push('/profile')
    }
    return Promise.reject(error);
  }
);

import PriceDisplay from '@/components/PriceDisplay.vue'
import CurrencyInput from '@/components/CurrencyInput.vue'

const app = createApp(App)

app.component('PriceDisplay', PriceDisplay)
app.component('CurrencyInput', CurrencyInput)
app.use(createPinia())
app.use(router)

app.mount('#app')
