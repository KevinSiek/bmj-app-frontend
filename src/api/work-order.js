import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllWorkOrder = async (param) => {
  return httpApi.getDataViaApi(api.work_order, param)
}

const addWorkOrder = (workOrder) => {
  return httpApi.postDataViaApi(api.work_order, workOrder)
}

const getWorkOrderById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.work_order}/${id}`)
}

const updateWorkOrder = (id, workOrder) => {
  return httpApi.putDataViaApi(`${api.work_order}/${id}`, workOrder)
}

const deleteWorkOrder = (id) => {
  return httpApi.deleteDataViaApi(`${api.work_order}/${id}`)
}


export default {
	getAllWorkOrder,
  addWorkOrder,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder
}
