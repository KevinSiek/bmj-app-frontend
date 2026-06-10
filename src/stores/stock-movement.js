import { ref } from 'vue'
import { defineStore } from 'pinia'
import stockMovementApi from '@/api/stock-movement'

export const useStockMovementStore = defineStore('stock-movement', () => {
  const stockMovements = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapStockMovement(data = {}) {
    return {
      id: data?.id || '',
      delta: data?.delta || 0,
      sourceType: data?.source_type || '',
      sourceId: data?.source_id || '',
      reason: data?.reason || '',
      sparepart: {
        id: data?.sparepart?.id || '',
        sparepartName: data?.sparepart?.sparepart_name || '',
        sparepartNumber: data?.sparepart?.sparepart_number || ''
      },
      branch: {
        id: data?.branch?.id || '',
        name: data?.branch?.name || ''
      },
      employee: {
        id: data?.employee?.id || '',
        name: data?.employee?.name || ''
      },
      createdAt: data?.created_at || ''
    }
  }

  async function getStockMovements(param) {
    isLoading.value = true
    const { data } = await stockMovementApi.getStockMovements(param)
    stockMovements.value = data.data.map(mapStockMovement)
    paginationData.value = data
    isLoading.value = false
  }

  async function $resetStockMovements() {
    stockMovements.value = []
  }

  return {
    stockMovements,
    paginationData,
    isLoading,
    mapStockMovement,
    getStockMovements,
    $resetStockMovements
  }
})
