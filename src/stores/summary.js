import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import summaryApi from '@/api/summary'
import { useAuthStore } from './auth'

export const useSummaryStore = defineStore('summary', () => {
  const userStore = useAuthStore()
  const { user } = storeToRefs(userStore)

  const summary = ref({})

  async function getSummary (param) {
    const userRole = user.value.role.toLowerCase()
    console.log('user', userRole)
    const { data } = await summaryApi.getSummary(userRole, param)
    console.log('getSummary', data)
    summary.value = data
  }

  return {
    summary,
    getSummary
  }
})
