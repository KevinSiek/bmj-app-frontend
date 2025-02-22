import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllProformaInvoice } from '@/api/pi'

export const useProformaInvoiceStore = defineStore('proforma-invoice', () => {
  const proformaInvoice = reactive({
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
      amount: 1482000,
      discount: 10000,
      subtotal: 147200,
      advancePayment: 82000,
      total: 1400000,
      vat: 90000,
      totalAmount: 1360000
    },
    downPayment: 0,
    notes: '',
    spareparts: [
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unit: 'pcs',
        unitPrice: 494000,
        amount: 1482000
      },
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unit: 'pcs',
        unitPrice: 494000,
        amount: 1482000
      },
    ]
  })
  const proformaInvoices = ref([
    {
      id: '1',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods'
    },
    {
      id: '2',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods'
    },
    {
      id: '3',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods'
    }
  ])

  function $resetProformaInvoice () {
    proformaInvoice.project.noProformaInvoice = ''
    proformaInvoice.project.type = ''
    proformaInvoice.customer.companyName = ''
    proformaInvoice.customer.address = ''
    proformaInvoice.customer.city = ''
    proformaInvoice.customer.province = ''
    proformaInvoice.customer.office = ''
    proformaInvoice.customer.urban = '',
    proformaInvoice.customer.subdistrict = '',
    proformaInvoice.customer.postalCode = ''
    proformaInvoice.price.amount = 0
    proformaInvoice.price.discount = 0
    proformaInvoice.price.subtotal = 0
    proformaInvoice.price.advancePayment = 0
    proformaInvoice.price.total = 0
    proformaInvoice.price.vat = 0
    proformaInvoice.price.totalAmount = 0
    proformaInvoice.downPayment = 0
    proformaInvoice.notes = ''
    proformaInvoice.spareparts = []
  }

  async function getAllProformaInvoiceByDate () {
    console.log('FETCH PROFORMA INVOICE')
    // const response = await getAllProformaInvoice()
    // proformaInvoices.value = response.body
  }

  return { proformaInvoice, proformaInvoices, $resetProformaInvoice, getAllProformaInvoiceByDate }
})
