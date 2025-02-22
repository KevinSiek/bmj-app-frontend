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
        <ItemComponent v-for="(workOrder, index) in workOrders" :key="index" :number="index + 1" :item="workOrder"
          bigRow @click="goToDetail(workOrder)" />
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
import { useWorkOrderStore } from '@/stores/work-order'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const workOrderStore = useWorkOrderStore()

const { workOrders } = storeToRefs(workOrderStore)

const searchWorkOrder = () => {
  console.log('SEARCH WORK ORDER')
}

const handleUpdateSearch = () => {
  debounce(searchWorkOrder, 1000, 'search-workOrder')
}

const goToDetail = (workOrder) => {
  router.push(`${menuConfig.work_order.path}/${workOrder.id}`)
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
