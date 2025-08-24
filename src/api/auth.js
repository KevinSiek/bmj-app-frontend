import httpApi from '@/utils/http-api'
import { api } from '@/config'

const login = async (param) => {
  return httpApi.postDataViaApi(api.login, param)
}

const logout = async () => {
  return httpApi.postDataViaApi(api.logout)
}

const getUser = async () => {
  return httpApi.getDataViaApi(api.user)
}

const changePassword = async (param) => {
  return httpApi.postDataViaApi(`${api.user}/changePassword`, param)
}

export default {
	login,
	logout,
	getUser,
	changePassword

}
