import { ref } from 'vue'
import { defineStore } from 'pinia'
import customerApi from '@/api/customer'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])

  function mapCustomer(data) {
    return {
      companyName: data?.company_name || '',
      address: data?.address || '',
      city: data?.city || '',
      province: data?.province || '',
      office: data?.office || '',
      urban: data?.urban || '',
      subdistrict: data?.subdistrict || '',
      postalCode: data?.postal_code || ''
    }
  }

  async function getCustomers (param) {
    const { data } = await customerApi.getCustomers(param)
    customers.value = data.data.map(mapCustomer)
  }

  return {
    customers,
    getCustomers
  }
})
