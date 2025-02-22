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
        <ItemComponent v-for="(backOrder, index) in backOrders" :key="index" :number="index + 1" :item="backOrder"
          @click="goToDetail(backOrder)" />
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
import { useBackOrderStore } from '@/stores/back-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const backOrderStore = useBackOrderStore()

const { backOrders } = storeToRefs(backOrderStore)

const searchBackOrder = () => {
  console.log('SEARCH BACK ORDER')
}

const handleUpdateSearch = () => {
  debounce(searchBackOrder, 1000, 'search-backOrder')
}

const goToDetail = (backOrder) => {
  router.push(`${menuConfig.back_order.path}/${backOrder.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
