import { ref } from 'vue'
import { defineStore } from 'pinia'
import quotationApi from '@/api/quotation'
import { getAllSparepart } from '@/api/sparepart'

export const useQuotationStore = defineStore('quotation', () => {
  const quotation = ref(null)
  const quotations = ref([])
  const quotationReview = ref(null)
  const quotationReviews = ref([])
  const paginationData = ref({})
  const searchedSpareparts = ref([])
  const isLoading = ref(false)

  function mapQuotation (data) {
    return {
      id: data?.id || '',
      slug: data?.slug || '',
      version: data?.version || '',
      customer: {
        companyName: data?.customer.company_name || '',
        address: data?.customer.address || '',
        city: data?.customer.city || '',
        province: data?.customer.province || '',
        office: data?.customer.office || '',
        urban: data?.customer.urban || '',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || ''
      },
      project: {
        quotationNumber: data?.project?.quotation_number || '',
        type: data?.project?.type || '',
        date: data?.project?.date || '',
      },
      price: {
        amount: data?.price.amount || 0,
        discount: data?.price.discount || 0,
        subtotal: data?.price?.subtotal || 0,
        ppn: data?.price?.ppn || 0,
        grandTotal: data?.price?.grand_total || 0
      },
      currentStatus: data?.current_status || '',
      status: data?.status || [],
      notes: data?.notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartId: sparepart?.sparepart_id || sparepart?.id || '',
        sparepartName: sparepart?.sparepart_name || '',
        sparepartNumber: sparepart?.sparepart_number || '',
        quantity: sparepart?.quantity || 0,
        unitPriceSell: sparepart?.unit_price_sell || 0,
        totalPrice: sparepart?.total_price || 0,
        stock: sparepart?.stock || ''
      }))
    }
  }

  function mapQuotations (data) {
    return {
      quotationNumber: data?.quotation_number || '',
      versions: (data?.versions || []).map(mapQuotation)
    }
  }

  function mapSparepart (data) {
    return {
      sparepartId: data?.sparepart_id || data?.id || '',
      slug: data?.slug || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || '',
      totalUnit: data?.total_unit || 0,
      unitPriceSell: data?.unit_price_sell || 0,
      unitPriceBuy: (data?.unit_price_buy || []).map(buy => ({
        seller: buy?.seller || '',
        price: buy?.price || 0
      }))
    }
  }

  // function setQuotation (data) {
  //   // Set basic properties
  //   quotation.id = data.id || ''
  //   quotation.slug = data.slug || ''
  //   quotation.quotation_number = data.quotation_number || ''
  //   quotation.status = data.status || ''
  //   quotation.notes = data.notes || ''

  //   // Set customer properties
  //   quotation.customer.companyName = data.customer?.companyName || ''
  //   quotation.customer.address = data.customer?.address || ''
  //   quotation.customer.city = data.customer?.city || ''
  //   quotation.customer.province = data.customer?.province || ''
  //   quotation.customer.office = data.customer?.office || ''
  //   quotation.customer.urban = data.customer?.urban || ''
  //   quotation.customer.subdistrict = data.customer?.subdistrict || ''
  //   quotation.customer.postalCode = data.customer?.postalCode || ''

  //   // Set project properties
  //   quotation.project.noQuotation = data.project?.noQuotation || ''
  //   quotation.project.type = data.project?.type || ''

  //   // Set price properties
  //   quotation.price.subtotal = data.price?.subtotal || 0
  //   quotation.price.ppn = data.price?.ppn || 0
  //   quotation.price.grandTotal = data.price?.grandTotal || 0

  //   // Set spareparts array with proper mapping
  //   quotation.spareparts = (data.spareparts || []).map(sparepart => ({
  //     partName: sparepart.partName || '',
  //     sparepart_number: sparepart.sparepart_number || '',
  //     quantity: sparepart.quantity || 0,
  //     unitPrice: sparepart.unitPrice || 0,
  //     totalPrice: sparepart.totalPrice || 0,
  //     stock: sparepart.stock || ''
  //   }))
  // }

  async function getAllQuotation (param) {
    isLoading.value = true
    const { data } = await quotationApi.getAllQuotations(param)
    quotations.value = data.data.map(mapQuotations)
    paginationData.value = data
    isLoading.value = false
  }

  async function getQuotation (id) {
    const { data } = await quotationApi.getQuotationyId(id)
    quotation.value = mapQuotation(data)
  }

  async function getQuotationReview (id) {
    const { data } = await quotationApi.getQuotationyId(id)
    console.log('GET QUOTATION', data)
    quotationReview.value = mapQuotation(data)
  }

async function getAllQuotationReview (param) {
    isLoading.value = true
    console.log('FETCH REVIEW QUOTATION BY DATE', param)
    const { data } = await quotationApi.getAllReviewQuotations(param)
    console.log("RES", data)
    quotationReviews.value = data.data.map(mapQuotation)
    paginationData.value = data
    isLoading.value = false
  }

  async function addQuotation () {
    const data = await quotationApi.addQuotation(quotation.value)
    // if requestPriceChange === true, add to request review,, do not add quotation
  }

  async function setQuotation (selectedQuotation) {
    quotation.value = selectedQuotation
  }

  async function setQuotationReview (selectedQuotation) {
    quotationReview.value = selectedQuotation
  }

  async function editQuotation () {
    console.log('UPDATE QUOTATION')
    console.log('data', quotation.value)
    await quotationApi.updateQuotation(quotation.value.slug, quotation.value)
  }

  async function processQuotation (id) {
    console.log('ID', id)
    const response = await quotationApi.processQuotation(id)
    console.log('RES', response)
  }

  async function approveQuotation (id) {
    console.log('APPROVE QUOTATION')
    await quotationApi.approveQuotation(id)
  }

  async function needChangeQuotation (id) {
    await quotationApi.needChangeQuotation(id)
  }

  async function rejectQuotation (id) {
    await quotationApi.rejectQuotation(id)
  }

  async function getSpareparts (param) {
    console.log('SEARCH SPAREPART', param)
    const { data } = await getAllSparepart(param)
    console.log('RETURN SPAREPARTS', data)
    searchedSpareparts.value = data.data.map(mapSparepart)
    console.log("List Sparepart", searchedSpareparts.value)
  }

  async function $resetQuotation () {
    quotation.value = mapQuotation()
    console.log('DATA', quotation.value)
  }

  async function $resetQuotationReview () {
    console.log('RESET QUOTATION REVIEW')
    quotationReview.value = mapQuotation()
    console.log('DATA', quotationReview.value)
  }

  return {
    quotation,
    isLoading,
    quotations,
    quotationReview,
    quotationReviews,
    paginationData,
    searchedSpareparts,
    $resetQuotation,
    $resetQuotationReview,
    getAllQuotation,
    getAllQuotationReview,
    addQuotation,
    setQuotation,
    setQuotationReview,
    editQuotation,
    getQuotation,
    getQuotationReview,
    getSpareparts,
    processQuotation,
    approveQuotation,
    needChangeQuotation,
    rejectQuotation
  }
})
