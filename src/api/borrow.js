import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllBorrow = async (param) => {
  return httpApi.getDataViaApi(api.borrow, param)
}

const addBorrow = (borrow) => {
  return httpApi.postDataViaApi(api.borrow, borrow)
}

const getBorrowById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.borrow}/${id}`)
}

const updateBorrow = (id, borrow) => {
  return httpApi.putDataViaApi(`${api.borrow}/${id}`, borrow)
}

const getPurchaseOrderOptions = (param) => {
  return httpApi.getDataViaApi(`${api.borrow}/options/purchase-orders`, param)
}

const approveBorrow = (id) => {
  return httpApi.postDataViaApi(`${api.borrow}/approve/${id}`)
}

const rejectBorrow = (id, payload) => {
  return httpApi.postDataViaApi(`${api.borrow}/reject/${id}`, payload)
}

const sendBorrow = (id) => {
  return httpApi.postDataViaApi(`${api.borrow}/send/${id}`)
}

const kembaliBorrow = (id, payload) => {
  return httpApi.postDataViaApi(`${api.borrow}/kembali/${id}`, payload)
}

const doneBorrow = (id, payload) => {
  return httpApi.postDataViaApi(`${api.borrow}/done/${id}`, payload)
}

const cancelBorrow = (id) => {
  return httpApi.postDataViaApi(`${api.borrow}/cancel/${id}`)
}

export default {
  getAllBorrow,
  addBorrow,
  getBorrowById,
  updateBorrow,
  getPurchaseOrderOptions,
  approveBorrow,
  rejectBorrow,
  sendBorrow,
  kembaliBorrow,
  doneBorrow,
  cancelBorrow
}
