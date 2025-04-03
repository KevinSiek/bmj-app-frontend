import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import purchaseOrderApi from '@/api/purchase-order'

export const usePurchaseOrderStore = defineStore('purchase-order', () => {
  const purchaseOrder = reactive({
    id: '',
    no_po: '',
    purchaseOrder: {
      no: '',
      date: '',
      type: ''
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
    price: {
      amount: 0,
      discount: 0,
      subtotal: 0,
      advancePayment: 0,
      total: 0,
      vat: 0,
      totalAmount: 0
    },
    notes: '',
    downPayment: 0,
    spareparts: []
  })
  const purchaseOrders = ref([])
  const paginationData = ref({})

  function $resetPurchaseOrder () {
    // Reset basic properties
    purchaseOrder.id = ''
    purchaseOrder.no_po = ''
    purchaseOrder.notes = ''
    purchaseOrder.downPayment = 0

    // Reset purchaseOrder properties
    purchaseOrder.purchaseOrder.no = ''
    purchaseOrder.purchaseOrder.date = ''
    purchaseOrder.purchaseOrder.type = ''

    // Reset proformaInvoice properties
    purchaseOrder.proformaInvoice.no = ''
    purchaseOrder.proformaInvoice.date = ''

    // Reset customer properties
    purchaseOrder.customer.companyName = ''
    purchaseOrder.customer.address = ''
    purchaseOrder.customer.city = ''
    purchaseOrder.customer.province = ''
    purchaseOrder.customer.office = ''
    purchaseOrder.customer.urban = ''
    purchaseOrder.customer.subdistrict = ''
    purchaseOrder.customer.postalCode = ''

    // Reset price properties
    purchaseOrder.price.amount = 0
    purchaseOrder.price.discount = 0
    purchaseOrder.price.subtotal = 0
    purchaseOrder.price.advancePayment = 0
    purchaseOrder.price.total = 0
    purchaseOrder.price.vat = 0
    purchaseOrder.price.totalAmount = 0

    // Reset spareparts array
    purchaseOrder.spareparts = []
  }

  function setPurchaseOrder (data) {
    // Set basic properties with fallback values
    purchaseOrder.id = data.id || ''
    purchaseOrder.no_po = data.no_po || ''
    purchaseOrder.notes = data.notes || ''
    purchaseOrder.downPayment = data.downPayment || 0

    // Set purchaseOrder properties
    purchaseOrder.purchaseOrder.no = data.purchaseOrder?.no || ''
    purchaseOrder.purchaseOrder.date = data.purchaseOrder?.date || ''
    purchaseOrder.purchaseOrder.type = data.purchaseOrder?.type || ''

    // Set proformaInvoice properties
    purchaseOrder.proformaInvoice.no = data.proformaInvoice?.no || ''
    purchaseOrder.proformaInvoice.date = data.proformaInvoice?.date || ''

    // Set customer properties
    purchaseOrder.customer.companyName = data.customer?.companyName || ''
    purchaseOrder.customer.address = data.customer?.address || ''
    purchaseOrder.customer.city = data.customer?.city || ''
    purchaseOrder.customer.province = data.customer?.province || ''
    purchaseOrder.customer.office = data.customer?.office || ''
    purchaseOrder.customer.urban = data.customer?.urban || ''
    purchaseOrder.customer.subdistrict = data.customer?.subdistrict || ''
    purchaseOrder.customer.postalCode = data.customer?.postalCode || ''

    // Set price properties
    purchaseOrder.price.amount = data.price?.amount || 0
    purchaseOrder.price.discount = data.price?.discount || 0
    purchaseOrder.price.subtotal = data.price?.subtotal || 0
    purchaseOrder.price.advancePayment = data.price?.advancePayment || 0
    purchaseOrder.price.total = data.price?.total || 0
    purchaseOrder.price.vat = data.price?.vat || 0
    purchaseOrder.price.totalAmount = data.price?.totalAmount || 0

    // Set spareparts array with proper mapping
    purchaseOrder.spareparts = (data.spareparts || []).map(sparepart => ({
      partName: sparepart.partName || '',
      partNumber: sparepart.partNumber || '',
      quantity: sparepart.quantity || 0,
      unit: sparepart.unit || '',
      unitPrice: sparepart.unitPrice || 0,
      amount: sparepart.amount || 0
    }))
  }

  async function getAllPurchaseOrders(param) {
    const { data } = await purchaseOrderApi.getAllPurchaseOrder(param)
    purchaseOrders.value = data.data
    paginationData.value = data
    console.log('FETCH PURCHASE ORDER', data)
  }

  async function getPurchaseOrder(id) {
    const { data } = await purchaseOrderApi.getPurchaseOrderById(id)
    setPurchaseOrder(data)
  }

  async function addPurchaseOrder() {
    await purchaseOrderApi.addPurchaseOrder(purchaseOrder)
    $resetPurchaseOrder()
  }

  async function updatePurchaseOrder() {
    const { data } = await purchaseOrderApi.updatePurchaseOrder(purchaseOrder.id, purchaseOrder)
    setPurchaseOrder(data)
  }

  async function deletePurchaseOrder(id) {
    await purchaseOrderApi.deletePurchaseOrder(id)
  }

  return {
    purchaseOrder,
    purchaseOrders,
    paginationData,
    $resetPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrder,
    setPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    addPurchaseOrder
  }
})
