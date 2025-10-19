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
          <div v-for="(allPI, index) in proformaInvoices" :key="index">
            <template v-if="allPI.versions.length > 1">
              <ItemComponent :number="index + paginationData.from" :item="allPI.versions[allPI.versions.length - 1]"
                :first-section="allPI.versions[allPI.versions.length - 1].project.proformaInvoiceNumber"
                :second-section="allPI.versions[allPI.versions.length - 1].project.date"
                :third-section="allPI.versions[allPI.versions.length - 1].project.type" wideRow
                :current-status="allPI.versions[allPI.versions.length - 1].currentStatus" data-bs-toggle="collapse"
                :data-bs-target="'#collapsChild' + index" />
              <div class="collapse" :id="'collapsChild' + index">
                <div v-for="(pi, versionIndex) in allPI.versions" :key="versionIndex">
                  <ItemComponent :number="(index + paginationData.from) + ' - ' + (versionIndex + 1)" :item="pi"
                    :first-section="pi.project.proformaInvoiceNumber" :second-section="pi.project.date"
                    :third-section="pi.project.type" :current-status="pi.currentStatus" class="item-child" wideRow
                    @click="goToDetail(pi)" :class="{ disabled: versionIndex != (allPI.versions.length - 1) }" />
                </div>
              </div>
            </template>
            <ItemComponent v-else :number="index + paginationData.from" :item="allPI.versions[0]"
              :first-section="allPI.versions[0].project.proformaInvoiceNumber"
              :second-section="allPI.versions[0].project.date" :third-section="allPI.versions[0].project.type" wideRow
              :current-status="allPI.versions[0].currentStatus" @click="goToDetail(allPI.versions[0])" />
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
    debounce(() => fetchProformaInvoice(), 500, 'fetch-proforma-invoice')
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

.item-child {
  margin-left: 10%;
}

.disabled {
  background-color: rgb(219, 219, 219);
  border-color: transparent;
}
</style>
