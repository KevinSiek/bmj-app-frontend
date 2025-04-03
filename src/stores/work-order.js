import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import workOrderApi from '@/api/work-order'

export const useWorkOrderStore = defineStore('work-order', () => {
  const workOrder = reactive({
    id: '',
    no_wo: '',
    serviceOrder: {
      no: '',
      date: '',
      receivedBy: '',
      startDate: '',
      endDate: ''
    },
    proformaInvoice: {
      no: '',
      date: ''
    },
    customer: {
      companyName: '',
      address: '',
      city: '',
      province: '',
      office: '',
      urban: '',
      subdistrict: '',
      postalCode: ''
    },
    units: [
      {
        jobDescription: '',
        unitType: '',
        quantity: 0
      }
    ],
    poc: {
      compiled: '',
      headOfService: '',
      director: '',
      worker: [],
      approver: ''
    },
    date: {
      start: '',
      end: ''
    },
    description: '',
    additional: {
      spareparts: '',
      backupSparepart: '',
      scope: '',
      vaccine: '',
      apd: '',
      peduliLindungi: '',
      executionTime: ''
    }
  })
  const workOrders = ref([])
  const paginationData = ref({})

  function $resetWorkOrder () {
    // Reset basic properties
    workOrder.id = ''
    workOrder.no_wo = ''
    workOrder.description = ''

    // Reset serviceOrder properties
    workOrder.serviceOrder.no = ''
    workOrder.serviceOrder.date = ''
    workOrder.serviceOrder.receivedBy = ''
    workOrder.serviceOrder.startDate = ''
    workOrder.serviceOrder.endDate = ''

    // Reset proformaInvoice properties
    workOrder.proformaInvoice.no = ''
    workOrder.proformaInvoice.date = ''

    // Reset customer properties
    workOrder.customer.companyName = ''
    workOrder.customer.address = ''
    workOrder.customer.city = ''
    workOrder.customer.province = ''
    workOrder.customer.office = ''
    workOrder.customer.urban = ''
    workOrder.customer.subdistrict = ''
    workOrder.customer.postalCode = ''

    // Reset units array
    workOrder.units = []

    // Reset poc properties
    workOrder.poc.compiled = ''
    workOrder.poc.headOfService = ''
    workOrder.poc.director = ''
    workOrder.poc.worker = []
    workOrder.poc.approver = ''

    // Reset date properties
    workOrder.date.start = ''
    workOrder.date.end = ''

    // Reset additional properties
    workOrder.additional.spareparts = ''
    workOrder.additional.backupSparepart = ''
    workOrder.additional.scope = ''
    workOrder.additional.vaccine = ''
    workOrder.additional.apd = ''
    workOrder.additional.peduliLindungi = ''
    workOrder.additional.executionTime = ''
  }

  function setWorkOrder (data) {
    // Set basic properties with fallback values
    workOrder.id = data.id || ''
    workOrder.no_wo = data.no_wo || ''
    workOrder.description = data.description || ''

    // Set serviceOrder properties
    workOrder.serviceOrder.no = data.serviceOrder?.no || ''
    workOrder.serviceOrder.date = data.serviceOrder?.date || ''
    workOrder.serviceOrder.receivedBy = data.serviceOrder?.receivedBy || ''
    workOrder.serviceOrder.startDate = data.serviceOrder?.startDate || ''
    workOrder.serviceOrder.endDate = data.serviceOrder?.endDate || ''

    // Set proformaInvoice properties
    workOrder.proformaInvoice.no = data.proformaInvoice?.no || ''
    workOrder.proformaInvoice.date = data.proformaInvoice?.date || ''

    // Set customer properties
    workOrder.customer.companyName = data.customer?.companyName || ''
    workOrder.customer.address = data.customer?.address || ''
    workOrder.customer.city = data.customer?.city || ''
    workOrder.customer.province = data.customer?.province || ''
    workOrder.customer.office = data.customer?.office || ''
    workOrder.customer.urban = data.customer?.urban || ''
    workOrder.customer.subdistrict = data.customer?.subdistrict || ''
    workOrder.customer.postalCode = data.customer?.postalCode || ''

    // Set units array with proper mapping
    workOrder.units = (data.units || []).map(unit => ({
      jobDescription: unit.jobDescription || '',
      unitType: unit.unitType || '',
      quantity: unit.quantity || 0
    }))

    // Set poc properties
    workOrder.poc.compiled = data.poc?.compiled || ''
    workOrder.poc.headOfService = data.poc?.headOfService || ''
    workOrder.poc.director = data.poc?.director || ''
    workOrder.poc.worker = data.poc?.worker || []
    workOrder.poc.approver = data.poc?.approver || ''

    // Set date properties
    workOrder.date.start = data.date?.start || ''
    workOrder.date.end = data.date?.end || ''

    // Set additional properties
    workOrder.additional.spareparts = data.additional?.spareparts || ''
    workOrder.additional.backupSparepart = data.additional?.backupSparepart || ''
    workOrder.additional.scope = data.additional?.scope || ''
    workOrder.additional.vaccine = data.additional?.vaccine || ''
    workOrder.additional.apd = data.additional?.apd || ''
    workOrder.additional.peduliLindungi = data.additional?.peduliLindungi || ''
    workOrder.additional.executionTime = data.additional?.executionTime || ''
  }

  async function getAllWorkOrders(param) {
    const { data } = await workOrderApi.getAllWorkOrder(param)
    workOrders.value = data.data
    paginationData.value = data
    console.log('FETCH WORK ORDER', data)
  }

  async function getWorkOrder(id) {
    const { data } = await workOrderApi.getWorkOrderById(id)
    setWorkOrder(data)
  }

  async function addWorkOrder() {
    await workOrderApi.addWorkOrder(workOrder)
    $resetWorkOrder()
  }

  async function updateWorkOrder() {
    const { data } = await workOrderApi.updateWorkOrder(workOrder.id, workOrder)
    setWorkOrder(data)
  }

  async function deleteWorkOrder(id) {
    await workOrderApi.deleteWorkOrder(id)
  }

  return {
    workOrder,
    workOrders,
    paginationData,
    $resetWorkOrder,
    getAllWorkOrders,
    getWorkOrder,
    setWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    addWorkOrder
  }
})
