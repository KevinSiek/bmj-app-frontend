<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
    </div>
    <div class="lower paginate shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(workOrder, index) in workOrders" :key="index" :number="index + paginationData.from"
          :item="workOrder" bigRow :first-section="workOrder.serviceOrder.no" :second-section="workOrder.date.start"
          @click="goToDetail(workOrder)" />
      </div>
    </div>
    <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" />
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SelectDate from '@/components/SelectDate.vue'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import Pagination from '@/components/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkOrderStore } from '@/stores/work-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const workOrderStore = useWorkOrderStore()
const { selectedMonth, selectedYear } = useDate()

const { workOrders, paginationData } = storeToRefs(workOrderStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { ...route.query, page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchWorkOrder()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchWorkOrder()
    console.log("REFETCH WORK ORDER")
  }
})

const fetchWorkOrder = async () => {
  const { page, search, month, year } = route.query
  workOrderStore.getAllWorkOrders({ page, search, month, year })
}

const searchWorkOrder = () => {
  console.log('SEARCH WORK ORDER')
}

const handleUpdateSearch = () => {
  debounce(searchWorkOrder, 1000, 'search-workOrder')
}

const goToDetail = async (workOrder) => {
  await workOrderStore.setWorkOrder(workOrder)
  router.push(`${menuConfig.work_order.path}/${workOrder.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
