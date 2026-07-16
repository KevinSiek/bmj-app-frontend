import { ref } from 'vue'
import { defineStore } from 'pinia'
import backOrderApi from '@/api/back-order'
import { getAllSparepart } from '@/api/sparepart'

export const useBackOrderStore = defineStore('back-order', () => {
  const backOrder = ref(null)
  const backOrders = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)
  const newBackOrder = ref([])
  const searchedSpareparts = ref([])

  function mapBackOrder(data) {
    return {
      id: data?.id || '',
      date: data?.date || '',
      currentStatus: data?.current_status || '',
      backOrderNumber: data?.back_order_number || '',
      status: data?.status || [],
      origin: data?.origin || '',
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
        purchaseOrderDate: data?.purchase_order?.purchase_order_date || '',
        poNumber: data?.purchase_order?.po_number || '',
        orderType: data?.purchase_order?.order_type || '',
        branch: data?.purchase_order?.branch || ''
      },
      deliveryOrder: {
        no: data?.delivery_order?.delivery_order_number || '',
        date: data?.delivery_order?.delivery_order_date || '',
        shipMode: data?.delivery_order?.ship_mode || ''
      },
      customer: {
        companyName: data?.customer?.company_name || '',
        address: data?.customer?.address || '',
        city: data?.customer?.city || '',
        province: data?.customer?.province || '',
        office: data?.customer?.office || '',
        urban: data?.customer?.urban || 'x',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || '',
        npwp: data?.customer?.npwp || '',
        delivery: data?.customer?.delivery || ''
      },
      notes: data?.notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartId: sparepart?.sparepart_id || sparepart?.id || '',
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        totalUnit: Object.fromEntries(
          (sparepart?.total_unit || []).map(branch => [branch?.name || '', branch?.stock || 0])
        ),
        order: sparepart?.order || 0,
        deliveryOrder: sparepart?.delivery_order || 0,
        backOrder: sparepart?.back_order || 0,
        stock: sparepart?.stock || '',
        status: sparepart?.status || '',
      }))
    }
  }

  function mapSparepart (data) {
    return {
      sparepartId: data?.sparepart_id || data?.id || '',
      slug: data?.slug || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || '',
      totalUnit: Object.fromEntries(
        (data?.total_unit || []).map(branch => [branch?.name || '', branch?.stock || 0])
      ),
      unitPriceBuy: data?.unit_price_buy || 0,
      unitPriceSell: data?.unit_price_sell || 0,
      unitPriceSeller: (data?.unit_price_seller || []).map(seller => ({
        seller: seller?.seller || '',
        price: seller?.price || 0
      }))
    }
  }

  async function getAllBackOrder(param) {
    isLoading.value = true
    const { data } = await backOrderApi.getAllBackOrder(param)
    // Group by invoice number
    const grouped = {}
    data.data.forEach(item => {
      const key = item.back_order_number
      if (!grouped[key]) {
        grouped[key] = {
          backOrderNumber: key,
          versions: []
        }
      }
      grouped[key].versions.push(mapBackOrder(item))
    })

    backOrders.value = Object.values(grouped)
    paginationData.value = data
    isLoading.value = false
  }

  async function getBackOrder(id) {
    const { data } = await backOrderApi.getBackOrderById(id)
    console.log(data)
    backOrder.value = mapBackOrder(data)
    console.log(backOrder.value)
    return data
  }

  async function getBackOrderForAdjustment(id) {
    const backOrder = await getBackOrder(id)
    newBackOrder.value = mapBackOrder(backOrder)
  }

  async function setBackOrder(selectedBackOrder) {
    backOrder.value = selectedBackOrder
  }

  async function addBackOrder() {
    const response = await backOrderApi.addBackOrder(backOrder.value)
  }

  async function updateBackOrder() {
    const { data } = await backOrderApi.updateBackOrder(backOrder.value.id)
  }

  async function processBackOrder(id) {
    const response = await backOrderApi.processBackOrder(id)
  }

  async function analyzeBackOrder(id) {
    return await backOrderApi.analyzeBackOrder(id)
  }

  async function getSpareparts (param) {
    const { data } = await getAllSparepart(param)
    searchedSpareparts.value = data.data.map(mapSparepart)
    console.log('searchedSpareparts', searchedSpareparts.value)
  }

  async function adjustBackOrder(id) {
    const response = await backOrderApi.adjustBackOrder(id, newBackOrder.value)
  }

  async function $resetBackOrder() {
    backOrder.value = mapBackOrder()
    newBackOrder.value = mapBackOrder()
  }

  async function $resetBackOrders() {
    backOrders.value = []
  }

  return {
    backOrder,
    backOrders,
    newBackOrder,
    searchedSpareparts,
    paginationData,
    isLoading,
    getAllBackOrder,
    addBackOrder,
    setBackOrder,
    updateBackOrder,
    getBackOrder,
    processBackOrder,
    analyzeBackOrder,
    getSpareparts,
    getBackOrderForAdjustment,
    adjustBackOrder,
    $resetBackOrder,
    $resetBackOrders
  }
})
