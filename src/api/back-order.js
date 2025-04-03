import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllBackOrder = async (param) => {
  return httpApi.getDataViaApi(api.back_order, param)
}

const addBackOrder = (bo) => {
  return httpApi.postDataViaApi(api.back_order, bo)
}

const getBackOrderById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.back_order}/${id}`)
}

const updateBackOrder = (id, bo) => {
  return httpApi.putDataViaApi(`${api.back_order}/${id}`, bo)
}

const deleteBackOrder = (id) => {
  return httpApi.deleteDataViaApi(`${api.back_order}/${id}`)
}


export default {
	getAllBackOrder,
  addBackOrder,
  getBackOrderById,
  updateBackOrder,
  deleteBackOrder
}
