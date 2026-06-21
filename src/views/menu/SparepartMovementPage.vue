<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
        <RefreshButton @refresh="fetchMovements" />
      </div>
      <div class="right">
        <button type="button" class="btn btn-add" @click="goToAdd">
          <i class="bi bi-plus-lg"></i>
          <span class="mx-2">Add Movement</span>
        </button>
      </div>
    </div>
    <div class="lower paginate shadow">
      <div v-if="isLoading">
        <div class="loading-text">
          Loading...
        </div>
      </div>
      <div v-else>
        <div v-if="store.list?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(item, index) in store.list" :key="index"
            :number="index + (store.meta?.current_page ? (store.meta.current_page - 1) * store.meta.per_page + 1 : 1)"
            :item="item" :first-section="item.movementNumber"
            :second-section="`${item.sourceBranch} -> ${item.targetBranch}`" :current-status="item.currentStatus"
            @click="goToDetail(item)" />
        </div>
      </div>
    </div>
    <Pagination v-if="store.meta" :first-page="store.meta.current_page" :last-page="store.meta.last_page" />
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import Pagination from '@/components/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import { useSparepartMovementStore } from '@/stores/sparepart-movement'
import debounce from '@/utils/debouncer'
import { onBeforeMount, onMounted, watch, ref } from 'vue'
import { updateQuery } from '@/utils/route-util'
import RefreshButton from '@/components/RefreshButton.vue'

const route = useRoute()
const router = useRouter()
const store = useSparepartMovementStore()

const isLoading = ref(false)

onBeforeMount(() => {
  store.$resetList()
})

onMounted(async () => {
  if (!route.query.page) {
    updateQuery(router, route, { page: 1 })
    return
  }
  fetchMovements()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) return
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    debounce(() => fetchMovements(), 500, 'fetch-movement')
  }
})

const fetchMovements = async () => {
  isLoading.value = true
  const { page, search } = route.query
  await store.fetchList({ page, search })
  isLoading.value = false
}

const searchMovement = (search) => {
  updateQuery(router, route, { ...route.query, search, page: 1 })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchMovement(search), 1000, 'search-movement')
}

const goToDetail = (item) => {
  router.push(`${menuConfig.sparepart_movement.path}/${item.id}`)
}

const goToAdd = () => {
  router.push(menuConfig.sparepart_movement_add.path)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';

.upper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list {
  margin: 3.5% 0%;
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
