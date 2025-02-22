<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @updated="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" @click="goToAdd">Add Purchase</button>
      </div>
    </div>
    <div class="lower shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(purchase, index) in purchases" :key="index" :number="index + 1" :item="purchase"
          @click="goToDetail(purchase)" />
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
import { usePurchaseStore } from '@/stores/purchase'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const purchaseStore = usePurchaseStore()

const { purchases } = storeToRefs(purchaseStore)

const searchPurchase = () => {
  console.log('SEARCH PURCHASE')
}

const handleUpdateSearch = () => {
  debounce(searchPurchase, 1000, 'search-purchase')
}
const goToAdd = () => {
  router.push(menuConfig.purchase_add.path)
}
const goToDetail = (purchase) => {
  router.push(`${menuConfig.purchase.path}/${purchase.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
