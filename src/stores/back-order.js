import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllBackOrder } from '@/api/back-order'

export const useBackOrderStore = defineStore('back-order', () => {
  const backOrder = reactive({
    purchaseOrder: {
      no: '',
      date: '',
      orderType: ''
    },
    deliveryOrder: {
      no: '',
      date: '',
      shipMode: ''
    },
    customer: {
      companyName: '',
      address: '',
      city: '',
      province: '',
      office: '',
      urban: '',
      subdistrict: '',
      postalCode: '',
      npwp: '',
      delivery: ''
    },
    notes: '',
    spareparts: [
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        order: 3,
        deliveryOrder: 0,
        backOrder: 3
      },
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        order: 3,
        deliveryOrder: 2,
        backOrder: 1
      }
    ]
  })
  const backOrders = ref([
    {
      id: '1',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      status: 'Ready'
    },
    {
      id: '2',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      status: 'Indent'
    },
    {
      id: '3',
      customer: 'PT.Sukses Selalu',
      date: '21  Mei 2020',
      status: 'Ready'
    }
  ])

  function $resetBackOrder () {
    backOrder.customer.companyName = ''
    backOrder.customer.address = ''
    backOrder.customer.city = ''
    backOrder.customer.province = ''
    backOrder.customer.office = ''
    backOrder.customer.urban = '',
    backOrder.customer.subdistrict = '',
    backOrder.customer.postalCode = ''
    backOrder.customer.npwp = ''
    backOrder.customer.delivery = ''
    backOrder.purchaseOrder.no = ''
    backOrder.purchaseOrder.date = ''
    backOrder.purchaseOrder.orderType = ''
    backOrder.deliveryOrder.no = ''
    backOrder.deliveryOrder.date = ''
    backOrder.deliveryOrder.shipMode = ''
    backOrder.notes = ''
    backOrder.spareparts = []
  }

  async function getBackOrderByDate (month, year) {
    console.log('FETCH BACK ORDER BY DATE', month, year)
    // const response = await getAllBackOrder({ month, year })
    // backOrders.value = response.body
  }

  return { backOrder, backOrders, $resetBackOrder, getBackOrderByDate }
})
