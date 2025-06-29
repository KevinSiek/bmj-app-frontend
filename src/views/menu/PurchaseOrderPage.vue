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
        <div v-if="purchaseOrders?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(po, index) in purchaseOrders" :key="index" :number="index + paginationData.from"
            :item="po" :first-section="po.purchaseOrder.purchaseOrderNumber"
            :second-section="po.purchaseOrder.purchaseOrderDate" :third-section="po.purchaseOrder.type" wideRow
            :current-status="paymentStatus(po)" @click="goToDetail(po)" />
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
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const purchaseOrderStore = usePurchaseOrderStore()
const { selectedMonth, selectedYear } = useDate()

const { purchaseOrders, paginationData, isLoading } = storeToRefs(purchaseOrderStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
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

const paymentStatus = (item) => {
  if (item?.proformaInvoice) {
    const pi = item.proformaInvoice
    if (pi.isFullPaid) return item.currentStatus + ' (Full Paid)'
    else if (pi.isDpPaid) return item.currentStatus + ' (DP Paid)'
    else return item.currentStatus + ' (Unpaid)'
  }
  return item.currentStatus
}
const fetchPurchaseOrder = async () => {
  const { page, search, month, year } = route.query
  purchaseOrderStore.getAllPurchaseOrders({ page, search, month, year })
}

const searchPurchaseOrder = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchPurchaseOrder(search), 1000, 'search-purchaseOrder')
}

const goToDetail = async (po) => {
  await purchaseOrderStore.setPurchaseOrder(po)
  router.push(`${menuConfig.purchase_order.path}/${po.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
