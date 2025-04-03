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
        <ItemComponent v-for="(po, index) in purchaseOrders" :key="index" :number="index + paginationData.from"
          :item="po" first-section-key="no_po" second-section-key="date" @click="goToDetail(po)" />
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
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'

const route = useRoute()
const router = useRouter()
const purchaseOrderStore = usePurchaseOrderStore()

const { purchaseOrders, paginationData } = storeToRefs(purchaseOrderStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { ...route.query, page: 1 })
    return
  }
  fetchPurchaseOrder()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchPurchaseOrder()
  }
})

const fetchPurchaseOrder = async () => {
  const { page, search, month, year } = route.query
  purchaseOrderStore.getAllPurchaseOrders({ page, search, month, year })
}

const searchPurchaseOrder = () => {
  console.log('SEARCH PURCHASE ORDER')
}

const handleUpdateSearch = () => {
  debounce(searchPurchaseOrder, 1000, 'search-purchaseOrder')
}

const goToDetail = async (po) => {
  await purchaseOrderStore.setPurchaseOrder(po)
  router.push(`${menuConfig.purchase_order.path}/${po.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
