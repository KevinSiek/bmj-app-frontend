<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">Add Purchase</button>
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
        <div v-if="purchases?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(purchase, index) in purchases" :key="index" :number="index + paginationData.from"
            :item="purchase" :first-section="purchase.buyNumber" :second-section="purchase.date" bigRow
            :current-status="purchase.currentStatus" @click="goToDetail(purchase)" />
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
import { usePurchaseStore } from '@/stores/purchase'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const purchaseStore = usePurchaseStore()
const { selectedMonth, selectedYear } = useDate()

const { purchases, paginationData, isLoading } = storeToRefs(purchaseStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchPurchase()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchPurchase()
    console.log("REFETCH PURCHASE")
  }
})

const fetchPurchase = async () => {
  const { page, search, month, year } = route.query
  purchaseStore.getAllPurchase({ page, search, month, year })
}

const searchPurchase = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchPurchase(search), 1000, 'search-purchase')
}
const goToAdd = () => {
  purchaseStore.$resetPurchase()
  router.push(menuConfig.purchase_add.path)
}
const goToDetail = async (purchase) => {
  purchaseStore.$resetPurchase()
  purchaseStore.setPurchase(purchase)
  router.push(`${menuConfig.purchase.path}/${purchase.no_buy}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
