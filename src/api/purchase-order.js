import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllPurchaseOrder = async (param) => {
  return httpApi.getDataViaApi(api.purchase_order, param)
}

const addPurchaseOrder = (purchaseOrder) => {
  return httpApi.postDataViaApi(api.purchase_order, purchaseOrder)
}

const getPurchaseOrderById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.purchase_order}/${id}`)
}

const updatePurchaseOrder = (id, purchaseOrder) => {
  return httpApi.putDataViaApi(`${api.purchase_order}/${id}`, purchaseOrder)
}

const deletePurchaseOrder = (id) => {
  return httpApi.deleteDataViaApi(`${api.purchase_order}/${id}`)
}


export default {
	getAllPurchaseOrder,
  addPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder
}
