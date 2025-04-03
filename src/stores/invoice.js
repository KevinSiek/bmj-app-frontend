import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import invoiceApi from '@/api/invoice'

export const useInvoiceStore = defineStore('invoice', () => {
  const invoice = reactive({
    id: '',
    no_invoice: '',
    purchaseOrder: {
      no: '',
      date: '',
      type: '',
      paymentDue: '',
      discount: ''
    },
    invoice:{
      no: '',
      date: '',
      termOfPayment: '',
      subTotal: '',
      grandTotal: ''
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
    notes: '',
    price: {
      subtotal: 0,
      ppn: 0,
      grandTotal: 0
    },
    spareparts: []
  })
  const invoices = ref([])
  const paginationData = ref({})

  function $resetInvoice () {
    // Reset basic properties
    invoice.id = ''
    invoice.no_invoice = ''
    invoice.notes = ''

    // Reset purchaseOrder properties
    invoice.purchaseOrder.no = ''
    invoice.purchaseOrder.date = ''
    invoice.purchaseOrder.type = ''
    invoice.purchaseOrder.paymentDue = ''
    invoice.purchaseOrder.discount = ''

    // Reset invoice properties
    invoice.invoice.no = ''
    invoice.invoice.date = ''
    invoice.invoice.termOfPayment = ''
    invoice.invoice.subTotal = ''
    invoice.invoice.grandTotal = ''

    // Reset customer properties
    invoice.customer.companyName = ''
    invoice.customer.address = ''
    invoice.customer.city = ''
    invoice.customer.province = ''
    invoice.customer.office = ''
    invoice.customer.urban = ''
    invoice.customer.subdistrict = ''
    invoice.customer.postalCode = ''

    // Reset price properties
    invoice.price.subtotal = 0
    invoice.price.ppn = 0
    invoice.price.grandTotal = 0

    // Reset spareparts array
    invoice.spareparts = []
  }

  function setInvoice (data) {
    // Set basic properties with fallback values
    invoice.id = data.id || ''
    invoice.no_invoice = data.no_invoice || ''
    invoice.notes = data.notes || ''

    // Set purchaseOrder properties
    invoice.purchaseOrder.no = data.purchaseOrder?.no || ''
    invoice.purchaseOrder.date = data.purchaseOrder?.date || ''
    invoice.purchaseOrder.type = data.purchaseOrder?.type || ''
    invoice.purchaseOrder.paymentDue = data.purchaseOrder?.paymentDue || ''
    invoice.purchaseOrder.discount = data.purchaseOrder?.discount || ''

    // Set invoice properties
    invoice.invoice.no = data.invoice?.no || ''
    invoice.invoice.date = data.invoice?.date || ''
    invoice.invoice.termOfPayment = data.invoice?.termOfPayment || ''
    invoice.invoice.subTotal = data.invoice?.subTotal || ''
    invoice.invoice.grandTotal = data.invoice?.grandTotal || ''

    // Set customer properties
    invoice.customer.companyName = data.customer?.companyName || ''
    invoice.customer.address = data.customer?.address || ''
    invoice.customer.city = data.customer?.city || ''
    invoice.customer.province = data.customer?.province || ''
    invoice.customer.office = data.customer?.office || ''
    invoice.customer.urban = data.customer?.urban || ''
    invoice.customer.subdistrict = data.customer?.subdistrict || ''
    invoice.customer.postalCode = data.customer?.postalCode || ''

    // Set price properties
    invoice.price.subtotal = data.price?.subtotal || 0
    invoice.price.ppn = data.price?.ppn || 0
    invoice.price.grandTotal = data.price?.grandTotal || 0

    // Set spareparts array with proper mapping
    invoice.spareparts = (data.spareparts || []).map(sparepart => ({
      partName: sparepart.partName || '',
      partNumber: sparepart.partNumber || '',
      quantity: sparepart.quantity || 0,
      unit: sparepart.unit || '',
      unitPrice: sparepart.unitPrice || 0,
      totalPrice: sparepart.totalPrice || 0,
      stock: sparepart.stock || 0
    }))
  }

  async function getAllInvoices(param) {
    const { data } = await invoiceApi.getAllInvoice(param)
    invoices.value = data.data
    paginationData.value = data
    console.log('FETCH INVOICE', data)
  }

  async function getInvoice(id) {
    const { data } = await invoiceApi.getInvoiceById(id)
    setInvoice(data)
  }

  async function addInvoice() {
    await invoiceApi.addInvoice(invoice)
    $resetInvoice()
  }

  async function updateInvoice() {
    const { data } = await invoiceApi.updateInvoice(invoice.id, invoice)
    setInvoice(data)
  }

  async function deleteInvoice(id) {
    await invoiceApi.deleteInvoice(id)
  }

  return {
    invoice,
    invoices,
    paginationData,
    $resetInvoice,
    getAllInvoices,
    getInvoice,
    setInvoice,
    updateInvoice,
    deleteInvoice,
    addInvoice
  }
})
