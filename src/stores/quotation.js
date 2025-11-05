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
    // CRITICAL FIX: Handle empty data gracefully
    if (!data) {
      return createEmptyQuotation()
    }
    
    return {
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
        // CRITICAL FIX: Multiple branch mapping fallbacks
        branch: data?.project?.branch || data?.branch || data?.project_branch || '',
      },
      discount: data?.discount || 0,
      ppn: data?.ppn || 0,
      price: {
        amount: data?.price?.amount || 0,
        discount: data?.price?.discount || 0,
        ppn: data?.price?.ppn || 0,
        subtotal: data?.price?.subtotal || 0,
        grandTotal: data?.price?.grand_total || data?.price?.grandTotal || 0
      },
      currentStatus: data?.current_status || data?.currentStatus || '',
      status: data?.status || [],
      notes: data?.notes || '',
      spareparts: (data?.spareparts || []).map(sparepart => ({
        sparepartId: sparepart?.sparepart_id || sparepart?.id || sparepart?.sparepartId || '',
        sparepartName: sparepart?.sparepart_name || sparepart?.sparepartName || sparepart?.name || '',
        sparepartNumber: sparepart?.sparepart_number || sparepart?.sparepartNumber || sparepart?.part_number || '',
        quantity: sparepart?.quantity || 0,
        unitPriceSell: sparepart?.unit_price_sell || sparepart?.unitPriceSell || 0,
        totalPrice: sparepart?.total_price || sparepart?.totalPrice || 0,
        stock: sparepart?.stock || ''
      })),
      services: (data?.services || []).map(service => ({
        service: service?.service || service?.name || '',
        unitPriceSell: service?.unit_price_sell || service?.unitPriceSell || 0,
        quantity: service?.quantity || 0,
        totalPrice: service?.total_price || service?.totalPrice || 0,
      }))
    }
  }

  // CRITICAL FIX: Create empty quotation structure to prevent undefined errors
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

  // CRITICAL FIX: Enhanced getQuotation function with comprehensive error handling and debugging
  async function getQuotation(id) {
    try {
      console.log('FETCHING QUOTATION WITH ID:', id)
      
      // Validate ID parameter
      if (!id) {
        console.error('ERROR: No quotation ID provided')
        quotation.value = createEmptyQuotation()
        return
      }
      
      const { data } = await quotationApi.getQuotationyId(id)
      console.log('RAW API RESPONSE:', data)
      
      // Check if API returned data
      if (!data) {
        console.error('ERROR: No data returned from getQuotationyId API')
        quotation.value = createEmptyQuotation()
        return
      }
      
      // Apply enhanced mapping with fallbacks
      quotation.value = mapQuotation(data)
      console.log('FINAL MAPPED QUOTATION:', quotation.value)
      
      // Validate critical fields are mapped
      if (!quotation.value.project.quotationNumber) {
        console.warn('WARNING: quotationNumber not found in mapped data')
        console.warn('Available fields:', Object.keys(data))
      }
      
    } catch (error) {
      console.error('ERROR FETCHING QUOTATION:', error)
      console.error('Error details:', error.message)
      quotation.value = createEmptyQuotation()
      throw error
    }
  }

  // CRITICAL FIX: Enhanced getQuotationReview with same error handling
  async function getQuotationReview(id) {
    try {
      console.log('FETCHING QUOTATION REVIEW WITH ID:', id)
      
      if (!id) {
        console.error('ERROR: No quotation review ID provided')
        quotationReview.value = createEmptyQuotation()
        return
      }
      
      const { data } = await quotationApi.getQuotationyId(id)
      console.log('RAW API RESPONSE (REVIEW):', data)
      
      if (!data) {
        console.error('ERROR: No data returned from getQuotationyId API (review)')
        quotationReview.value = createEmptyQuotation()
        return
      }
      
      quotationReview.value = mapQuotation(data)
      console.log('FINAL MAPPED QUOTATION REVIEW:', quotationReview.value)
      
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

  // CRITICAL FIX: Enhanced reset function using createEmptyQuotation
  async function $resetQuotation() {
    quotation.value = createEmptyQuotation()
    console.log('RESET QUOTATION DATA:', quotation.value)
  }

  // CRITICAL FIX: Enhanced reset review function
  async function $resetQuotationReview() {
    console.log('RESET QUOTATION REVIEW')
    quotationReview.value = createEmptyQuotation()
    console.log('RESET REVIEW DATA:', quotationReview.value)
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