import axios from 'axios'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import pdfMake from 'pdfmake/build/pdfmake.js'

import App from './App.vue'
import router from './router'
import { useModalStore } from './stores/modal'
import { useAuthStore } from './stores/auth'
import { common } from './config'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'
import 'bootstrap-icons/font/bootstrap-icons.css'

import './assets/css/base.css'

if (window.__CAPTURE_PDF_MODE__) {
  window.pdfMake = pdfMake;
  const originalCreatePdf = pdfMake.createPdf;
  pdfMake.createPdf = function(docDefinition) {
    const pdfDoc = originalCreatePdf.call(pdfMake, docDefinition);
    pdfDoc.print = function() {
      if (window.__ON_PDF_PRINT__) {
        window.__ON_PDF_PRINT__(docDefinition);
      }
    };
    return pdfDoc;
  };
}

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
// axios.defaults.headers.common['key'] = 'rest-api-test';
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.forceLogout()
    }
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

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
