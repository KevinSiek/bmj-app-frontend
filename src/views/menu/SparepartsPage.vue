<template>
  <div class="contain">
    <div class="upper">
      <div class="left">
        <SearchBar @updated="handleUpdateSearch" />
      </div>
      <div class="btn-add">
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addPriceListModal" @click="goToAdd">Add
          Sparepart</button>
      </div>
    </div>
    <div class="lower shadow">
      <SelectDate />
      <div class="list">
        <ItemComponent v-for="(sparepart, index) in spareparts" :key="index" :number="index + 1" :item="sparepart"
          @click="goToDetail(sparepart)" />
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
import { useSparepartStore } from '@/stores/sparepart'
import { storeToRefs } from 'pinia'
import debounce from '@/utils/debouncer'

const router = useRouter()
const sparepartStore = useSparepartStore()

const { spareparts } = storeToRefs(sparepartStore)

const searchSparepart = () => {
  console.log('SEARCH SPAREPART')
}

const handleUpdateSearch = () => {
  debounce(searchSparepart, 1000, 'search-sparepart')
}

const goToAdd = () => {
  router.push(menuConfig.spareparts_add.path)
}
const goToDetail = (sparepart) => {
  router.push(`${menuConfig.spareparts.path}/${sparepart.id}`)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/page.scss';
</style>
