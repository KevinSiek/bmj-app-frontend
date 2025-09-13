<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">{{ addText }}</button>
      </div>
    </div>
    <div class="lower paginate shadow">
      <div v-if="isLoading">
        <div class="loading-text">
          Loading...
        </div>
      </div>
      <div v-else>
        <div v-if="employees?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(employee, index) in employees" :key="index" :number="index + paginationData.from"
            :item="employee" :first-section="employee.username" :second-section="employee.role"
            @click="goToDetail(employee)" />
        </div>
      </div>
    </div>
    <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" />
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import Pagination from '@/components/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { computed, onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useMainStore } from '@/stores/main'

const mainStore = useMainStore()
const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()

const { isMobile } = storeToRefs(mainStore)
const { employees, paginationData, isLoading } = storeToRefs(employeeStore)

const addText = computed(() => (isMobile.value ? 'Add' : 'Add Employee'))

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { page: 1 })
    return
  }
  fetchEmployees()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchEmployees()
  }
})

const fetchEmployees = async () => {
  const { page, search } = route.query
  employeeStore.getAllEmployee({ page, search })
}

const searchEmployee = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchEmployee(search), 1000, 'search-employee')
}

const goToAdd = () => {
  router.push(`${menuConfig.employee.path}/add`)
}

const goToDetail = async (employee) => {
  await employeeStore.setEmployee(employee)
  router.push(`${menuConfig.employee.path}/${employee.slug}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';

.list {
  margin: 3.5% 0%;
}

.contain {
  .lower {

    .loading-text,
    .no-data-text {
      height: 65vh;
    }
  }
}
</style>
