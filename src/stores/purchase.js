
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllPurchase } from '@/api/purchase'

export const usePurchaseStore = defineStore('purchase', () => {
  const purchase = reactive({
    notes: 'PURCHASE ITEM FROM SELLER KM',
    status: 'REVIEW',
    totalPurchase: 10000000,
    spareparts: [
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unitPrice: 494000,
        totalPrice: 1482000
      },
      {
        partName: 'BEARING SET, CON ROD',
        partNumber: '30L19-342289',
        quantity: 3,
        unitPrice: 494000,
        totalPrice: 1482000
      },
    ]
  })
  const purchases = ref([
    {
      id: '1',
      name: 'BMJ-PU/01/V/2024',
      date: '21  Mei 2020',
      status: 'On Review'
    },
    {
      id: '2',
      name: 'BMJ-PU/01/V/2024',
      date: '21  Mei 2020',
      status: 'Approved'
    },
    {
      id: '3',
      name: 'BMJ-PU/01/V/2024',
      date: '21  Mei 2020',
      status: 'Done'
    }
  ])

  function $resetPurchase () {
    purchase.status = ''
    purchase.notes = ''
    purchase.spareparts = []
  }

  async function getAllPurchaseByDate () {
    console.log('FETCH PURCHASE')
    // const response = await getAllPurchase()
    // purchases.value = response.body
  }

  async function addPurchase () {
    console.log('ADD PURCHASES', purchase)
    $resetPurchase()
  }

  return { purchase, purchases, $resetPurchase, getAllPurchaseByDate, addPurchase }
})
