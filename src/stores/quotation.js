import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllQuotations, getAllReviewQuotations, addQuotation as addQuotationApi, getQuotationyId } from '@/api/quotation'

export const useQuotationStore = defineStore('quotation', () => {
  const quotation = reactive({
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
  const requestPriceChanges = ref(false)

  async function getAllQuotationByDate (month, year) {
    console.log('FETCH QUOTATION BY DATE', month, year)
    // const response = await getAllQuotations({ month, year })
    // quotations.value = response.body
  }

  async function getAllQuotationReviewByDate (month, year) {
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

  async function editQuotation () {
    console.log('EDIT QUOTATION')
    // const response = await addQuotationApi(quotation)
    // getQuotationyId(quotation.id)
  }

  async function getQuotation () {
    console.log('GET QUOTATION')
    // const response = await addQuotationApi(quotation)
  }

  return {
    quotation,
    quotations,
    quotationReview,
    quotationReviews,
    requestPriceChanges,
    $resetQuotation,
    getAllQuotationByDate,
    getAllQuotationReviewByDate,
    addQuotation,
    editQuotation,
    getQuotation
  }
})
