import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setToken, getToken, removeToken } from '@/utils/local-storage'
import authApi from '@/api/auth'
import axios from 'axios'

export const useAuthStore = defineStore('auth-store', () => {
	const user = ref(null)
	const authenticated = ref(false)

	// const register = async (credentials) => {
	// 	try {
	// 		await axios.post('/api/register', credentials)
	// 	} catch (error) {
  //     user.value = null
  //     authenticated.value = false
	// 		console.error('Error loading new arrivals:', error)
	// 		throw error
	// 	}
	// }

	const login = async (credentials) => {
		try {
			const response = await authApi.login(credentials)
      await setToken('token-bmj', response.access_token, 24)
      user.value = response.user
      authenticated.value = true
      axios.defaults.headers.common.Authorization = `Bearer ${getToken('token-bmj')}`
		} catch (error) {
			user.value = null
      authenticated.value = false
      removeToken('token-bmj')
			console.error('Error loading new arrivals:', error)
			throw error
		}
	}

	const logout = async () => {
		try {
			await authApi.logout()
			user.value = null;
      authenticated.value = false
      removeToken('token-bmj')
      axios.defaults.headers.common.Authorization = null
		} catch (error) {
			console.error('Error loading new arrivals:', error)
			throw error
		}
	}

	const getUser = async () => {
		try {
      axios.defaults.headers.common.Authorization = `Bearer ${getToken('token-bmj')}`
			const response = await authApi.getUser()
      user.value = response.user
      authenticated.value = true
		} catch (error) {
      user.value = null
      authenticated.value = false
		}
	}

	const updateUser = async (credentials) => {
    await authApi.changePassword(credentials)
    await getUser()
	}

	return{
		user,
		login,
		logout,
		getUser,
		updateUser,
		authenticated
	}
})
