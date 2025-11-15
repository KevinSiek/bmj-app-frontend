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
        <div v-if="invoices?.length == 0">
          <div class="no-data-text">
            No Data
          </div>
        </div>
        <div v-else class="list">
          <div v-for="(allInv, index) in invoices" :key="index">
            <template v-if="allInv.versions.length > 1">
              <ItemComponent :number="index + paginationData.from" :item="allInv.versions[allInv.versions.length - 1]"
                :first-section="allInv.versions[allInv.versions.length - 1].invoice.invoiceNumber"
                :second-section="allInv.versions[allInv.versions.length - 1].invoice.date"
                :third-section="allInv.versions[allInv.versions.length - 1].invoice.type" wideRow
                :current-status="allInv.versions[allInv.versions.length - 1].currentStatus" data-bs-toggle="collapse"
                :data-bs-target="'#collapsChild' + index" />
              <div class="collapse" :id="'collapsChild' + index">
                <div v-for="(inv, versionIndex) in allInv.versions" :key="versionIndex">
                  <ItemComponent :number="(index + paginationData.from) + ' - ' + (versionIndex + 1)" :item="inv"
                    :first-section="inv.invoice.invoiceNumber" :second-section="inv.invoice.date"
                    :third-section="inv.invoice.type" :current-status="inv.currentStatus" class="item-child" wideRow
                    @click="goToDetail(inv)" :class="{ disabled: versionIndex != (allInv.versions.length - 1) }" />
                </div>
              </div>
            </template>
            <ItemComponent v-else :number="index + paginationData.from" :item="allInv.versions[0]"
              :first-section="allInv.versions[0].invoice.invoiceNumber"
              :second-section="allInv.versions[0].invoice.date" :third-section="allInv.versions[0].invoice.type" wideRow
              :current-status="allInv.versions[0].currentStatus" @click="goToDetail(allInv.versions[0])" />
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
import { useInvoiceStore } from '@/stores/invoice'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'
import { onBeforeMount, onMounted, watch } from 'vue'
import { updateQuery } from '@/utils/route-util'
import { useDate } from '@/composeable/useDate'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const { selectedMonth, selectedYear } = useDate()

const { invoices, paginationData, isLoading } = storeToRefs(invoiceStore)

onBeforeMount(() => {
  isLoading.value = true
  invoiceStore.$resetInvoices()
})

onMounted(async () => {
  // Handle first load
  if (!route.query.page || !route.query.month || !route.query.year) {
    updateQuery(router, route, { page: 1, month: selectedMonth.value, year: selectedYear.value })
    return
  }
  fetchInvoice()
})

watch(() => route.query, (before, after) => {
  if (!route.query.page) {
    return
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    debounce(() => fetchInvoice(), 500, 'fetch-invoice')
  }
})

const fetchInvoice = async () => {
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

.item-child {
  margin-left: 10%;
}

.disabled {
  background-color: rgb(219, 219, 219);
  border-color: transparent;
}
</style>
