<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @updated="handleUpdateSearch" />
      </div>
    </div>
    <div class="lower shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(quotation, index) in quotationReviews" :key="index" :number="index + 1" :item="quotation"
          @click="goToDetail(quotation)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { menuMapping as menuConfig } from '@/config'
import SelectDate from '@/components/SelectDate.vue'
import SearchBar from '@/components/SearchBar.vue'
import ItemComponent from '@/components/ItemComponent.vue'
import { useRouter } from 'vue-router'
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const quotationStore = useQuotationStore()

const { quotationReviews } = storeToRefs(quotationStore)

const searchQuotationReview = () => {
  console.log('SEARCH QUOTATION REVIEW')
}

const handleUpdateSearch = () => {
  debounce(searchQuotationReview, 1000, 'search-quotationReview')
}

const goToDetail = (quotation) => {
  router.push(`${menuConfig.quotation_review.path}/${quotation.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
