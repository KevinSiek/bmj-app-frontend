import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getCustomers = async (param) => {
  return httpApi.getDataViaApi(api.customer, param)
}

export default {
  getCustomers
}
