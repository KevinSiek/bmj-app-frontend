import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllPurchaseOrder } from '@/api/purchase-order.'

export const usePurchaseOrderStore = defineStore('purchase-order', () => {
  const purchaseOrder = reactive({
    purchaseOrder: {
      no: '',
      date: '',
      type: ''
    },
    proformaInvoice: {
      no: '',
      date: ''
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
    notes: '',
    downPayment: 0,
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
  const purchaseOrders = ref([
    {
      id: '1',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      type: 'Goods',
      status: 'Prepare'
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
      status: 'Release'
    }
  ])

  function $resetPurchaseOrder () {
    purchaseOrder.purchaseOrder.no = ''
    purchaseOrder.purchaseOrder.date = ''
    purchaseOrder.purchaseOrder.type = ''
    purchaseOrder.proformaInvoice.no = ''
    purchaseOrder.proformaInvoice.date = ''
    purchaseOrder.customer.companyName = ''
    purchaseOrder.customer.address = ''
    purchaseOrder.customer.city = ''
    purchaseOrder.customer.province = ''
    purchaseOrder.customer.office = ''
    purchaseOrder.customer.urban = '',
    purchaseOrder.customer.subdistrict = '',
    purchaseOrder.customer.postalCode = ''
    purchaseOrder.price.amount = 0
    purchaseOrder.price.discount = 0
    purchaseOrder.price.subtotal = 0
    purchaseOrder.price.advancePayment = 0
    purchaseOrder.price.total = 0
    purchaseOrder.price.vat = 0
    purchaseOrder.price.totalAmount = 0
    purchaseOrder.downPayment = 0
    purchaseOrder.notes = ''
    purchaseOrder.spareparts = []

  }

  async function getAllPurchaseOrderByDate () {
    console.log('FETCH PROFORMA INVOICE')
    // const response = await getAllPurchaseOrder()
    // purchaseOrders.value = response.body
  }

  return { purchaseOrder, purchaseOrders, $resetPurchaseOrder, getAllPurchaseOrderByDate }
})
