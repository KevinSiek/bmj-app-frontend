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
        <ItemComponent v-for="(backOrder, index) in backOrders" :key="index" :number="index + paginationData.from"
          :item="backOrder" first-section-key="no_bo" @click="goToDetail(backOrder)" />
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
import { useBackOrderStore } from '@/stores/back-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const backOrderStore = useBackOrderStore()
const { selectedMonth, selectedYear } = useDate()

const { backOrders, paginationData } = storeToRefs(backOrderStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { ...route.query, page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchBackOrder()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchBackOrder()
    console.log("REFETCH PURCHASE")
  }
})

const fetchBackOrder = async () => {
  console.log('FETCH BACK ORDER')
  const { page, search, month, year } = route.query
  backOrderStore.getAllBackOrder({ page, search, month, year })
}

const searchBackOrder = () => {
  console.log('SEARCH BACK ORDER')
}

const handleUpdateSearch = () => {
  debounce(searchBackOrder, 1000, 'search-backOrder')
}

const goToDetail = (backOrder) => {
  router.push(`${menuConfig.back_order.path}/${backOrder.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
