<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @updated="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">Add Purchase</button>
      </div>
    </div>
    <div class="lower paginate shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(purchase, index) in purchases" :key="index" :number="index + paginationData.from"
          :item="purchase" first-section-key="no_buy" @click="goToDetail(purchase)" />
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

const route = useRoute()
const router = useRouter()
const purchaseStore = usePurchaseStore()

const { purchases, paginationData } = storeToRefs(purchaseStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { ...route.query, page: 1 })
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

const searchPurchase = () => {
  console.log('SEARCH PURCHASE')
}

const handleUpdateSearch = () => {
  debounce(searchPurchase, 1000, 'search-purchase')
}
const goToAdd = () => {
  router.push(menuConfig.purchase_add.path)
}
const goToDetail = (purchase) => {
  router.push(`${menuConfig.purchase.path}/${purchase.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
