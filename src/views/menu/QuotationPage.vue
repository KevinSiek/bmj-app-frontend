<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @updated="handleUpdateSearch" />
        <div class="review">
          <router-link :to="menuConfig.quotation_review.path" class="nav-link">
            <button class="btn btn-primary">Review</button>
          </router-link>
        </div>
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">Add Quotation</button>
      </div>
    </div>
    <div class="lower paginate shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(quotation, index) in quotations" :key="index" :number="index + 1" :item="quotation"
          @click="goToDetail(quotation)" />
      </div>
    </div>
    <!-- <Pagination :first-page="paginationData.from" :last-page="paginationData.last_page" /> -->
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SelectDate from '@/components/SelectDate.vue'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'

const router = useRouter()
const route = useRoute()
const quotationStore = useQuotationStore()

const { quotations } = storeToRefs(quotationStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { ...route.query, page: 1 })
    return
  }
  fetchQuotation()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchQuotation()
    console.log("REFETCH QUOTATION")
  }
})

const fetchQuotation = async () => {
  const { page, search, month, year } = route.query
  quotationStore.getAllQuotation({ page, search, month, year })
}

const searchQuotation = () => {
  console.log('SEARCH QUOTATION')
}

const handleUpdateSearch = () => {
  debounce(searchQuotation, 1000, 'search-quotation')
}

const goToDetail = (quotation) => {
  router.push(`${menuConfig.quotation.path}/${quotation.id}`)
}
const goToAdd = () => {
  router.push(menuConfig.quotation_add.path)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
