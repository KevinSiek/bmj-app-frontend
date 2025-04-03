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
        <ItemComponent v-for="(pi, index) in proformaInvoices" :key="index" :number="index + paginationData.from"
          :item="pi" first-section-key="no_pi" @click="goToDetail(pi)" />
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
import { useProformaInvoiceStore } from '@/stores/proforma-invoice'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'

const route = useRoute()
const router = useRouter()
const proformaInvoiceStore = useProformaInvoiceStore()

const { proformaInvoices, paginationData } = storeToRefs(proformaInvoiceStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page) {
    updateQuery(router, route, { ...route.query, page: 1 })
    return
  }
  fetchProformaInvoice()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    fetchProformaInvoice()
    console.log("REFETCH PURCHASE")
  }
})

const fetchProformaInvoice = async () => {
  const { page, search, month, year } = route.query
  proformaInvoiceStore.getAllProformaInvoices({ page, search, month, year })
}

const searchProformaInvoice = () => {
  console.log('SEARCH PROFORMA INVOICE')
}

const handleUpdateSearch = () => {
  debounce(searchProformaInvoice, 1000, 'search-proformaInvoice')
}

const goToDetail = (pi) => {
  router.push(`${menuConfig.proforma_invoice.path}/${pi.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
