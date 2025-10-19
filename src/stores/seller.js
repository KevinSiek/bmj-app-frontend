import { ref } from 'vue'
import { defineStore } from 'pinia'
import sellerApi from '@/api/seller'

export const useSellerStore = defineStore('seller', () => {
  const sellers = ref([])

  function mapSeller(data) {
    return {
      id: data?.id || '',
      code: data?.code || '',
      name: data?.name || '',
      type: data?.type || '',
    }
  }

  async function getSellers (param) {
    const { data } = await sellerApi.getSellers(param)
    sellers.value = data.data.map(mapSeller)
  }

  return {
    sellers,
    getSellers
  }
})
