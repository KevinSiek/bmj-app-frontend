import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import backOrderApi from '@/api/back-order'

export const useBackOrderStore = defineStore('back-order', () => {
  const backOrder = reactive({
    id: '',
    no_bo: '',
    status: '',
    purchaseOrder: {
      no: '',
      date: '',
      orderType: ''
    },
    deliveryOrder: {
      no: '',
      date: '',
      shipMode: ''
    },
    customer: {
      companyName: '',
      address: '',
      city: '',
      province: '',
      office: '',
      urban: '',
      subdistrict: '',
      postalCode: '',
      npwp: '',
      delivery: ''
    },
    notes: '',
    spareparts: [{
      partName: '',
      partNumber: '',
      order: 0,
      deliveryOrder: 0,
      backOrder: 0
    }]
  })
  const backOrders = ref([])
  const paginationData = ref({})

  function $resetBackOrder () {
    // Reset basic properties
    backOrder.id = ''
    backOrder.no_bo = ''
    backOrder.status = ''
    backOrder.notes = ''

    // Reset purchaseOrder properties
    backOrder.purchaseOrder.no = ''
    backOrder.purchaseOrder.date = ''
    backOrder.purchaseOrder.orderType = ''

    // Reset deliveryOrder properties
    backOrder.deliveryOrder.no = ''
    backOrder.deliveryOrder.date = ''
    backOrder.deliveryOrder.shipMode = ''

    // Reset customer properties
    backOrder.customer.companyName = ''
    backOrder.customer.address = ''
    backOrder.customer.city = ''
    backOrder.customer.province = ''
    backOrder.customer.office = ''
    backOrder.customer.urban = ''
    backOrder.customer.subdistrict = ''
    backOrder.customer.postalCode = ''
    backOrder.customer.npwp = ''
    backOrder.customer.delivery = ''

    // Reset spareparts array
    backOrder.spareparts = []
  }

  function setBackOrder (data) {
    // Set basic properties
    backOrder.id = data.id || ''
    backOrder.no_bo = data.no_bo || ''
    backOrder.status = data.status || ''
    backOrder.notes = data.notes || ''

    // Set purchaseOrder properties
    backOrder.purchaseOrder.no = data.purchaseOrder?.no || ''
    backOrder.purchaseOrder.date = data.purchaseOrder?.date || ''
    backOrder.purchaseOrder.orderType = data.purchaseOrder?.orderType || ''

    // Set deliveryOrder properties
    backOrder.deliveryOrder.no = data.deliveryOrder?.no || ''
    backOrder.deliveryOrder.date = data.deliveryOrder?.date || ''
    backOrder.deliveryOrder.shipMode = data.deliveryOrder?.shipMode || ''

    // Set customer properties
    backOrder.customer.companyName = data.customer?.companyName || ''
    backOrder.customer.address = data.customer?.address || ''
    backOrder.customer.city = data.customer?.city || ''
    backOrder.customer.province = data.customer?.province || ''
    backOrder.customer.office = data.customer?.office || ''
    backOrder.customer.urban = data.customer?.urban || ''
    backOrder.customer.subdistrict = data.customer?.subdistrict || ''
    backOrder.customer.postalCode = data.customer?.postalCode || ''
    backOrder.customer.npwp = data.customer?.npwp || ''
    backOrder.customer.delivery = data.customer?.delivery || ''

    // Set spareparts array with proper mapping
    backOrder.spareparts = (data.spareparts || []).map(sparepart => ({
      partName: sparepart.partName || '',
      partNumber: sparepart.partNumber || '',
      order: sparepart.order || 0,
      deliveryOrder: sparepart.deliveryOrder || 0,
      backOrder: sparepart.backOrder || 0
    }))
  }

  async function getAllBackOrder (param) {
    console.log('FETCH BACK ORDER BY DATE', param)
    const { data } = await backOrderApi.getAllBackOrder(param)
    backOrders.value = data.data
    paginationData.value = data
    console.log(data)
  }

  async function addBackOrder () {
    console.log('ADD BACK ORDER', backOrder)
    const response = await backOrderApi.addBackOrder(backOrder)
    $resetBackOrder()
  }

  async function updateBackOrder () {
    console.log('UPDATE BACK ORDER')
    const { data } = await backOrderApi.updateBackOrder(backOrder.id)
    setBackOrder(data)
  }

  async function getBackOrder (id) {
    const { data } = await backOrderApi.getBackOrderById(id)
    console.log('GET BACK ORDER', data)
    setBackOrder(data)
  }

  return {
    backOrder,
    backOrders,
    paginationData,
    $resetBackOrder,
    getAllBackOrder,
    addBackOrder,
    updateBackOrder,
    getBackOrder
  }
})
