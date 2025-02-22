<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @updated="handleUpdateSearch" />
        <div class="review">
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addPriceListModal">Review</button>
        </div>
      </div>
    </div>
    <div class="lower shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(po, index) in purchaseOrders" :key="index" :number="index + 1" :item="po"
          @click="goToDetail(po)" />
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
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const purchaseOrderStore = usePurchaseOrderStore()

const { purchaseOrders } = storeToRefs(purchaseOrderStore)

const searchPurchaseOrder = () => {
  console.log('SEARCH PURCHASE ORDER')
}

const handleUpdateSearch = () => {
  debounce(searchPurchaseOrder, 1000, 'search-purchaseOrder')
}

const goToDetail = (po) => {
  router.push(`${menuConfig.purchase_order.path}/${po.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
