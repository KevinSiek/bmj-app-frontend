import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllInvoice = async (param) => {
  return httpApi.getDataViaApi(api.invoice, param)
}

const addInvoice = (invoice) => {
  return httpApi.postDataViaApi(api.invoice, invoice)
}

const getInvoiceById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.invoice}/${id}`)
}

const updateInvoice = (id, invoice) => {
  return httpApi.putDataViaApi(`${api.invoice}/${id}`, invoice)
}

const deleteInvoice = (id) => {
  return httpApi.deleteDataViaApi(`${api.invoice}/${id}`)
}


export {
	getAllInvoice,
  addInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
}
