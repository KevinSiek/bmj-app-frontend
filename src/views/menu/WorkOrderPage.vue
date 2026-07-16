<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
        <RefreshButton @refresh="fetchWorkOrder" />
      </div>
      <div class="btn-add" v-if="canCreateWO">
        <button class="btn btn-primary" @click="goToAdd">{{ addText }}</button>
      </div>
    </div>
    <div class="lower paginate shadow">
      <LoaderOverlaySmall v-if="isLoading" />
      <SelectDate />
      <div>
        <div v-if="workOrders?.length == 0 && !isLoading">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <div v-for="(workOrder, index) in workOrders" :key="index">
            <template v-if="workOrder?.versions?.length > 1">
              <ItemComponent wideRow :number="index + paginationData.from"
                :item="workOrder.versions[workOrder.versions.length - 1]"
                :first-section="workOrder.versions[workOrder.versions.length - 1].serviceOrder.serviceOrderNumber"
                :second-section="workOrder.versions[workOrder.versions.length - 1].date.startDate"
                :current-status="workOrder.currentStatus" data-bs-toggle="collapse"
                :data-bs-target="'#collapsChild' + index" />
              <div class="collapse" :id="'collapsChild' + index">
                <div v-for="(woChild, versionIndex) in workOrder.versions" :key="versionIndex">
                  <ItemComponent wideRow :number="(index + paginationData.from) + ' - ' + (versionIndex + 1)"
                    :item="woChild" :first-section="woChild.serviceOrder.serviceOrderNumber"
                    :second-section="woChild.date.startDate" :current-status="woChild.currentStatus" class="item-child"
                    @click="goToDetail(woChild)" :class="{ disabled: versionIndex != (workOrder.versions.length - 1) }"
                    isChild />
                </div>
              </div>
            </template>
            <ItemComponent v-else :number="index + paginationData.from" :item="workOrder" wideRow
              :first-section="workOrder.serviceOrder.serviceOrderNumber" :second-section="workOrder.date.startDate"
              :current-status="workOrder.currentStatus" @click="goToDetail(workOrder)" />
          </div>
        </div>
      </div>
    </div>
    <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" />
  </div>
</template>

<script setup>
import LoaderOverlaySmall from '@/components/LoaderOverlaySmall.vue'
import { menuMapping as menuConfig } from '@/config'
import SelectDate from '@/components/SelectDate.vue'
import SearchBar from '@/components/SearchBar.vue'
import RefreshButton from '@/components/RefreshButton.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import Pagination from '@/components/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkOrderStore } from '@/stores/work-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onBeforeMount, onMounted, watch, computed } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'
import { useMainStore } from '@/stores/main'
import { useRole } from '@/composeable/useRole'

const mainStore = useMainStore()
const route = useRoute()
const router = useRouter()
const workOrderStore = useWorkOrderStore()
const { isMobile } = storeToRefs(mainStore)
const { selectedMonth, selectedYear } = useDate()
const { isRoleDirector, isRoleMarketing } = useRole()

const { workOrders, paginationData, isLoading } = storeToRefs(workOrderStore)

const addText = computed(() => (isMobile.value ? 'Add' : 'Add Work Order'))
const canCreateWO = computed(() => isRoleDirector.value || isRoleMarketing.value)

onBeforeMount(() => {
  isLoading.value = true
  workOrderStore.$resetWorkOrders()
})

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchWorkOrder()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    debounce(() => fetchWorkOrder(), 500, 'fetch-work-order')
  }
})

const fetchWorkOrder = async () => {
  const { page, search, month, year } = route.query
  workOrderStore.getAllWorkOrders({ page, search, month, year })
}

const searchWorkOrder = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchWorkOrder(search), 1000, 'search-workOrder')
}

const goToAdd = () => {
  workOrderStore.$resetWorkOrder()
  router.push(menuConfig.work_order_add.path)
}
const goToDetail = async (workOrder) => {
  await workOrderStore.setWorkOrder(workOrder)
  router.push(`${menuConfig.work_order.path}/${workOrder.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
