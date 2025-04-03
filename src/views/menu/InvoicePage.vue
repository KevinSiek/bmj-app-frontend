<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @searched="handleUpdateSearch" />
      </div>
    </div>
    <div class="lower paginate shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(invoice, index) in invoices" :key="index" :number="index + paginationData.from"
          :item="invoice" first-section-key="no_invoice" @click="goToDetail(invoice)" />
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

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()

const { invoices, paginationData } = storeToRefs(invoiceStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { ...route.query, page: 1 })
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

const searchInvoice = () => {
  console.log('SEARCH INVOICE')
}

const handleUpdateSearch = () => {
  debounce(searchInvoice, 1000, 'search-invoice')
}

const goToDetail = (invoice) => {
  router.push(`${menuConfig.invoice.path}/${invoice.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
