<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">
          {{ addText }}
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
        <div v-if="spareparts?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(sparepart, index) in spareparts" :key="index" :number="index + paginationData.from"
            :item="sparepart" :first-section="sparepart.sparepartName" :second-section="sparepart.sparepartNumber"
            @click="goToDetail(sparepart)" />
        </div>
      </div>
    </div>
    <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" />
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import Pagination from '@/components/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import { useSparepartStore } from '@/stores/sparepart'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { computed, onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useMainStore } from '@/stores/main'

const mainStore = useMainStore()
const route = useRoute()
const router = useRouter()
const sparepartStore = useSparepartStore()

const { isMobile } = storeToRefs(mainStore)
const { spareparts, paginationData, isLoading } = storeToRefs(sparepartStore)

const addText = computed(() => (isMobile.value ? 'Add' : 'Add Sparepart'))

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { page: 1 })
    return
  }
  fetchSpareparts()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchSpareparts()
    console.log("REFETCH SPAREPART")
  }
})

const fetchSpareparts = async () => {
  const { page, search } = route.query
  sparepartStore.getAllSpareparts({ page, search })
}

const searchSparepart = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchSparepart(search), 1000, 'search-sparepart')
}

const goToAdd = () => {
  sparepartStore.$resetSparepart()
  router.push(menuConfig.spareparts_add.path)
}
const goToDetail = async (sparepart) => {
  await sparepartStore.setSparepart(sparepart)
  router.push(`${menuConfig.spareparts.path}/${sparepart.sparepartId}`)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';

.list {
  margin: 3.5% 0%;
}

.contain {
  .lower {

    .loading-text,
    .no-data-text {
      height: 65vh;
    }
  }
}
</style>
