import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import quotationApi from '@/api/quotation'
import { getAllSparepart } from '@/api/sparepart'

export const useQuotationStore = defineStore('quotation', () => {
  const quotation = reactive({
    id: '',
    slug: '',
    no_quotation: '',
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
    project: {
      noQuotation: '',
      type: ''
    },
    price: {
      subtotal: 0,
      ppn: 0,
      grandTotal: 0
    },
    status: '',
    notes: '',
    spareparts: [
      {
        partName: '',
        partNumber: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        stock: ''
      }
    ]
  })
  const quotations = ref([])
  const quotationReview = reactive({
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
    project: {
      noQuotation: '',
      type: ''
    },
    price: {
      subtotal: 0,
      ppn: 0,
      grandTotal: 0
    },
    status: '',
    notes: '',
    spareparts: [
      {
        partName: '',
        partNumber: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        stock: ''
      }
    ]
  })
  const quotationReviews = ref([])
  const paginationData = ref({})
  const searchedSpareparts = ref([])

  function $resetQuotation () {
    // Reset basic properties
    quotation.id = ''
    quotation.slug = ''
    quotation.no_quotation = ''
    quotation.status = ''
    quotation.notes = ''

    // Reset customer properties
    quotation.customer.companyName = ''
    quotation.customer.address = ''
    quotation.customer.city = ''
    quotation.customer.province = ''
    quotation.customer.office = ''
    quotation.customer.urban = ''
    quotation.customer.subdistrict = ''
    quotation.customer.postalCode = ''

    // Reset project properties
    quotation.project.noQuotation = ''
    quotation.project.type = ''

    // Reset price properties
    quotation.price.subtotal = 0
    quotation.price.ppn = 0
    quotation.price.grandTotal = 0

    // Reset spareparts array
    quotation.spareparts = []
  }

  function setQuotation (data) {
    // Set basic properties
    quotation.id = data.id || ''
    quotation.slug = data.slug || ''
    quotation.no_quotation = data.no_quotation || ''
    quotation.status = data.status || ''
    quotation.notes = data.notes || ''

    // Set customer properties
    quotation.customer.companyName = data.customer?.companyName || ''
    quotation.customer.address = data.customer?.address || ''
    quotation.customer.city = data.customer?.city || ''
    quotation.customer.province = data.customer?.province || ''
    quotation.customer.office = data.customer?.office || ''
    quotation.customer.urban = data.customer?.urban || ''
    quotation.customer.subdistrict = data.customer?.subdistrict || ''
    quotation.customer.postalCode = data.customer?.postalCode || ''

    // Set project properties
    quotation.project.noQuotation = data.project?.noQuotation || ''
    quotation.project.type = data.project?.type || ''

    // Set price properties
    quotation.price.subtotal = data.price?.subtotal || 0
    quotation.price.ppn = data.price?.ppn || 0
    quotation.price.grandTotal = data.price?.grandTotal || 0

    // Set spareparts array with proper mapping
    quotation.spareparts = (data.spareparts || []).map(sparepart => ({
      partName: sparepart.partName || '',
      partNumber: sparepart.partNumber || '',
      quantity: sparepart.quantity || 0,
      unitPrice: sparepart.unitPrice || 0,
      totalPrice: sparepart.totalPrice || 0,
      stock: sparepart.stock || ''
    }))
  }

  async function getAllQuotation (param) {
    console.log('FETCH QUOTATION', param)
    const { data } = await quotationApi.getAllQuotations(param)
    console.log("RES", data)
    quotations.value = data.data
    paginationData.value = data
  }

  async function getAllQuotationReview (param) {
    console.log('FETCH REVIEW QUOTATION BY DATE', param)
    const { data } = await quotationApi.getAllReviewQuotations(param)
    console.log("RES", data)
    quotationReviews.value = data.data
    paginationData.value = data
  }

  async function addQuotation () {
    console.log('ADD QUOTATION')
    $resetQuotation()
    // if requestPriceChange === true, add to request review,, do not add quotation
    const { data } = await quotationApi.addQuotation(quotation)
    console.log('SUCCESS ADD', data)
  }

  async function updateQuotation () {
    console.log('UPDATE QUOTATION')
    // const { data } = await quotationApi.updateQuotation(quotation.id, quotation)
    // setQuotation(data)
  }

  async function getQuotation (id) {
    console.log('slug', quotation.slug, 'id', id)
    if(quotation.slug !== id) $resetQuotation()
    const { data } = await quotationApi.getQuotationyId(id)
    console.log('GET QUOTATION', data)
    setQuotation(data)
  }

  async function processQuotation(id) {
    // const response = await quotationApi.processQuotation(id)
  }

  async function getSpareparts (param) {
    console.log('SEARCH SPAREPART', param)
    const { data } = await getAllSparepart(param)
    searchedSpareparts.value = data.data
    console.log("List Sparepart", data.data)
  }

  return {
    quotation,
    quotations,
    quotationReview,
    quotationReviews,
    paginationData,
    searchedSpareparts,
    $resetQuotation,
    setQuotation,
    getAllQuotation,
    getAllQuotationReview,
    addQuotation,
    updateQuotation,
    getQuotation,
    getSpareparts,
    processQuotation
  }
})
