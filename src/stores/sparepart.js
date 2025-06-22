import { ref } from 'vue'
import { defineStore } from 'pinia'
import sparepartApi from '@/api/sparepart'

export const useSparepartStore = defineStore('sparepart', () => {
  const sparepart = ref(null)
  const spareparts = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapSparepart (data) {
    return {
      sparepartId: data?.id || '',
      slug: data?.slug || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || '',
      totalUnit: data?.total_unit || 0,
      unitPriceSell: data?.unit_price_sell || 0,
      unitPriceBuy: (data?.unit_price_buy || []).map(buy => ({
        seller: buy?.seller || '',
        price: buy?.price || 0
      }))
    }
  }

  async function getAllSpareparts(param) {
    isLoading.value = true
    const { data } = await sparepartApi.getAllSparepart(param)
    spareparts.value = data.data.map(mapSparepart)
    paginationData.value = data
    isLoading.value = false
  }

  async function getSparepart(id) {
    const { data } = await sparepartApi.getSparepartById(id)
    sparepart.value = mapSparepart(data)
  }

  async function addSparepart() {
    const data = await sparepartApi.addSparepart(sparepart)
  }

  async function setSparepart (selectedSparepart) {
    sparepart.value = selectedSparepart
  }

  async function updateSparepart() {
    const { data } = await sparepartApi.updateSparepart(sparepart.value.id, sparepart)
  }

  async function deleteSparepart(id) {
    await sparepartApi.deleteSparepart(id)
  }

  async function $resetSparepart () {
    sparepart.value = mapSparepart()
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
    $resetSparepart
  }
})
