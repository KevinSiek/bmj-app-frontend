import { ref } from 'vue'
import { defineStore } from 'pinia'
import generalApi from '@/api/general'

export const useGeneralStore = defineStore('general', () => {
  const discount = ref(0)
  const currencyConverter = ref(0)
  const ppn = ref(0)

  const processData = {
    save: (data) => {
      discount.value = data.discount
      currencyConverter.value = data.currency_converter
      ppn.value = data.ppn
    },
    post: () => {
      return {
        discount: discount.value,
        currency_converter: currencyConverter.value,
        ppn: ppn.value
      }
    }
  }

  async function getGeneralData () {
    const { data } = await generalApi.getGeneralData()
    processData.save(data)
  }

  async function updateGeneralData () {
    await generalApi.updateGeneralData(processData.post())
  }
  return { discount, currencyConverter, ppn, getGeneralData, updateGeneralData }
})
