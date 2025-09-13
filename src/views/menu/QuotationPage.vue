<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
        <div class="review">
          <router-link :to="menuConfig.quotation_review.path" class="nav-link">
            <button class="btn btn-primary">Review</button>
          </router-link>
        </div>
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">{{ addText }}</button>
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
        <div v-if="quotations.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <div v-for="(allQuotation, index) in quotations" :key="index">
            <template v-if="allQuotation.versions.length > 1">
              <ItemComponent :number="index + paginationData.from"
                :item="allQuotation.versions[allQuotation.versions.length - 1]"
                :first-section="allQuotation.versions[allQuotation.versions.length - 1].project.quotationNumber"
                :second-section="allQuotation.versions[allQuotation.versions.length - 1].project.date"
                :third-section="allQuotation.versions[allQuotation.versions.length - 1].project.type"
                :current-status="allQuotation.versions[allQuotation.versions.length - 1].currentStatus"
                data-bs-toggle="collapse" :data-bs-target="'#collapsChild' + index" />
              <div class="collapse" :id="'collapsChild' + index">
                <div v-for="(quotation, versionIndex) in allQuotation.versions" :key="versionIndex">
                  <ItemComponent :number="(index + paginationData.from) + ' - ' + (versionIndex + 1)" :item="quotation"
                    :first-section="quotation.project.quotationNumber" :second-section="quotation.project.date"
                    :third-section="quotation.project.type" :current-status="quotation.currentStatus" class="item-child"
                    @click="goToDetail(quotation)"
                    :class="{ disabled: versionIndex != (allQuotation.versions.length - 1) }" />
                </div>
              </div>
            </template>
            <ItemComponent v-else :number="index + paginationData.from" :item="allQuotation.versions[0]"
              :first-section="allQuotation.versions[0].project.quotationNumber"
              :second-section="allQuotation.versions[0].project.date"
              :third-section="allQuotation.versions[0].project.type"
              :current-status="allQuotation.versions[0].currentStatus" @click="goToDetail(allQuotation.versions[0])" />
          </div>
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
import { computed, onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'
import { useMainStore } from '@/stores/main'

const mainStore = useMainStore()
const router = useRouter()
const route = useRoute()
const quotationStore = useQuotationStore()
const { selectedMonth, selectedYear } = useDate()

const { isMobile } = storeToRefs(mainStore)
const { quotations, paginationData, isLoading } = storeToRefs(quotationStore)

const addText = computed(() => (isMobile.value ? 'Add' : 'Add Quotation'))

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
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
  }
})

const fetchQuotation = async () => {
  const { page, search, month, year } = route.query
  quotationStore.getAllQuotation({ page, search, month, year })
}

const searchQuotation = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchQuotation(search), 1000, 'search-quotation')
}

const goToDetail = (quotation) => {
  quotationStore.$resetQuotation()
  quotationStore.setQuotation(quotation)
  router.push(`${menuConfig.quotation.path}/${quotation.slug}`)
}
const goToAdd = () => {
  quotationStore.$resetQuotation()
  router.push(menuConfig.quotation_add.path)
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
