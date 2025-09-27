<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
        <div class="return">
          <router-link :to="menuConfig.return.path" class="nav-link">
            <button class="btn btn-primary">Return</button>
          </router-link>
        </div>
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
          <div v-for="(allPO, index) in purchaseOrders" :key="index">
            <template v-if="allPO.versions.length > 1">
              <ItemComponent :number="index + paginationData.from" :item="allPO.versions[allPO.versions.length - 1]"
                :first-section="allPO.versions[allPO.versions.length - 1].purchaseOrder.purchaseOrderNumber"
                :second-section="allPO.versions[allPO.versions.length - 1].purchaseOrder.purchaseOrderDate"
                :third-section="allPO.versions[allPO.versions.length - 1].purchaseOrder.type" wideRow
                :current-status="paymentStatus(allPO.versions[allPO.versions.length - 1])" data-bs-toggle="collapse"
                :data-bs-target="'#collapsChild' + index" />
              <div class="collapse" :id="'collapsChild' + index">
                <div v-for="(po, versionIndex) in allPO.versions" :key="versionIndex">
                  <ItemComponent :number="(index + paginationData.from) + ' - ' + (versionIndex + 1)" :item="po"
                    :first-section="po.purchaseOrder.purchaseOrderNumber"
                    :second-section="po.purchaseOrder.purchaseOrderDate" :third-section="po.purchaseOrder.type"
                    :current-status="paymentStatus(po)" class="item-child" wideRow @click="goToDetail(po)"
                    :class="{ disabled: versionIndex != (allPO.versions.length - 1) }" isChild />
                </div>
              </div>
            </template>
            <ItemComponent v-else :number="index + paginationData.from" :item="allPO.versions[0]"
              :first-section="allPO.versions[0].purchaseOrder.purchaseOrderNumber"
              :second-section="allPO.versions[0].purchaseOrder.purchaseOrderDate"
              :third-section="allPO.versions[0].purchaseOrder.type" wideRow
              :current-status="paymentStatus(allPO.versions[0])" @click="goToDetail(allPO.versions[0])" />
          </div>
        </div>
      </div>
    </div>
    <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" />
  </div>
</template>

<script setup>
import { menuMapping as menuConfig, common } from '@/config'
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
    if (pi.isFullPaid && item.status.find(step => step.state === common.status.po.done)) return 'Done (Full Paid)'
    else if (pi.isFullPaid && !item.status.find(step => step.state === common.status.po.done)) return item.currentStatus + ' (Full Paid)'
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

.item-child {
  margin-left: 10%;
}

.disabled {
  background-color: rgb(219, 219, 219);
  border-color: transparent;
}
</style>
