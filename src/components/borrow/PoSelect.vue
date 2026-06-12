<template>
  <div class="po-select">
    <input
      type="text"
      class="form-control"
      :placeholder="placeholder"
      v-model="searchText"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      @keyup="onSearch"
      :disabled="disabled"
    >
    <ul class="dropdown-menu po-select__menu">
      <li
        v-for="po in poOptions"
        :key="po.id"
        class="dropdown-item"
        @click="select(po)"
      >
        <span class="fw-semibold">{{ po.poNumber || po.purchaseOrderNumber }}</span>
        <span class="text-muted ms-2">{{ po.purchaseOrderDate }}</span>
      </li>
      <li v-if="poOptions.length === 0" class="dropdown-item text-muted">No purchase orders</li>
      <li v-if="hasMore" class="dropdown-item text-center text-primary" @click.stop="loadMore">
        Load more…
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBorrowStore } from '@/stores/borrow'
import debounce from '@/utils/debouncer'

const props = defineProps({
  // 'Service' (request link) or 'Spareparts' (reconciliation).
  type: { type: String, required: true },
  placeholder: { type: String, default: 'Search purchase order' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

const borrowStore = useBorrowStore()
const { poOptions, poOptionsPage, poOptionsLastPage } = storeToRefs(borrowStore)

const searchText = ref('')

const hasMore = computed(() => poOptionsPage.value < poOptionsLastPage.value)

const fetch = (page = 1) =>
  borrowStore.getPurchaseOrderOptions({ type: props.type, search: searchText.value, page })

const onSearch = () => {
  debounce(() => fetch(1), 400, 'po-select-search')
}

const loadMore = () => fetch(poOptionsPage.value + 1)

const select = (po) => {
  searchText.value = po.poNumber || po.purchaseOrderNumber
  emit('select', po)
}

// Prime the list on first focus so the dropdown isn't empty before typing.
fetch(1)
</script>

<style lang="scss" scoped>
.po-select {
  position: relative;

  &__menu {
    width: 100%;
    max-height: 240px;
    overflow-y: auto;
  }
}
</style>
