import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getSummary = async (interval) => {
  return httpApi.getDataViaApi(`${api.dashboard}/summary`, { interval })
}


export default {
  getSummary,
}
