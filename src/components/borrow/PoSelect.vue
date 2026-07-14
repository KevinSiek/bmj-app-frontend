<template>
  <div class="po-select">
    <input ref="inputRef" type="text" class="form-control" :placeholder="placeholder" v-model="searchText"
      data-bs-toggle="dropdown" aria-expanded="false" @keyup="onSearch" :disabled="disabled">
    <ul class="dropdown-menu po-select__menu">
      <li v-for="po in poOptions" :key="po.id" class="dropdown-item" @click="select(po)">
        <span class="fw-semibold">{{ po.poNumber || po.purchaseOrderNumber }}</span>
        <span class="text-muted ms-2">{{ po.purchaseOrderDate }}</span>
      </li>
      <li v-if="isLoading" class="dropdown-item text-center">
        <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
      </li>
      <li v-else-if="poOptions.length === 0" class="dropdown-item text-muted">No purchase orders</li>
      <li v-if="!isLoading && hasMore" class="dropdown-item text-center text-primary" @click.stop="loadMore">
        Load more…
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import debounce from '@/utils/debouncer'

const props = defineProps({
  // 'Service' (request link) or 'Spareparts' (reconciliation).
  type: { type: String, required: true },
  placeholder: { type: String, default: 'Search purchase order' },
  disabled: { type: Boolean, default: false },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['select', 'update:modelValue', 'clear'])

const purchaseOrderStore = usePurchaseOrderStore()
const { poOptions, poOptionsPage, poOptionsLastPage } = storeToRefs(purchaseOrderStore)

const searchText = ref('')
const isLoading = ref(false)
const inputRef = ref(null)

const hasMore = computed(() => poOptionsPage.value < poOptionsLastPage.value)

const fetch = async (page = 1) => {
  isLoading.value = true
  try {
    await purchaseOrderStore.getPurchaseOrderOptions({ type: props.type, search: searchText.value, page })
  } finally {
    isLoading.value = false
  }
}

const onSearch = () => {
  if (searchText.value === '') emit('clear')
  debounce(() => fetch(1), 400, 'po-select-search')
}

const loadMore = () => fetch(poOptionsPage.value + 1)

const select = (po) => {
  searchText.value = po.poNumber || po.purchaseOrderNumber
  emit('select', po)
  emit('update:modelValue', searchText.value)
}

watch(() => props.modelValue, (newVal) => {
  searchText.value = newVal || ''
}, { immediate: true })

// On mount, only prime the list if a value is already set.
if (searchText.value !== '') fetch(1)

onMounted(() => {
  inputRef.value?.addEventListener('show.bs.dropdown', () => {
    if (searchText.value !== '') fetch(1)
  })
  inputRef.value?.addEventListener('hidden.bs.dropdown', () => {
    purchaseOrderStore.resetPurchaseOrderOptions()
  })
})

onUnmounted(() => {
  purchaseOrderStore.resetPurchaseOrderOptions()
})
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
