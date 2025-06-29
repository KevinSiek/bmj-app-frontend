<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
    </div>
    <div class="lower paginate shadow">
      <SelectDate />
      <div v-if="isLoading">
        <div class="loading-text">
          Loading...
        </div>
      </div>
      <div v-else>
        <div v-if="deliveryOrder.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(deliveryOrder, index) in deliveryOrders" :key="index"
            :number="index + paginationData.from" :item="deliveryOrder" bigRow :first-section="deliveryOrder.project.no"
            :second-section="deliveryOrder.date.startDate" :current-status="deliveryOrder.currentStatus"
            @click="goToDetail(deliveryOrder)" />
        </div>
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
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'
import { useDeliveryOrderStore } from '@/stores/delivery-order'

const route = useRoute()
const router = useRouter()
const deliveryOrderStore = useDeliveryOrderStore()
const { selectedMonth, selectedYear } = useDate()

const { deliveryOrders, paginationData, isLoading } = storeToRefs(deliveryOrderStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchDeliveryOrder()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchDeliveryOrder()
  }
})

const fetchDeliveryOrder = async () => {
  const { page, search, month, year } = route.query
  deliveryOrderStore.getAllDeliveryOrders({ page, search, month, year })
}

const searchDeliveryOrder = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchDeliveryOrder(search), 1000, 'search-deliveryOrder')
}

const goToDetail = async (deliveryOrder) => {
  await deliveryOrderStore.setDeliveryOrder(deliveryOrder)
  router.push(`${menuConfig.delivery_order.path}/${deliveryOrder.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
