import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllInvoice } from '@/api/invoice'

export const useInvoiceStore = defineStore('invoice', () => {
  const invoice = reactive({
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
      subtotal: 1482000,
      ppn: 82000,
      grandTotal: 1400000
    },
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
      },
    ]
  })
  const invoices = ref([
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

  function $resetInvoice () {
    invoice.purchaseOrder.no = ''
    invoice.purchaseOrder.date = ''
    invoice.purchaseOrder.type = ''
    invoice.purchaseOrder.paymentDue = ''
    invoice.purchaseOrder.discount = ''
    invoice.invoice.no = ''
    invoice.invoice.date = ''
    invoice.invoice.termOfPayment = ''
    invoice.invoice.subTotal = ''
    invoice.invoice.grandTotal = ''
    invoice.customer.companyName = ''
    invoice.customer.address = ''
    invoice.customer.city = ''
    invoice.customer.province = ''
    invoice.customer.office = ''
    invoice.customer.urban = '',
    invoice.customer.subdistrict = '',
    invoice.customer.postalCode = ''
    invoice.price.subtotal = ''
    invoice.price.ppn = ''
    invoice.price.grandTotal = ''
    invoice.notes
    invoice.spareparts = []
  }

  async function getAllInvoicesByDate () {
    console.log('FETCH INVOICE')
    // const response = await getAllInvoice()
    // invoices.value = response.body
  }

  return { invoice, invoices, $resetInvoice, getAllInvoicesByDate }
})
