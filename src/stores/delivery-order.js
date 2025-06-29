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
      deliveryOrderNumber: data?.work_order_number || '',
      serviceOrder: {
        no: data?.service_order?.no || '',
        date: data?.service_order?.date || '',
        receivedBy: data?.service_order?.received_by || '',
        startDate: data?.service_order?.start_date || '',
        endDate: data?.service_order?.end_date || ''
      },
      currentStatus: data?.current_status || '',
      proformaInvoice: {
        proformaInvoiceNumber: data?.proforma_invoice?.proforma_invoice_number || '',
        proformaInvoiceDate: data?.proforma_invoice?.proforma_invoice_date || ''
      },
      customer: {
        companyName: data?.customer?.company_name || '',
        address: data?.customer?.address || '',
        city: data?.customer?.city || '',
        province: data?.customer?.province || '',
        office: data?.customer?.office || '',
        urban: data?.customer?.urban || '',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || ''
      },
      units: (data?.units || []).map(unit => ({
        jobDescriptions: unit?.job_descriptions || '',
        unitType: unit?.unit_type || '',
        quantity: unit?.quantity || 0
      })),
      poc: {
        compiled: data?.poc?.compiled || '',
        headOfService: data?.poc?.head_of_service || '',
        director: data?.poc?.director || '',
        worker: data?.poc?.worker || [],
        approver: data?.poc?.approver || ''
      },
      date: {
        startDate: data?.date?.start_date || '',
        endDate: data?.date?.end_date || ''
      },
      description: data?.description || '',
      additional: {
        spareparts: data?.additional?.spareparts || '',
        backupSparepart: data?.additional?.backup_sparepart || '',
        scope: data?.additional?.scope || '',
        vaccine: data?.additional?.vaccine || '',
        apd: data?.additional?.apd || '',
        peduliLindungi: data?.additional?.peduli_lindungi || '',
        executionTime: data?.additional?.execution_time || ''
      }
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
