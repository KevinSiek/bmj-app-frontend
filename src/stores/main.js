import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', () => {
  const isMobile = ref(false)

  const setIsMobile = (value) => {
    isMobile.value = value
  }

  return { isMobile, setIsMobile }
})
