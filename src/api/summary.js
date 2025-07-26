import httpApi from '@/utils/http-api'
import { api } from '@/config'

const summaryDirector = async (param) => {
  return httpApi.getDataViaApi(api.sparepart, param)
}

const summaryFinance = (sparepart) => {
  return httpApi.postDataViaApi(api.sparepart, sparepart)
}

const summaryMarketing = (id) => {
  return httpApi.getDataByIdViaApi(`${api.sparepart}/${id}`)
}

const summaryInventory = (id, sparepart) => {
  return httpApi.putDataViaApi(`${api.sparepart}/${id}`, sparepart)
}

const summaryService = (id) => {
  return httpApi.deleteDataViaApi(`${api.sparepart}/${id}`)
}

export default {
	summaryDirector,
  summaryFinance,
  summaryInventory,
  summaryMarketing,
  summaryService
}
