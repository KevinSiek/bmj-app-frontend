import { ref } from 'vue'
import { defineStore } from 'pinia'
import workOrderApi from '@/api/work-order'

export const useWorkOrderStore = defineStore('work-order', () => {
  const workOrder = ref(null)
  const workOrders = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapWorkOrder (data) {
    return {
      id: data?.id || '',
      workOrderNumber: data?.work_order_number || '',
      serviceOrder: {
        no: data?.service_order?.no || '',
        date: data?.service_order?.date || '',
        receivedBy: data?.service_order?.received_by || '',
        startDate: data?.service_order?.start_date || '',
        endDate: data?.service_order?.end_date || ''
      },
      currentStatus: data?.current_status || '',
      purchaseOrder: {
        purchaseOrderNumber: data?.purchase_order?.purchase_order_number || '',
        purchaseOrderDate: data?.purchase_order?.purchase_order_date || ''
      },
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
      },
      status: data?.status || []
    }
  }

  async function getAllWorkOrders(param) {
    isLoading.value = true
    const { data } = await workOrderApi.getAllWorkOrder(param)
    workOrders.value = data.data.map(mapWorkOrder)
    console.log(workOrders.value)
    paginationData.value = data
    isLoading.value = false
  }

  async function getWorkOrder(id) {
    const { data } = await workOrderApi.getWorkOrderById(id)
    workOrder.value = mapWorkOrder(data)
    console.log(workOrder.value)
  }

  async function addWorkOrder() {
    console.log(workOrder.value)
    await workOrderApi.addWorkOrder(workOrder)
  }

  async function setWorkOrder (selectedWorkOrder) {
    workOrder.value = selectedWorkOrder
  }

  async function updateWorkOrder() {
    const { data } = await workOrderApi.updateWorkOrder(workOrder.value.id, workOrder)
  }

  async function deleteWorkOrder(id) {
    await workOrderApi.deleteWorkOrder(id)
  }

  async function process(id) {
    const response = await workOrderApi.process(id)
  }

  async function $resetWorkOrder () {
    workOrder.value = mapWorkOrder()
  }

  async function $resetWorkOrders() {
    workOrders.value = []
  }

  return {
    workOrder,
    workOrders,
    paginationData,
    isLoading,
    getAllWorkOrders,
    getWorkOrder,
    updateWorkOrder,
    setWorkOrder,
    deleteWorkOrder,
    addWorkOrder,
    process,
    $resetWorkOrder,
    $resetWorkOrders
  }
})
