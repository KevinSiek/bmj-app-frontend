import { ref } from 'vue'
import { defineStore } from 'pinia'
import generalApi from '@/api/general'

export const useGeneralStore = defineStore('general', () => {
  const discount = ref(0)
  const currencyConverter = ref(0)
  const vat = ref(0)

  async function getGeneralData () {
    const { data } = await generalApi.getGeneralData()
    console.log('General data fetched:', data)
    discount.value = data.discount
    currencyConverter.value = data.currency_converter
    vat.value = data.ppn
  }

  async function updateGeneralData () {
    const data = {
      discount: discount.value,
      currency_converter: currencyConverter.value,
      ppn: vat.value
    }
    await generalApi.updateGeneralData(data)
  }
  return { discount, currencyConverter, vat, getGeneralData, updateGeneralData }
})
