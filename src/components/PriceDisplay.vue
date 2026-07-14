<template>
  <div class="price-display align-items-center">
    <span class="currency-symbol">Rp.</span>
    <span class="price-value">{{ formattedAmount }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Number, String], default: 0 }
})

const formattedAmount = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return '0'
  const num = Math.round(Number(props.value) || 0)
  return new Intl.NumberFormat('id-ID').format(num)
})
</script>

<style scoped>
.price-display {
  display: inline-flex;
  justify-content: space-between;
  width: 100%;
  max-width: 200px;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
</style>
