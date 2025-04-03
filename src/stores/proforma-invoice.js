import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import proformaInvoiceApi from '@/api/pi'

export const useProformaInvoiceStore = defineStore('proforma-invoice', () => {
  const proformaInvoice = reactive({
    id: '',
    no_pi: '',
    project: {
      noProformaInvoice: '',
      type: ''
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
    downPayment: 0,
    notes: '',
    spareparts: []
  })
  const proformaInvoices = ref([])
  const paginationData = ref({})

  function $resetProformaInvoice () {
    // Reset basic properties
    proformaInvoice.id = ''
    proformaInvoice.no_pi = ''
    proformaInvoice.notes = ''
    proformaInvoice.downPayment = 0

    // Reset project properties
    proformaInvoice.project.noProformaInvoice = ''
    proformaInvoice.project.type = ''

    // Reset customer properties
    proformaInvoice.customer.companyName = ''
    proformaInvoice.customer.address = ''
    proformaInvoice.customer.city = ''
    proformaInvoice.customer.province = ''
    proformaInvoice.customer.office = ''
    proformaInvoice.customer.urban = ''
    proformaInvoice.customer.subdistrict = ''
    proformaInvoice.customer.postalCode = ''

    // Reset price properties
    proformaInvoice.price.amount = 0
    proformaInvoice.price.discount = 0
    proformaInvoice.price.subtotal = 0
    proformaInvoice.price.advancePayment = 0
    proformaInvoice.price.total = 0
    proformaInvoice.price.vat = 0
    proformaInvoice.price.totalAmount = 0

    // Reset spareparts array
    proformaInvoice.spareparts = []
  }

  function setProformaInvoice (data) {
    // Set basic properties with fallback values
    proformaInvoice.id = data.id || ''
    proformaInvoice.no_pi = data.no_pi || ''
    proformaInvoice.notes = data.notes || ''
    proformaInvoice.downPayment = data.downPayment || 0

    // Set project properties
    proformaInvoice.project.noProformaInvoice = data.project?.noProformaInvoice || ''
    proformaInvoice.project.type = data.project?.type || ''

    // Set customer properties
    proformaInvoice.customer.companyName = data.customer?.companyName || ''
    proformaInvoice.customer.address = data.customer?.address || ''
    proformaInvoice.customer.city = data.customer?.city || ''
    proformaInvoice.customer.province = data.customer?.province || ''
    proformaInvoice.customer.office = data.customer?.office || ''
    proformaInvoice.customer.urban = data.customer?.urban || ''
    proformaInvoice.customer.subdistrict = data.customer?.subdistrict || ''
    proformaInvoice.customer.postalCode = data.customer?.postalCode || ''

    // Set price properties
    proformaInvoice.price.amount = data.price?.amount || 0
    proformaInvoice.price.discount = data.price?.discount || 0
    proformaInvoice.price.subtotal = data.price?.subtotal || 0
    proformaInvoice.price.advancePayment = data.price?.advancePayment || 0
    proformaInvoice.price.total = data.price?.total || 0
    proformaInvoice.price.vat = data.price?.vat || 0
    proformaInvoice.price.totalAmount = data.price?.totalAmount || 0

    // Set spareparts array with proper mapping
    proformaInvoice.spareparts = (data.spareparts || []).map(sparepart => ({
      partName: sparepart.partName || '',
      partNumber: sparepart.partNumber || '',
      quantity: sparepart.quantity || 0,
      unit: sparepart.unit || '',
      unitPrice: sparepart.unitPrice || 0,
      amount: sparepart.amount || 0
    }))
  }

  async function getAllProformaInvoices(param) {
    const { data } = await proformaInvoiceApi.getAllProformaInvoice(param)
    proformaInvoices.value = data.data
    paginationData.value = data
    console.log('FETCH PROFORMA INVOICE', data)
  }

  async function getProformaInvoice(id) {
    const { data } = await proformaInvoiceApi.getProformaInvoiceById(id)
    setProformaInvoice(data)
  }

  async function addProformaInvoice() {
    await proformaInvoiceApi.addProformaInvoice(proformaInvoice)
    $resetProformaInvoice()
  }

  async function updateProformaInvoice() {
    const { data } = await proformaInvoiceApi.updateProformaInvoice(proformaInvoice.id, proformaInvoice)
    setProformaInvoice(data)
  }

  async function deleteProformaInvoice(id) {
    await proformaInvoiceApi.deleteProformaInvoice(id)
  }

  return {
    proformaInvoice,
    proformaInvoices,
    paginationData,
    $resetProformaInvoice,
    getAllProformaInvoices,
    getProformaInvoice,
    setProformaInvoice,
    updateProformaInvoice,
    deleteProformaInvoice,
    addProformaInvoice
  }
})
