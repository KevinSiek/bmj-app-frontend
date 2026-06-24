import httpApi from '@/utils/http-api'
import { api } from '@/config'

const getAll = async (param) => {
  return httpApi.getDataViaApi(api.sparepart_movement, param)
}

const get = (id) => {
  return httpApi.getDataByIdViaApi(`${api.sparepart_movement}/${id}`)
}

const create = (movement) => {
  return httpApi.postDataViaApi(api.sparepart_movement, movement)
}

const send = (id) => {
  return httpApi.postDataViaApi(`${api.sparepart_movement}/send/${id}`)
}

const cancel = (id) => {
  return httpApi.postDataViaApi(`${api.sparepart_movement}/cancel/${id}`)
}

const receive = (id) => {
  return httpApi.postDataViaApi(`${api.sparepart_movement}/receive/${id}`)
}

export default {
  getAll,
  get,
  create,
  send,
  cancel,
  receive
}
