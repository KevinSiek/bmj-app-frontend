<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
        <RefreshButton @refresh="fetchBorrow" />
      </div>
      <div class="right">
        <button type="button" class="btn btn-add" @click="goToAdd">
          <i class="bi bi-plus-lg"></i>
          <span class="mx-2">Add Borrow</span>
        </button>
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
        <div v-if="borrows?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(borrow, index) in borrows" :key="index" :number="index + paginationData.from"
            :item="borrow" :first-section="borrow.borrowNumber" :second-section="borrow.borrowerName"
            :current-status="borrow.currentStatus" @click="goToDetail(borrow)" />
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
import { useBorrowStore } from '@/stores/borrow'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onBeforeMount, onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'
import RefreshButton from '@/components/RefreshButton.vue'

const route = useRoute()
const router = useRouter()
const borrowStore = useBorrowStore()
const { selectedMonth, selectedYear } = useDate()

const { borrows, paginationData, isLoading } = storeToRefs(borrowStore)

onBeforeMount(() => {
  isLoading.value = true
  borrowStore.$resetBorrows()
})

onMounted(async () => {
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchBorrow()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    debounce(() => fetchBorrow(), 500, 'fetch-borrow')
  }
})

const fetchBorrow = async () => {
  const { page, search, month, year } = route.query
  borrowStore.getAllBorrow({ page, search, month, year })
}

const searchBorrow = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchBorrow(search), 1000, 'search-borrow')
}

const goToDetail = async (borrow) => {
  await borrowStore.setBorrow(borrow)
  router.push(`${menuConfig.borrow.path}/${borrow.id}`)
}

const goToAdd = () => {
  router.push(menuConfig.borrow_add.path)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';

.upper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  gap: 20px;
}

.btn-add {
  background-color: black;
  color: white;
  font-weight: 500;
  padding: 1vh 1.5vw;
}
</style>
