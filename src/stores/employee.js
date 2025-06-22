import { ref } from 'vue'
import { defineStore } from 'pinia'
import employeeApi from '@/api/employee'

export const useEmployeeStore = defineStore('employee', () => {
  const employee = ref(null)
  const employees = ref([])
  const paginationData = ref({})
  const isLoading = ref(false)

  function mapEmployee (data) {
    return {
      id: data?.id || '',
      fullname: data?.fullname || '',
      username: data?.username || '',
      email: data?.email || '',
      role: data?.role || '',
      password: data?.password || '',
      passwordConfirmation: data?.password_confirmation || ''
    }
  }

  async function getAllEmployee (param) {
    isLoading.value = true
    const { data } = await employeeApi.getAllEmployee(param)
    employees.value = data.data.map(mapEmployee)
    paginationData.value = data
    isLoading.value = false
  }

  async function getEmployee (id) {
    const { data } = await employeeApi.getEmployeeById(id)
    employee.value = mapEmployee(data)
  }

  async function addEmployee () {
    const data = await employeeApi.addEmployee(employee.value)
  }

  async function setEmployee (selectedEmployee) {
    employee.value = selectedEmployee
  }

  async function updateEmployee () {
    const { data } = await employeeApi.updateEmployee(employee.value.id, employee.value)
  }

  async function deleteEmployee (id) {
    await employeeApi.deleteEmployee(id)
  }

  async function $resetEmployee () {
    employee.value = mapEmployee()
  }

  return {
    employee,
    employees,
    paginationData,
    isLoading,
    getAllEmployee,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    addEmployee,
    $resetEmployee,
    setEmployee
  }
})
