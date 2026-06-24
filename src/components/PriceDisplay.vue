<template>
  <div class="price-display d-flex justify-content-between align-items-center w-100" style="min-width: 140px; font-family: inherit;">
    <span class="currency-symbol text-start pe-2">Rp.</span>
    <span class="currency-value text-end">{{ formattedMoney }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '@/utils/form-util'

const props = defineProps({
  value: {
    type: [Number, String],
    default: 0
  }
})

const formattedMoney = computed(() => {
  const val = Number(props.value)
  if (isNaN(val)) return '0'
  return formatMoney(val)
})
</script>

<style scoped>
.price-display {
  display: inline-flex !important;
}
.currency-symbol {
  white-space: nowrap;
}
.currency-value {
  white-space: nowrap;
}
</style>
