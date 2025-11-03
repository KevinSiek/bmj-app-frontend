import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getSummary = async (params = {}) => {
  const query = typeof params === 'string' ? { interval: params } : params
  return httpApi.getDataViaApi(`${api.dashboard}/summary`, query)
}

export default {
  getSummary,
}
