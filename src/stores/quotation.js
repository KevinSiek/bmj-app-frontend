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

  function mapQuotation(data) {
    // CRITICAL FIX: Add detailed logging and error handling for data mapping
    console.log('MAPPING QUOTATION DATA:', data)
    
    if (!data) {
      console.warn('No data provided to mapQuotation')
      return createEmptyQuotation()
    }

    const mapped = {
      id: data?.id || '',
      slug: data?.slug || '',
      version: data?.version || 0,
      customer: {
        companyName: data?.customer?.company_name || data?.customer?.companyName || '',
        address: data?.customer?.address || '',
        city: data?.customer?.city || '',
        province: data?.customer?.province || '',
        office: data?.customer?.office || '',
        urban: data?.customer?.urban || '',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || data?.customer?.postalCode || ''
      },
      project: {
        quotationNumber: data?.project?.quotation_number || data?.quotation_number || '',
        type: data?.project?.type || data?.type || '',
        date: data?.project?.date || data?.date || '',
        // CRITICAL FIX: Fix branch mapping with multiple fallbacks
        branch: data?.project?.branch || data?.branch || data?.project_branch || '',
      },
      discount: data?.discount || 0,
      ppn: data?.ppn || 0,
      price: {
        amount: data?.price?.amount || data?.amount || 0,
        discount: data?.price?.discount || data?.discount || 0,
        ppn: data?.price?.ppn || data?.ppn || 0,
        subtotal: data?.price?.subtotal || data?.subtotal || 0,
        grandTotal: data?.price?.grand_total || data?.price?.grandTotal || data?.grand_total || 0
      },
      currentStatus: data?.current_status || data?.currentStatus || '',
      status: data?.status || [],
      notes: data?.notes || '',
      spareparts: (data?.spareparts || data?.detail_quotations?.filter(d => d.type === 'sparepart') || []).map(sparepart => ({
        sparepartId: sparepart?.sparepart_id || sparepart?.sparepartId || sparepart?.id || '',
        sparepartName: sparepart?.sparepart_name || sparepart?.sparepartName || sparepart?.name || '',
        sparepartNumber: sparepart?.sparepart_number || sparepart?.sparepartNumber || sparepart?.part_number || '',
        quantity: sparepart?.quantity || 0,
        unitPriceSell: sparepart?.unit_price_sell || sparepart?.unitPriceSell || sparepart?.selling_price || 0,
        totalPrice: sparepart?.total_price || sparepart?.totalPrice || 0,
        stock: sparepart?.stock || ''
      })),
      services: (data?.services || data?.detail_quotations?.filter(d => d.type === 'service') || []).map(service => ({
        service: service?.service || service?.service_name || service?.name || '',
        unitPriceSell: service?.unit_price_sell || service?.unitPriceSell || service?.price || 0,
        quantity: service?.quantity || 0,
        totalPrice: service?.total_price || service?.totalPrice || 0,
      }))
    }
    
    console.log('MAPPED QUOTATION RESULT:', mapped)
    return mapped
  }

  function createEmptyQuotation() {
    return {
      id: '',
      slug: '',
      version: 0,
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
        quotationNumber: '',
        type: '',
        date: '',
        branch: '',
      },
      discount: 0,
      ppn: 0,
      price: {
        amount: 0,
        discount: 0,
        ppn: 0,
        subtotal: 0,
        grandTotal: 0
      },
      currentStatus: '',
      status: [],
      notes: '',
      spareparts: [],
      services: []
    }
  }

  function mapQuotations(data) {
    return {
      quotationNumber: data?.quotation_number || '',
      versions: (data?.versions || []).map(mapQuotation)
    }
  }

  function mapSparepart(data) {
    return {
      sparepartId: data?.sparepart_id || data?.id || '',
      slug: data?.slug || '',
      sparepartNumber: data?.sparepart_number || '',
      sparepartName: data?.sparepart_name || '',
      totalUnit: (data?.totalUnit || []).map(branch => ({
        name: branch?.name || '',
        stock: branch?.stock || 0
      })),
      unitPriceSell: data?.unit_price_sell || 0,
      unitPriceSeller: (data?.unit_price_seller || []).map(buy => ({
        seller: buy?.seller || '',
        price: buy?.price || 0
      }))
    }
  }

  async function getAllQuotation(param) {
    isLoading.value = true
    const { data } = await quotationApi.getAllQuotations(param)
    // Group by invoice number
    const grouped = {}
    data.data.forEach(item => {
      const key = item.project.quotation_number
      if (!grouped[key]) {
        grouped[key] = {
          quotationNumber: key,
          versions: []
        }
      }
      grouped[key].versions.push(mapQuotation(item))
    })
    quotations.value = Object.values(grouped)
    paginationData.value = data
    isLoading.value = false
  }

  // CRITICAL FIX: Enhanced getQuotation with error handling and logging
  async function getQuotation(id) {
    try {
      console.log('FETCHING QUOTATION WITH ID:', id)
      const { data } = await quotationApi.getQuotationyId(id)
      console.log('RAW API RESPONSE:', data)
      
      if (!data) {
        console.error('No data returned from getQuotationyId API')
        quotation.value = createEmptyQuotation()
        return
      }
      
      quotation.value = mapQuotation(data)
      console.log('FINAL MAPPED QUOTATION:', quotation.value)
      
    } catch (error) {
      console.error('ERROR FETCHING QUOTATION:', error)
      console.error('Failed to load quotation with ID:', id)
      // Set empty quotation to prevent undefined errors
      quotation.value = createEmptyQuotation()
      throw error
    }
  }

  async function getQuotationReview(id) {
    try {
      console.log('FETCHING QUOTATION REVIEW WITH ID:', id)
      const { data } = await quotationApi.getQuotationyId(id)
      console.log('RAW API RESPONSE FOR REVIEW:', data)
      quotationReview.value = mapQuotation(data)
    } catch (error) {
      console.error('ERROR FETCHING QUOTATION REVIEW:', error)
      quotationReview.value = createEmptyQuotation()
      throw error
    }
  }

  async function getAllQuotationReview(param) {
    isLoading.value = true
    console.log('FETCH REVIEW QUOTATION BY DATE', param)
    const { data } = await quotationApi.getAllReviewQuotations(param)
    console.log("RES", data)
    quotationReviews.value = data.data.map(mapQuotation)
    paginationData.value = data
    isLoading.value = false
  }

  async function addQuotation() {
    const data = await quotationApi.addQuotation(quotation.value)
    // if requestPriceChange === true, add to request review,, do not add quotation
  }

  async function setQuotation(selectedQuotation) {
    quotation.value = selectedQuotation
  }

  async function setQuotationReview(selectedQuotation) {
    quotationReview.value = selectedQuotation
  }

  async function editQuotation() {
    console.log('UPDATE QUOTATION')
    console.log('data', quotation.value)
    await quotationApi.updateQuotation(quotation.value.slug, quotation.value)
  }

  async function processQuotation(id, notes) {
    console.log('ID', id)
    const response = await quotationApi.processQuotation(id, { notes })
    console.log('RES', response)
  }

  async function approveQuotation(id) {
    console.log('APPROVE QUOTATION')
    await quotationApi.approveQuotation(id)
  }

  async function needChangeQuotation(id) {
    await quotationApi.needChangeQuotation(id)
  }

  async function rejectQuotation(id) {
    await quotationApi.rejectQuotation(id)
  }

  async function getSpareparts(param) {
    console.log('SEARCH SPAREPART', param)
    const { data } = await getAllSparepart(param)
    console.log('RETURN SPAREPARTS', data)
    searchedSpareparts.value = data.data.map(mapSparepart)
    console.log("List Sparepart", searchedSpareparts.value)
  }

  // CRITICAL FIX: Enhanced reset function with proper initialization
  async function $resetQuotation() {
    quotation.value = createEmptyQuotation()
    console.log('RESET QUOTATION DATA:', quotation.value)
  }

  async function $resetQuotationReview() {
    console.log('RESET QUOTATION REVIEW')
    quotationReview.value = createEmptyQuotation()
    console.log('RESET QUOTATION REVIEW DATA:', quotationReview.value)
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