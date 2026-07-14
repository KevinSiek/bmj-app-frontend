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

const approveBorrow = (id) => {
  return httpApi.postDataViaApi(`${api.borrow}/approve/${id}`)
}

const rejectBorrow = (id, payload) => {
  return httpApi.postDataViaApi(`${api.borrow}/reject/${id}`, payload)
}

const sendBorrow = (id) => {
  return httpApi.postDataViaApi(`${api.borrow}/send/${id}`)
}

const returnBorrow = (id, payload) => {
  return httpApi.postDataViaApi(`${api.borrow}/return/${id}`, payload)
}

const receiveBorrow = (id, payload) => {
  return httpApi.postDataViaApi(`${api.borrow}/receive/${id}`, payload)
}

const doneBorrow = (id) => {
  return httpApi.postDataViaApi(`${api.borrow}/done/${id}`)
}

const cancelBorrow = (id) => {
  return httpApi.postDataViaApi(`${api.borrow}/cancel/${id}`)
}

export default {
  getAllBorrow,
  addBorrow,
  getBorrowById,
  updateBorrow,
  approveBorrow,
  rejectBorrow,
  sendBorrow,
  returnBorrow,
  receiveBorrow,
  doneBorrow,
  cancelBorrow
}
