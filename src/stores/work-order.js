import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllWorkOrder } from '@/api/work-order'

export const useWorkOrderStore = defineStore('work-order', () => {
  const workOrder = reactive({
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
      compiled: 'Dian',
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
  const workOrders = ref([
    {
      id: '1',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      status: 'Receive PO'
    },
    {
      id: '2',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      status: 'Sparepart Ready'
    },
    {
      id: '3',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      status: 'On Progress'
    }
  ])

  function $resetWorkOrder () {
    workOrder.serviceOrder.no = ''
    workOrder.serviceOrder.date = ''
    workOrder.serviceOrder.receivedBy = ''
    workOrder.serviceOrder.startDate = ''
    workOrder.serviceOrder.endDate = ''
    workOrder.proformaInvoice.no = ''
    workOrder.proformaInvoice.date = ''
    workOrder.customer.companyName = ''
    workOrder.customer.address = ''
    workOrder.customer.city = ''
    workOrder.customer.province = ''
    workOrder.customer.office = ''
    workOrder.customer.urban = '',
    workOrder.customer.subdistrict = '',
    workOrder.customer.postalCode = ''
  }

  async function getAllWorkOrderByDate () {
    console.log('FETCH WORK ORDER')
    // const response = await getAllWorkOrder()
    // workOrders.value = response.body
  }

  return { workOrder, workOrders, $resetWorkOrder, getAllWorkOrderByDate }
})
