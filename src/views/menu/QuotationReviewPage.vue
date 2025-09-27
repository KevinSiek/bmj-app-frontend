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
        <div v-if="quotationReviews?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(quotation, index) in quotationReviews" :key="index"
            :number="index + paginationData.from" :item="quotation" :first-section="quotation.project.quotationNumber"
            :second-section="quotation.project.date" :third-section="quotation.project.type"
            :current-status="quotation.currentStatus" @click="goToDetail(quotation)" />
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
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const quotationStore = useQuotationStore()
const { selectedMonth, selectedYear } = useDate()

const { quotationReviews, paginationData, isLoading } = storeToRefs(quotationStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
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
  quotationStore.$resetQuotationReview()
  quotationStore.setQuotationReview(quotation)
  router.push(`${menuConfig.quotation_review.path}/${quotation.slug}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
