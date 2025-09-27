
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import purchaseApi from '@/api/purchase'
import { getAllSparepart } from '@/api/sparepart'

export const usePurchaseStore = defineStore('purchase', () => {
  const purchase = ref(null)
  const purchases = ref([])
  const purchaseReviews = ref([])
  const paginationData = ref({})
  const searchedSpareparts = ref([])
  const isLoading = ref(false)

  function mapPurchase (data) {
    return {
      id: data?.id || '',
      buyNumber: data?.buy_number || '',
      notes: data?.notes || '',
      currentStatus: data?.current_status || '',
      totalAmount: data?.total_amount || 0,
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartId: sparepart?.sparepart_id || sparepart?.id || '',
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        quantity: sparepart?.quantity || 0,
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        stock: sparepart?.stock || ''
      }))
    }
  }

  function mapSparepart (data) {
    return {
      sparepartId: data?.sparepart_id || data?.id || '',
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

  async function getAllPurchase (param) {
    isLoading.value = true
    const { data } = await purchaseApi.getAllPurchase(param)
    console.log('getAllPurchase', data)
    purchases.value = data.data.map(mapPurchase)
    paginationData.value = data
    isLoading.value = false
  }

  async function getAllPurchaseReview (param) {
    console.log('getAllPurchaseReview', param)
    isLoading.value = true
    const { data } = await purchaseApi.getAllPurchaseReview(param)
    console.log('getAllPurchaseReview', data)
    purchaseReviews.value = data.data.map(mapPurchase)
    paginationData.value = data
    isLoading.value = false
  }

  async function getPurchase (id) {
    const { data } = await purchaseApi.getPurchaseById(id)
    console.log('getPurchase', data)
    purchase.value = mapPurchase(data)
  }

  async function addPurchase () {
    await purchaseApi.addPurchase(purchase.value)
  }

  async function setPurchase (selectedPurchase) {
    purchase.value = selectedPurchase
  }

  async function updatePurchase () {
    console.log(purchase.value)
    const { data } = await purchaseApi.updatePurchase(purchase.value.id, purchase.value)
    console.log('updatePurchase', data)
  }

  async function getSpareparts (param) {
    const { data } = await getAllSparepart(param)
    searchedSpareparts.value = data.data.map(mapSparepart)
    console.log('searchedSpareparts', searchedSpareparts.value)
  }

  async function receive (id) {
    const response = await purchaseApi.done(id)
    return response
  }

  async function $resetPurchase () {
    purchase.value = mapPurchase()
  }

  async function approvePurchase (id) {
    const response = await purchaseApi.approvePurchase(id)
    return response
  }

  async function rejectPurchase (id) {
    const response = await purchaseApi.rejectPurchase(id)
    return response
  }

  async function needChangePurchase (id) {
    const response = await purchaseApi.needChangePurchase(id)
  }

  return {
    purchase,
    purchases,
    purchaseReviews,
    paginationData,
    searchedSpareparts,
    isLoading,
    getAllPurchase,
    getAllPurchaseReview,
    addPurchase,
    updatePurchase,
    setPurchase,
    getPurchase,
    getSpareparts,
    receive,
    $resetPurchase,
    approvePurchase,
    rejectPurchase,
    needChangePurchase
  }
})
