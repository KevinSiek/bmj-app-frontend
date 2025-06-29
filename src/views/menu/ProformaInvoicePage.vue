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
        <div v-if="proformaInvoices?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <ItemComponent v-for="(pi, index) in proformaInvoices" :key="index" :number="index + paginationData.from"
            :item="pi" :first-section="pi.project.proformaInvoiceNumber" :second-section="pi.project.date"
            :third-section="pi.project.type" :current-status="pi.currentStatus" @click="goToDetail(pi)" />
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
import { useProformaInvoiceStore } from '@/stores/proforma-invoice'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const proformaInvoiceStore = useProformaInvoiceStore()
const { selectedMonth, selectedYear } = useDate()

const { proformaInvoices, paginationData, isLoading } = storeToRefs(proformaInvoiceStore)

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
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

const searchProformaInvoice = (search) => {
  updateQuery(router, route, { ...route.query, search })
}

const handleUpdateSearch = (search) => {
  debounce(() => searchProformaInvoice(search), 1000, 'search-proformaInvoice')
}

const goToDetail = async (pi) => {
  await proformaInvoiceStore.setProformaInvoice(pi)
  router.push(`${menuConfig.proforma_invoice.path}/${pi.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
