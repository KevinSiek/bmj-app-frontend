
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import purchaseApi from '@/api/purchase'

export const usePurchaseStore = defineStore('purchase', () => {
  const purchase = reactive({
    id: '',
    no_buy: '',
    notes: '',
    status: '',
    totalPurchase: 0,
    spareparts: [
      {
        partName: '',
        partNumber: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
      }
    ]
  })
  const purchases = ref([])
  const paginationData = ref({})

  function $resetPurchase () {
    // Reset basic properties
    purchase.id = ''
    purchase.no_buy = ''
    purchase.notes = ''
    purchase.status = ''
    purchase.totalPurchase = 0

    // Reset spareparts array
    purchase.spareparts = []
  }

  function setPurchase (data) {
    // Set basic properties with fallback values
    purchase.id = data.id || ''
    purchase.no_buy = data.no_buy || ''
    purchase.notes = data.notes || ''
    purchase.status = data.status || ''
    purchase.totalPurchase = data.totalPurchase || 0

    // Set spareparts array with proper mapping
    purchase.spareparts = (data.spareparts || []).map(sparepart => ({
      partName: sparepart.partName || '',
      partNumber: sparepart.partNumber || '',
      quantity: sparepart.quantity || 0,
      unitPrice: sparepart.unitPrice || 0,
      totalPrice: sparepart.totalPrice || 0
    }))
  }

  async function getAllPurchase (param) {
    console.log('FETCH PURCHASE', param)
    const { data } = await purchaseApi.getAllPurchase(param)
    purchases.value = data.data
    paginationData.value = data
    console.log('PURCHASE', purchases.value)
  }

  async function addPurchase () {
    console.log('ADD PURCHASES', purchase)
    await purchaseApi.addPurchase(purchase)
    $resetPurchase()
  }

  async function updatePurchase () {
    console.log('UPDATE PURCHASE')
    const { data } = await purchaseApi.updatePurchase(purchase.id)
    setPurchase(data)
  }

  async function getPurchase (id) {
    const { data } = await purchaseApi.getPurchaseById(id)
    console.log('GET PURCHASE', data)
    setPurchase(data)
  }

  return {
    purchase,
    purchases,
    paginationData,
    $resetPurchase,
    getAllPurchase,
    addPurchase,
    updatePurchase,
    getPurchase
  }
})
