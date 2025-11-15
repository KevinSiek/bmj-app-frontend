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
        <div v-if="backOrders?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <div v-for="(allBackOrder, index) in backOrders" :key="index">
            <template v-if="allBackOrder.versions.length > 1">
              <ItemComponent :number="index + paginationData.from"
                :item="allBackOrder.versions[allBackOrder.versions.length - 1]"
                :first-section="allBackOrder.versions[allBackOrder.versions.length - 1].backOrderNumber"
                :second-section="allBackOrder.versions[allBackOrder.versions.length - 1].deliveryOrder.date"
                :third-section="allBackOrder.versions[allBackOrder.versions.length - 1].purchaseOrder.type"
                :current-status="allBackOrder.versions[allBackOrder.versions.length - 1].currentStatus"
                data-bs-toggle="collapse" :data-bs-target="'#collapsChild' + index" />
              <div class="collapse" :id="'collapsChild' + index">
                <div v-for="(backOrder, versionIndex) in allBackOrder.versions" :key="versionIndex">
                  <ItemComponent :number="(index + paginationData.from) + ' - ' + (versionIndex + 1)" :item="backOrder"
                    :first-section="backOrder.backOrderNumber" :second-section="backOrder.deliveryOrder.date"
                    :third-section="backOrder.purchaseOrder.type" :current-status="backOrder.currentStatus"
                    class="item-child" @click="goToDetail(backOrder)"
                    :class="{ disabled: versionIndex != (allBackOrder.versions.length - 1) }" />
                </div>
              </div>
            </template>
            <ItemComponent v-else :number="index + paginationData.from" :item="allBackOrder.versions[0]"
              :first-section="allBackOrder.versions[0].backOrderNumber"
              :second-section="allBackOrder.versions[0].deliveryOrder.date"
              :third-section="allBackOrder.versions[0].purchaseOrder.type"
              :current-status="allBackOrder.versions[0].currentStatus" @click="goToDetail(allBackOrder.versions[0])" />
          </div>
          <!-- <ItemComponent v-for="(backOrder, index) in backOrders" :key="index" :number="index + paginationData.from"
            :item="backOrder" :first-section="backOrder.backOrderNumber" :second-section="backOrder.date"
            :current-status="backOrder.currentStatus" @click="goToDetail(backOrder)" /> -->
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
import { useBackOrderStore } from '@/stores/back-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onBeforeMount, onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const backOrderStore = useBackOrderStore()
const { selectedMonth, selectedYear } = useDate()

const { backOrders, paginationData, isLoading } = storeToRefs(backOrderStore)

onBeforeMount(() => {
  isLoading.value = true
  backOrderStore.$resetBackOrders()
})

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchBackOrder()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    debounce(() => fetchBackOrder(), 500, 'fetch-back-order')
  }
})

const fetchBackOrder = async () => {
  console.log('FETCH BACK ORDER')
  const { page, search, month, year } = route.query
  backOrderStore.getAllBackOrder({ page, search, month, year })
}

const searchBackOrder = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchBackOrder(search), 1000, 'search-backOrder')
}

const goToDetail = async (backOrder) => {
  await backOrderStore.setBackOrder(backOrder)
  router.push(`${menuConfig.back_order.path}/${backOrder.id}`)
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
