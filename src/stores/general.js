import { ref } from 'vue'
import { defineStore } from 'pinia'
import generalApi from '@/api/general'

export const useGeneralStore = defineStore('general', () => {
  const discount = ref(0)
  const currencyConverter = ref(0)
  const ppn = ref(0)

  const processData = {
    toPercentage: (data) => {
      discount.value = data.discount * 100
      currencyConverter.value = data.currency_converter
      ppn.value = data.ppn * 100
    },
    toNormal: () => {
      return {
        discount: discount.value / 100,
        currency_converter: currencyConverter.value,
        ppn: ppn.value / 100
      }
    }
  }

  async function getGeneralData () {
    const { data } = await generalApi.getGeneralData()
    processData.toPercentage(data)
  }

  async function updateGeneralData () {
    await generalApi.updateGeneralData(processData.toNormal())
  }
  return { discount, currencyConverter, ppn, getGeneralData, updateGeneralData }
})
