import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import sparepartApi from '@/api/sparepart'

export const useSparepartStore = defineStore('sparepart', () => {
  const sparepart = reactive({
    id: '',
    no_sparepart: '',
    sparepartName: '',
    stock: 0,
    partNumber: '',
    sellingPrice: 0,
    purchasesPrice: []
  })
  const spareparts = ref([])
  const paginationData = ref({})

  function $resetSparepart () {
    // Reset basic properties
    sparepart.id = ''
    sparepart.no_sparepart = ''
    sparepart.sparepartName = ''
    sparepart.stock = 0
    sparepart.partNumber = ''
    sparepart.sellingPrice = 0

    // Reset purchasesPrice array
    sparepart.purchasesPrice = []
  }

  function setSparepart (data) {
    // Set basic properties with fallback values
    sparepart.id = data.id || ''
    sparepart.no_sparepart = data.no_sparepart || ''
    sparepart.sparepartName = data.sparepartName || ''
    sparepart.stock = data.stock || 0
    sparepart.partNumber = data.partNumber || ''
    sparepart.sellingPrice = data.sellingPrice || 0

    // Set purchasesPrice array with proper mapping
    sparepart.purchasesPrice = (data.purchasesPrice || []).map(price => ({
      seller: price.seller || '',
      price: price.price || 0
    }))
  }

  async function getAllSpareparts(param) {
    const { data } = await sparepartApi.getAllSparepart(param)
    spareparts.value = data.data
    paginationData.value = data
  }

  async function getSparepart(id) {
    const { data } = await sparepartApi.getSparepartById(id)
    setSparepart(data)
  }

  async function addSparepart() {
    await sparepartApi.addSparepart(sparepart)
    $resetSparepart()
  }

  async function updateSparepart() {
    const { data } = await sparepartApi.updateSparepart(sparepart.id, sparepart)
    setSparepart(data)
  }

  async function deleteSparepart(id) {
    await sparepartApi.deleteSparepart(id)
  }

  return {
    sparepart,
    spareparts,
    paginationData,
    $resetSparepart,
    getAllSpareparts,
    getSparepart,
    setSparepart,
    updateSparepart,
    deleteSparepart,
    addSparepart
  }
})
