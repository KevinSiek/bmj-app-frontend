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

  const isDirty = ref(false)

  function validateSparepart() {
    const sp = sparepart.value
    if (!sp) return 'Sparepart data is empty.'
    if (!sp.sparepartName?.trim()) return 'Sparepart Name is required.'
    if (!sp.sparepartNumber?.trim()) return 'Part Number is required.'
    if (sp.unitPriceBuy === '' || isNaN(Number(sp.unitPriceBuy)) || Number(sp.unitPriceBuy) < 1) return 'Buy price must be at least 1.'
    if (sp.unitPriceSell === '' || isNaN(Number(sp.unitPriceSell)) || Number(sp.unitPriceSell) < 1) return 'Selling price must be at least 1.'

    for (let i = 0; i < sp.totalUnit.length; i++) {
      const b = sp.totalUnit[i]
      if (b.stock === '' || isNaN(Number(b.stock)) || Number(b.stock) < 0) {
        return `Stock for branch ${b.name} must be a number greater than or equal to 0.`
      }
    }

    for (let i = 0; i < sp.unitPriceSeller.length; i++) {
      const s = sp.unitPriceSeller[i]
      const idxStr = `Seller #${i + 1}`
      if (!s.seller) return `${idxStr}: Seller Name is required.`
      if (s.price === '' || isNaN(Number(s.price)) || Number(s.price) < 1) {
        return `${idxStr}: Purchase Price must be at least 1.`
      }
      if (s.quantity === '' || isNaN(Number(s.quantity)) || Number(s.quantity) < 1 || !Number.isInteger(Number(s.quantity))) {
        return `${idxStr}: Quantity must be an integer greater than or equal to 1.`
      }
    }
    return null
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
    isDirty.value = false
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
    $resetSpareparts,
    validateSparepart,
    isDirty
  }
})
