import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllProformaInvoice = async (param) => {
  return httpApi.getDataViaApi(api.proforma_invoice, param)
}

const addProformaInvoice = (pi) => {
  return httpApi.postDataViaApi(api.proforma_invoice, pi)
}

const getProformaInvoiceById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.proforma_invoice}/${id}`)
}

const updateProformaInvoice = (id, pi) => {
  return httpApi.putDataViaApi(`${api.proforma_invoice}/${id}`, pi)
}

const deleteProformaInvoice = (id) => {
  return httpApi.deleteDataViaApi(`${api.proforma_invoice}/${id}`)
}


export {
	getAllProformaInvoice,
  addProformaInvoice,
  getProformaInvoiceById,
  updateProformaInvoice,
  deleteProformaInvoice
}
