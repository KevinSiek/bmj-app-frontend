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
        <ItemComponent v-for="(invoice, index) in invoices" :key="index" :number="index + 1" :item="invoice"
          @click="goToDetail(invoice)" />
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
import { useInvoiceStore } from '@/stores/invoice'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const invoiceStore = useInvoiceStore()

const { invoices } = storeToRefs(invoiceStore)

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
