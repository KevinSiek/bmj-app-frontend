<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @updated="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">Add Employee</button>
      </div>
    </div>
    <div class="lower paginate shadow">
      <div class="list">
        <ItemComponent v-for="(employee, index) in employees" :key="index" :number="index + paginationData.from"
          :item="employee" @click="goToDetail(employee)" />
      </div>
    </div>
    <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" :action="fetchEmployees" />
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import Pagination from '@/components/pagination.vue'
import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()

const { employees, paginationData } = storeToRefs(employeeStore)

onMounted(async () => {
  fetchEmployees()
})

const fetchEmployees = async () => {
  const { page, search } = route.query
  employeeStore.getAllEmployee({ page, search })
}

const searchEmployee = () => {
  console.log('SEARCH EMPLOYEE')
}

const handleUpdateSearch = () => {
  debounce(searchEmployee, 1000, 'search-employee')
}

const goToAdd = () => {
  router.push(`${menuConfig.employee.path}/add`)
}

const goToDetail = async (employee) => {
  await employeeStore.setEmployee(employee)
  router.push(`${menuConfig.employee.path}/${employee.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';

.list {
  margin: 3.5% 0%;
}
</style>
