<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
    </div>
    <div class="lower shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(quotation, index) in quotationReviews" :key="index" :number="index + paginationData.from"
          :item="quotation" @click="goToDetail(quotation)" />
      </div>
    </div>
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

const route = useRoute()
const router = useRouter()
const quotationStore = useQuotationStore()

const { quotationReviews } = storeToRefs(quotationStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { ...route.query, page: 1 })
    return
  }
  fetchQuotationReview()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchQuotationReview()
    console.log("REFETCH QUOTATION")
  }
})

const fetchQuotationReview = async () => {
  const { page, search, month, year } = route.query
  quotationStore.getAllQuotationReview({ page, search, month, year })
}

const searchQuotationReview = (search) => {
  console.log('SEARCH QUOTATION REVIEW', search)
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchQuotationReview(search), 1000, 'search-quotationReview')
}

const goToDetail = (quotation) => {
  router.push(`${menuConfig.quotation_review.path}/${quotation.slug}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
