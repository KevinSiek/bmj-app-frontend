import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getSummary = async (role, param) => {
  return httpApi.getDataViaApi(`${api.summary}/${role}`, param)
}

export default {
	getSummary,
}
