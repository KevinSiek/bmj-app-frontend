import { ref } from 'vue'
import { defineStore } from 'pinia'
import sparepartApi from '@/api/sparepart'
import { common } from '@/config'

export const useSparepartStore = defineStore('sparepart', () => {
  const sparepart = ref(null)
  const spareparts = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapSparepart(data = {}) {
    return {
      sparepartId: data?.id || '',
      slug: data?.slug || '',
      branch: data?.branch || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || '',
      totalUnit: (data?.total_unit || Object.values(common.branch)).map(branch => ({
        name: branch.name || branch,
        stock: branch.stock || 0
      })),
      unitPriceSell: data?.unit_price_sell || 0,
      unitPriceBuy: data?.unit_price_buy || 0,
      unitPriceSeller: (data?.unit_price_seller || []).map(buy => ({
        seller: buy?.seller || '',
        price: buy?.price || 0,
        quantity: buy?.quantity || 0
      }))
    }
  }

  async function getAllSpareparts(param) {
    isLoading.value = true
    const { data } = await sparepartApi.getAllSparepart(param)
    console.log("data :", data)

    spareparts.value = data.data.map(mapSparepart)
    paginationData.value = data
    isLoading.value = false
  }

  async function getSparepart(id) {
    console.log("getSparepart -- id:", id)
    const { data } = await sparepartApi.getSparepartById(id)
    console.log("data :", data)
    sparepart.value = mapSparepart(data)
  }

  async function addSparepart() {
    const data = await sparepartApi.addSparepart(sparepart.value)
  }

  async function setSparepart(selectedSparepart) {
    sparepart.value = selectedSparepart
  }

  async function updateSparepart() {
    const data = await sparepartApi.updateSparepart(sparepart.value.sparepartId, sparepart.value)
  }

  async function deleteSparepart(id) {
    await sparepartApi.deleteSparepart(id)
  }

  async function $resetSparepart() {
    sparepart.value = mapSparepart()
  }

  async function $resetSpareparts() {
    spareparts.value = []
  }

  async function uploadSparepartFile(file) {
    isLoading.value = true
    const formData = new FormData()
    await sparepartApi.uploadFile(formData)
    isLoading.value = false
  }

  return {
    sparepart,
    spareparts,
    paginationData,
    isLoading,
    getAllSpareparts,
    getSparepart,
    setSparepart,
    updateSparepart,
    deleteSparepart,
    addSparepart,
    uploadSparepartFile,
    $resetSparepart,
    $resetSpareparts
  }
})
