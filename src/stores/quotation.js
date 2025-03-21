import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import quotationApi from '@/api/quotation'

export const useQuotationStore = defineStore('quotation', () => {
  const quotation = reactive({
    id: '',
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
      subtotal: 1482000,
      ppn: 82000,
      grandTotal: 1400000
    },
    status: '',
    notes: '',
    spareparts: [
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unitPrice: 494000,
        totalPrice: 1482000,
        stock: 'INDENT'
      },
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unitPrice: 494000,
        totalPrice: 1482000,
        stock: 'INDENT'
      }
    ]
  })
  const quotations = ref([
    {
      id: '1',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'Process'
    },
    {
      id: '2',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'On Review'
    },
    {
      id: '3',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'Cancelled'
    },
    {
      id: '4',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'Revised'
    },
    {
      id: '5',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'PO'
    }
  ])
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
      subtotal: 1482000,
      ppn: 82000,
      grandTotal: 1400000
    },
    status: '',
    notes: '',
    spareparts: [
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unit: 'pcs',
        unitPrice: 494000,
        totalPrice: 1482000,
        stock: 'INDENT'
      },
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unit: 'pcs',
        unitPrice: 494000,
        totalPrice: 1482000,
        stock: 'INDENT'
      }
    ]
  })
  const quotationReviews = ref([
    {
      id: '1',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'Ready'
    },
    {
      id: '2',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'Ready'
    },
    {
      id: '3',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'Ready'
    }
  ])
  const paginationData = ref({})

  function $resetQuotation () {
    quotation.customer.companyName = ''
    quotation.customer.address = ''
    quotation.customer.city = ''
    quotation.customer.province = ''
    quotation.customer.office = ''
    quotation.customer.urban = '',
    quotation.customer.subdistrict = '',
    quotation.customer.postalCode = ''
    quotation.project.noQuotation = '',
    quotation.project.type = ''
    quotation.price.subtotal = 0,
    quotation.price.ppn = 0,
    quotation.price.grandTotal = 0
    quotation.notes = ''
    quotation.spareparts = []
  }

  function setQuotation (data) {
    quotation.customer.companyName = data.customer.companyName
    quotation.customer.address = data.customer.address
    quotation.customer.city = data.customer.city
    quotation.customer.province = data.customer.province
    quotation.customer.office = data.customer.office
    quotation.customer.urban = data.customer.urban
    quotation.customer.subdistrict = data.customer.subdistrict
    quotation.customer.postalCode = data.customer.postalCode
    quotation.project.noQuotation = data.project.noQuotation
    quotation.project.type = data.project.type
    quotation.price.subtotal = data.price.subtotal
    quotation.price.ppn = data.price.ppn
    quotation.price.grandTotal = data.price.grandTotal
    quotation.notes = data.notes
    quotation.spareparts = data.spareparts
  }

  async function getAllQuotation (param) {
    console.log('FETCH QUOTATION BY DATE', param)
    const response = await quotationApi.getAllQuotations(param)
    console.log("RES", response)
    quotations.value = response
  }

  async function getAllQuotationReview (month, year) {
    console.log('FETCH REVIEW QUOTATION BY DATE', month, year)
    // const response = await getAllReviewQuotations({ month, year })
    // quotationReviews.value = response.body
  }

  async function addQuotation () {
    console.log('ADD QUOTATION')
    $resetQuotation()
    // if requestPriceChange === true, add to request review,, do not add quotation
    // const response = await addQuotationApi(quotation)
  }

  async function updateQuotation () {
    console.log('UPDATE QUOTATION')
    // const { data } = await quotationApi.updateQuotation(quotation.id, quotation)
    // setQuotation(data)
  }

  async function getQuotation (id) {
    const response = await quotationApi.getQuotationyId(id)
    console.log('GET QUOTATION', response)
    // const { data } = await quotationApi.getQuotationyId(id)
    setQuotation(response)
  }

  async function processQuotation(id) {
    // const response = await quotationApi.processQuotation(id)
  }

  return {
    quotation,
    quotations,
    quotationReview,
    quotationReviews,
    paginationData,
    $resetQuotation,
    setQuotation,
    getAllQuotation,
    getAllQuotationReview,
    addQuotation,
    updateQuotation,
    getQuotation,
    processQuotation
  }
})
