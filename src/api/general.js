import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getGeneralData = async (param) => {
  return httpApi.getDataViaApi(api.general, param)
}

const updateGeneralData = async (data) => {
  return httpApi.putDataViaApi(api.general, data)
}

export default {
	getGeneralData,
	updateGeneralData
}
