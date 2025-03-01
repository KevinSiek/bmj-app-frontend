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
    <div class="lower shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(employee, index) in employees" :key="index" :number="index + 1" :item="employee"
          @click="goToDetail(employee)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SelectDate from '@/components/SelectDate.vue'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import { useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted } from 'vue'

const router = useRouter()
const employeeStore = useEmployeeStore()

const { employees } = storeToRefs(employeeStore)

onMounted(() => {
  employeeStore.getAllEmployee()
})

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
</style>
