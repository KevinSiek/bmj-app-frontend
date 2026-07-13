<template>
  <tr class="purchase-item-row">
    <!-- Sparepart Selection -->
    <td colspan="2">
      <SparepartSelector 
        :branch-id="branchId"
        :initial-value="item.selectedSparepart"
        @select="handleSparepartSelect"
        @clear="handleSparepartClear"
        :required="true"
      />
    </td>
    
    <!-- Quantity -->
    <td>
      <input
        v-model.number="localItem.quantity"
        @input="updateTotals"
        @wheel.prevent
        type="number"
        class="form-control"
        placeholder="Qty"
        min="1"
        :disabled="!localItem.sparepartId"
      />
    </td>
    
    <!-- Unit Price (Auto-filled from sparepart) -->
    <td>
      <CurrencyInput
        v-model="localItem.unit_price"
        @update:model-value="updateTotals"
        input-class="form-control"
        placeholder="Unit Price"
        :disabled="!localItem.sparepartId"
      />
    </td>
    
    <!-- Total Price (Calculated) -->
    <td>
      <input
        v-model="localItem.total_price" :disabled="true"
        type="text"
        class="form-control"
        readonly
        disabled
      />
    </td>
    
    <!-- Remove Row -->
    <td>
      <button 
        @click="$emit('remove')"
        type="button" 
        class="btn btn-outline-danger btn-sm"
      >
        <i class="bi bi-trash"></i>
      </button>
    </td>
  </tr>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SparepartSelector from './SparepartSelector.vue'
import CurrencyInput from '@/components/CurrencyInput.vue'
import { formatCurrency } from '@/utils/form-util'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  branchId: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['update', 'remove'])

const localItem = ref({ ...props.item })

const handleSparepartSelect = (sparepartData) => {
  localItem.value = {
    ...localItem.value,
    sparepartId: sparepartData.sparepartId,
    name: sparepartData.name,
    part_number: sparepartData.part_number,
    unit_price: sparepartData.unit_price,
    selectedSparepart: {
      id: sparepartData.sparepartId,
      name: sparepartData.name,
      part_number: sparepartData.part_number
    }
  }
  updateTotals()
}

const handleSparepartClear = () => {
  localItem.value = {
    ...localItem.value,
    sparepartId: null,
    name: '',
    part_number: '',
    unit_price: 0,
    quantity: 0,
    total_price: 0,
    selectedSparepart: null
  }
  emit('update', localItem.value)
}

const updateTotals = () => {
  localItem.value.total_price = (localItem.value.quantity || 0) * (localItem.value.unit_price || 0)
  emit('update', localItem.value)
}

watch(() => props.item, (newItem) => {
  localItem.value = { ...newItem }
}, { deep: true })

defineExpose({
  validate: () => {
    return !!localItem.value.sparepartId && 
           localItem.value.quantity > 0 && 
           localItem.value.unit_price > 0
  },
  getItem: () => localItem.value
})
</script>

<style scoped>
.purchase-item-row {
  vertical-align: middle;
}

.purchase-item-row td {
  padding: 0.5rem;
}

.form-control:disabled {
  background-color: #f8f9fa;
}
</style>