import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllQuotations = async (param) => {
  return httpApi.getDataViaApi(api.quotation, param)
}

const getAllReviewQuotations = async () => {
  return httpApi.getDataViaApi(`${api.quotation}/review`)
}

const addQuotation = (quotation) => {
  return httpApi.postDataViaApi(api.quotation, quotation)
}

const getQuotationyId = (id) => {
  return httpApi.getDataByIdViaApi(`${api.quotation}/${id}`)
}

const updateQuotation = (id, quotation) => {
  return httpApi.putDataViaApi(`${api.quotation}/${id}`, quotation)
}

const deleteQuotation = (id) => {
  return httpApi.deleteDataViaApi(`${api.quotation}/${id}`)
}


export {
	getAllQuotations,
  getAllReviewQuotations,
  addQuotation,
  getQuotationyId,
  updateQuotation,
  deleteQuotation
}
