<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addPriceListModal" @click="goToAdd">
          Add Sparepart
        </button>
      </div>
    </div>
    <div class="lower paginate shadow">
      <div class="list">
        <ItemComponent v-for="(sparepart, index) in spareparts" :key="index" :number="index + paginationData.from"
          :item="sparepart" first-section-key="name" second-section-key="no_sparepart" @click="goToDetail(sparepart)" />
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
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'

const route = useRoute()
const router = useRouter()
const sparepartStore = useSparepartStore()

const { spareparts, paginationData } = storeToRefs(sparepartStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { ...route.query, page: 1 })
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

const searchSparepart = () => {
  console.log('SEARCH SPAREPART')
}

const handleUpdateSearch = () => {
  debounce(searchSparepart, 1000, 'search-sparepart')
}

const goToAdd = () => {
  router.push(menuConfig.spareparts_add.path)
}
const goToDetail = (sparepart) => {
  router.push(`${menuConfig.spareparts.path}/${sparepart.id}`)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';

.list {
  margin: 3.5% 0%;
}
</style>
