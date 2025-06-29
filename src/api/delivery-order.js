import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllDeliveryOrder = async (param) => {
  return httpApi.getDataViaApi(api.delivery_order, param)
}

const addDeliveryOrder = (deliveryOrder) => {
  return httpApi.postDataViaApi(api.delivery_order, deliveryOrder)
}

const getDeliveryOrderById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.delivery_order}/${id}`)
}

const updateDeliveryOrder = (id, deliveryOrder) => {
  return httpApi.putDataViaApi(`${api.delivery_order}/${id}`, deliveryOrder)
}

const deleteDeliveryOrder = (id) => {
  return httpApi.deleteDataViaApi(`${api.delivery_order}/${id}`)
}

const process = (id) => {
  return httpApi.postDataViaApi(`${api.delivery_order}/process/${id}`)
}


export default {
	getAllDeliveryOrder,
  addDeliveryOrder,
  getDeliveryOrderById,
  updateDeliveryOrder,
  deleteDeliveryOrder,
  process
}
