import { ref } from 'vue'
import { defineStore } from 'pinia'
import backOrderApi from '@/api/back-order'

export const useBackOrderStore = defineStore('back-order', () => {
  const backOrder = ref(null)
  const backOrders = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapBackOrder (data) {
    return {
      id: data?.id || '',
      date: data?.date || '',
      currentStatus: data?.current_status || '',
      backOrderNumber: data?.back_order_number || '',
      status: data?.status || [],
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
        purchaseOrderDate: data?.purchase_order?.purchase_order_date || '',
        orderType: data?.purchase_order?.order_type || ''
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
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        totalUnit: sparepart?.total_unit || '',
        order: sparepart?.order || 0,
        deliveryOrder: sparepart?.delivery_order || 0,
        backOrder: sparepart?.back_order || 0
      }))
    }
  }

  async function getAllBackOrder (param) {
    isLoading.value = true
    console.log('FETCH BACK ORDER BY DATE', param)
    const { data } = await backOrderApi.getAllBackOrder(param)
    backOrders.value = data.data.map(mapBackOrder)
    paginationData.value = data
    isLoading.value = false
    console.log(data)
  }

  async function getBackOrder (id) {
    const { data } = await backOrderApi.getBackOrderById(id)
    console.log(data)
    backOrder.value = mapBackOrder(data)
    console.log(backOrder.value)
  }

  async function setBackOrder(selectedBackOrder) {
    backOrder.value = selectedBackOrder
  }

  async function addBackOrder () {
    const response = await backOrderApi.addBackOrder(backOrder)
  }

  async function updateBackOrder () {
    const { data } = await backOrderApi.updateBackOrder(backOrder.value.id)
  }

  async function processBackOrder (id) {
    const response = await backOrderApi.processBackOrder(id)
  }

  async function $resetBackOrder () {
    backOrder.value = mapBackOrder()
  }

  return {
    backOrder,
    backOrders,
    paginationData,
    isLoading,
    getAllBackOrder,
    addBackOrder,
    setBackOrder,
    updateBackOrder,
    getBackOrder,
    processBackOrder,
    $resetBackOrder
  }
})
