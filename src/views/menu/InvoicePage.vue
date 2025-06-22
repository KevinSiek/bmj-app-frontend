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
        <div v-if="invoices.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(invoice, index) in invoices" :key="index" :number="index + paginationData.from"
            :item="invoice" :first-section="invoice.invoice.invoiceNumber" :second-section="invoice.invoice.date"
            :current-status="invoice.currentStatus" :third-section="invoice.invoice.type"
            @click="goToDetail(invoice)" />
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
import { useInvoiceStore } from '@/stores/invoice'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const { selectedMonth, selectedYear } = useDate()

const { invoices, paginationData, isLoading } = storeToRefs(invoiceStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchPurchase()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchPurchase()
    console.log("REFETCH PURCHASE")
  }
})

const fetchPurchase = async () => {
  const { page, search, month, year } = route.query
  invoiceStore.getAllInvoices({ page, search, month, year })
}

const searchInvoice = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchInvoice(search), 1000, 'search-invoice')
}

const goToDetail = async (invoice) => {
  await invoiceStore.setInvoice(invoice)
  router.push(`${menuConfig.invoice.path}/${invoice.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
