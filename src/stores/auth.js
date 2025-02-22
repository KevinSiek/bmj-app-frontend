import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth-store', () => {
	const user = ref(null)
	const authenticated = ref(false)

	const register = async (credentials) => {
		try {
			await axios.get('/api/sanctum/csrf-cookie')
			await axios.post('/api/register', credentials)
		} catch (error) {
      user.value = null;
      authenticated.value = false;
			console.error('Error loading new arrivals:', error)
			throw error
		}
	}

	const login = async (credentials) => {
		try {
			await axios.get('/api/sanctum/csrf-cookie')
			const response = await axios.post('/api/login', credentials)
      user.value = response.data.user;
      authenticated.value = true;
      axios.defaults.headers.common.Authorization = `${response.data.token_type} ${response.data.access_token}`
		} catch (error) {
			user.value = null;
      authenticated.value = false;
			console.error('Error loading new arrivals:', error)
			throw error
		}
	}

	const logout = async () => {
		try {
      await axios.get('/api/sanctum/csrf-cookie')
			await axios.post('/api/logout')
			user.value = null;
      authenticated.value = false;
      axios.defaults.headers.common.Authorization = null
		} catch (error) {
			console.error('Error loading new arrivals:', error)
			throw error
		}
	}

	const getUser = async () => {
		try {
			const response = await axios.get('/api/user')
      user.value = response.data;
      authenticated.value = true;
		} catch (error) {
      user.value = null;
      authenticated.value = false;
			console.error('Error loading new arrivals:', error)
		}
	}

	const updateUser = async (credentials) => {
		try {
			await axios.get('/api/sanctum/csrf-cookie')
			await axios.post('/api/profile/update', credentials)
			await getUser()
		} catch (error) {
			console.error('Error loading new arrivals:', error)
			throw error
		}
	}

	return{
		user,
		register,
		login,
		logout,
		getUser,
		updateUser,
		authenticated
	}
})
