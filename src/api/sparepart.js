import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAllSparepart = async (param) => {
  return httpApi.getDataViaApi(api.sparepart, param)
}

const addSparepart = (sparepart) => {
  return httpApi.postDataViaApi(api.sparepart, sparepart)
}

const getSparepartById = (id) => {
  return httpApi.getDataByIdViaApi(`${api.sparepart}/${id}`)
}

const updateSparepart = (id, sparepart) => {
  return httpApi.putDataViaApi(`${api.sparepart}/${id}`, sparepart)
}

const deleteSparepart = (id) => {
  return httpApi.deleteDataViaApi(`${api.sparepart}/${id}`)
}

const addSparepartInBulk = (spareparts) => {
  return httpApi.postDataViaApi(`${api.sparepart}/insert`, spareparts)
}


export {
	getAllSparepart,
  addSparepart,
  getSparepartById,
  updateSparepart,
  deleteSparepart,
  addSparepartInBulk
}
