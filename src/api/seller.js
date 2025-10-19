import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getSellers = async (param) => {
  return httpApi.getDataViaApi(api.seller, param)
}

export default {
  getSellers
}
