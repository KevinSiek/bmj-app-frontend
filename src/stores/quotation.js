import { ref } from 'vue'
import { defineStore } from 'pinia'
import quotationApi from '@/api/quotation'
import { getAllSparepart } from '@/api/sparepart'

export const useQuotationStore = defineStore('quotation', () => {
  const quotation = ref(mapQuotation())
  const quotations = ref([])
  const quotationReview = ref(null)
  const quotationReviews = ref([])
  const paginationData = ref({})
  const searchedSpareparts = ref([])
  const isLoading = ref(true)
  const isDirty = ref(false)

  function mapQuotation(data) {
    return {
      id: data?.id || '',
      slug: data?.slug || '',
      version: data?.version || 0,
      customer: {
        companyName: data?.customer.company_name || '',
        address: data?.customer.address || '',
        city: data?.customer.city || '',
        province: data?.customer.province || '',
        office: data?.customer.office || '',
        urban: data?.customer.urban || '',
        subdistrict: data?.customer?.subdistrict || '',
        postalCode: data?.customer?.postal_code || '',
        email: data?.customer?.email || ''
      },
      project: {
        quotationNumber: data?.project?.quotation_number || '',
        type: data?.project?.type || '',
        date: data?.project?.date || '',
        branch: data?.branch || '',
      },
      discount: data?.discount || 0,
      ppn: data?.ppn || 0,
      price: {
        amount: data?.price?.amount || 0,
        discount: data?.price?.discount || 0,
        totalDiscountPercent: Number(data?.price?.total_discount_percent) || 0,
        ppn: data?.price?.ppn || 0,
        subtotal: data?.price?.subtotal || 0,
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
      })),
      services: (data?.services || []).map(service => ({
        service: service?.service || '',
        unitPriceSell: service?.unit_price_sell || '',
        quantity: service?.quantity || 0,
        totalPrice: service?.total_price || 0,
      }))
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
      totalUnit: Object.fromEntries(
        (data?.total_unit || []).map(branch => [branch?.name || '', branch?.stock || 0])
      ),
      unitPriceSell: data?.unit_price_sell || 0,
      unitPriceSeller: (data?.unit_price_seller || []).map(buy => ({
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

  async function getAllQuotation(param) {
    isLoading.value = true
    const { data } = await quotationApi.getAllQuotations(param)
    const grouped = {}

    // Group first
    data.data.forEach(item => {
      const mapped = mapQuotation(item)
      const key = mapped.project.quotationNumber

      if (!grouped[key]) {
        grouped[key] = {
          quotationNumber: key,
          versions: []
        }
      }

      grouped[key].versions.push(mapped)
    })

    quotations.value = Object.values(grouped)
    paginationData.value = data
    isLoading.value = false
  }

  async function getQuotation(id) {
    const { data } = await quotationApi.getQuotationyId(id)
    console.log('GET QUOTATION', data)
    quotation.value = mapQuotation(data)
  }

  async function getQuotationReview(id) {
    const { data } = await quotationApi.getQuotationyId(id)
    console.log('GET QUOTATION', data)
    quotationReview.value = mapQuotation(data)
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

  async function processQuotation(id, notes, poNumber) {
    await quotationApi.processQuotation(id, { notes, poNumber })
  }

  async function approveQuotation(id) {
    console.log('APPROVE QUOTATION')
    await quotationApi.approveQuotation(id)
  }

  async function needChangeQuotation(id, notes) {
    await quotationApi.needChangeQuotation(id, notes)
  }

  async function rejectQuotation(id, notes) {
    await quotationApi.rejectQuotation(id, notes)
  }

  async function getSpareparts(param) {
    console.log('SEARCH SPAREPART', param)
    const { data } = await getAllSparepart(param)
    console.log('RETURN SPAREPARTS', data)
    searchedSpareparts.value = data.data.map(mapSparepart)
    console.log("List Sparepart", searchedSpareparts.value)
  }

  function validateQuotation() {
    const q = quotation.value
    if (!q) return 'Quotation data is empty.'
    
    // Project Type
    if (!q.project?.type) return 'Project Type is required.'
    if (!['Spareparts', 'Service'].includes(q.project.type)) return 'Invalid Project Type.'

    // Branch
    if (!q.project?.branch) return 'Branch is required.'

    // Customer Details
    if (!q.customer?.companyName?.trim()) return 'Customer Company Name is required.'
    if (!q.customer?.office?.trim()) return 'Customer Office is required.'
    if (!q.customer?.address?.trim()) return 'Customer Address is required.'
    if (!q.customer?.city?.trim()) return 'Customer City is required.'
    if (!q.customer?.province?.trim()) return 'Customer Province is required.'
    if (!q.customer?.urban?.trim()) return 'Customer Urban/Village is required.'
    if (!q.customer?.subdistrict?.trim()) return 'Customer Subdistrict is required.'
    
    if (!q.customer?.postalCode) return 'Customer Postal Code is required.'
    if (isNaN(Number(q.customer.postalCode))) return 'Customer Postal Code must be numeric.'

    if (q.customer?.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(q.customer.email.trim())) {
        return 'Customer Email format is invalid.'
      }
    }

    // Discount
    const discountPercent = Number(q.price?.totalDiscountPercent)
    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return 'Total Discount Percent must be a number between 0 and 100.'
    }

    // Type specific items
    if (q.project.type === 'Spareparts') {
      if (!q.spareparts || q.spareparts.length === 0) {
        return 'Quotation must contain at least one sparepart.'
      }
      for (let i = 0; i < q.spareparts.length; i++) {
        const sp = q.spareparts[i]
        const label = `Sparepart #${i + 1}`
        if (!sp.sparepartName?.trim()) return `${label}: Name is required.`
        if (!sp.sparepartId) return `${label} (${sp.sparepartName}): Please select from the search suggestions to link a valid sparepart ID.`
        
        const qty = Number(sp.quantity)
        if (!sp.quantity || isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
          return `${label} (${sp.sparepartName}): Quantity must be an integer greater than or equal to 1.`
        }
        
        const price = Number(sp.unitPriceSell)
        if (isNaN(price) || price < 1) {
          return `${label} (${sp.sparepartName}): Unit Price must be greater than or equal to 1.`
        }
      }
    } else if (q.project.type === 'Service') {
      if (!q.services || q.services.length === 0) {
        return 'Quotation must contain at least one service.'
      }
      for (let i = 0; i < q.services.length; i++) {
        const s = q.services[i]
        const label = `Service #${i + 1}`
        if (!s.service?.trim()) return `${label}: Service Name is required.`
        
        const qty = Number(s.quantity)
        if (!s.quantity || isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
          return `${label}: Quantity must be an integer greater than or equal to 1.`
        }
        
        const price = Number(s.unitPriceSell)
        if (isNaN(price) || price < 1) {
          return `${label}: Unit Price must be greater than or equal to 1.`
        }
      }
    }

    return null
  }

  async function $resetQuotation() {
    quotation.value = mapQuotation()
    isDirty.value = false
    console.log('DATA', quotation.value)
  }

  async function $resetQuotations() {
    quotations.value = []
  }

  async function $resetQuotationReview() {
    console.log('RESET QUOTATION REVIEW')
    quotationReview.value = mapQuotation()
    isDirty.value = false
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
    $resetQuotations,
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
    rejectQuotation,
    validateQuotation,
    isDirty
  }
})
