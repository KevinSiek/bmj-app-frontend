import { ref } from 'vue'
import { defineStore } from 'pinia'
import deliveryOrderApi from '@/api/delivery-order'

export const useDeliveryOrderStore = defineStore('delivery-order', () => {
  const deliveryOrder = ref(null)
  const deliveryOrders = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapDeliveryOrder (data) {
    return {
      id: data?.id || '',
      currentStatus: data?.current_status || '',
      deliveryOrder: {
        deliveryOrderNumber: data?.work_order_number || '',
        deliveryOrderDate: data?.delivery_order?.delivery_order_date || '',
        receivedBy: data?.delivery_order?.received_by || '',
        pickedBy: data?.delivery_order?.picked_by || '',
        preparedBy: data?.delivery_order?.prepared_by || '',
        shipMode: data?.delivery_order?.ship_mode || '',
        orderType: data?.delivery_order?.order_type || '',
        delivery: data?.delivery_order?.delivery || '',
        npwp: data?.delivery_order?.npp || ''
      },
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
        purchaseOrderDate: data?.purchase_order?.purchase_order_date || '',
        type: data?.purchase_order?.type || ''
      },
      customer: {
        companyName: data?.customer?.company_name || '',
        address: data?.customer?.address || '',
        city: data?.customer?.city || '',
        province: data?.customer?.province || '',
        office: data?.customer?.office || '',
        urban: data?.customer?.urban || '',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || '',
      },
      notes: data?.notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        quantity: sparepart?.quantity || 0,
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        stock: sparepart?.stock || ''
      }))
    }
  }

  async function getAllDeliveryOrders(param) {
    isLoading.value = true
    const { data } = await deliveryOrderApi.getAllWorkOrder(param)
    deliveryOrders.value = data.data.map(mapDeliveryOrder)
    console.log(deliveryOrders.value)
    paginationData.value = data
    isLoading.value = false
  }

  async function getDeliveryOrder(id) {
    const { data } = await deliveryOrderApi.getWorkOrderById(id)
    deliveryOrder.value = mapDeliveryOrder(data)
    console.log(deliveryOrder.value)
  }

  async function addDeliveryOrder() {
    console.log(deliveryOrder.value)
    await delive.addWorkOrder(deliveryOrder)
  }

  async function setDeliveryOrder (selectedDeliveryOrder) {
    deliveryOrder.value = selectedDeliveryOrder
  }

  async function updateDeliveryOrder() {
    const { data } = await deliveryOrderApi.updateWorkOrder(deliveryOrder.value.id, deliveryOrder)
  }

  async function deleteDeliveryOrder(id) {
    await deliveryOrderApi.deleteWorkOrder(id)
  }

  async function process(id) {
    const response = await deliveryOrderApi.process(id)
  }

  async function $resetDeliveryOrder () {
    deliveryOrder.value = mapDeliveryOrder()
  }

  return {
    deliveryOrder,
    deliveryOrders,
    paginationData,
    isLoading,
    getAllDeliveryOrders,
    getDeliveryOrder,
    updateDeliveryOrder,
    setDeliveryOrder,
    deleteDeliveryOrder,
    addDeliveryOrder,
    process,
    $resetDeliveryOrder
  }
})
