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
        <ItemComponent v-for="(pi, index) in proformaInvoices" :key="index" :number="index + 1" :item="pi"
          @click="goToDetail(pi)" />
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
import { useProformaInvoiceStore } from '@/stores/proforma-invoice'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const proformaInvoiceStore = useProformaInvoiceStore()

const { proformaInvoices } = storeToRefs(proformaInvoiceStore)

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
