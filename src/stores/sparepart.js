import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getAllSparepart as getAllSparepartFromAPI } from '@/api/sparepart'

export const useSparepartStore = defineStore('sparepart', () => {
  const sparepart = reactive({
    sparepartName: '',
    stock: 0,
    partNumber: '',
    sellingPrice: 0,
    purchasesPrice: [
      {
        seller: 'AL',
        price: 10000
      },
      {
        seller: 'AI',
        price: 12000
      },
      {
        seller: 'KI',
        price: 11000
      }
    ]
  })
  const spareparts = ref([
    {
      partName: 'Fuel Injection',
      partNumber: 'AAD-10232412'
    },
    {
      partName: 'Bearing',
      partNumber: 'AAD-10232412'
    },
    {
      partName: 'Fuel Injection',
      partNumber: 'AAD-10232412'
    }
  ])

  function $resetSparepart () {
    sparepart.sparepartName = ''
    sparepart.stock = 0
    sparepart.partNumber = ''
    sparepart.sellingPrice = 0
    sparepart.purchasesPrice = []
  }

  async function getAllSparepart () {
    console.log('FETCH SPAREPART')
    // const response = await getAllSparepartFromAPI()
    // spareparts.value = response.body
  }

  return { sparepart, spareparts, $resetSparepart, getAllSparepart }
})
