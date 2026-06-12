import { buildCrudApi } from '../utils/http-api'
import { api as apiConfig } from '../config'
import http from './http'

const baseApi = buildCrudApi(apiConfig.sparepart_movement)

const send = async (id) => {
  const { data } = await http.post(`${apiConfig.sparepart_movement}/send/${id}`)
  return data
}

const cancel = async (id) => {
  const { data } = await http.post(`${apiConfig.sparepart_movement}/cancel/${id}`)
  return data
}

const receive = async (id) => {
  const { data } = await http.post(`${apiConfig.sparepart_movement}/receive/${id}`)
  return data
}

export default {
  ...baseApi,
  send,
  cancel,
  receive
}
