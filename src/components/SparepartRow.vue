<template>
  <div class="list row">
    <div class="col-11">
      <div class="row">
        <!-- REUSED: Sparepart Name with Clickable Button Suggestions -->
        <div :class="nameColumnClass + ' sparepart-container'">
          <input type="text" class="form-control mt-2" v-model="localSparepart.sparepartName" placeholder="Part Name"
            @input="handleInputSearch(localSparepart.sparepartName)"
            @keyup="handleInputSearch(localSparepart.sparepartName)"
            :class="{ 'is-invalid': !localSparepart.sparepartId && localSparepart.sparepartName }">
          
          <!-- REUSED: Button-based suggestions dropdown -->
          <div v-if="suggestions.length > 0" class="sparepart-dropdown">
            <button
              v-for="(item, index) in suggestions"
              :key="index"
              type="button"
              class="sparepart-suggestion-btn"
              @mousedown.prevent
              @click="selectItem(item)"
            >
              {{ getSparepartName(item) }}
            </button>
          </div>
          
          <!-- REUSED: Added validation feedback -->
          <div v-if="!localSparepart.sparepartId && localSparepart.sparepartName" class="invalid-feedback">
            Please select from suggestions to link sparepart ID
          </div>
        </div>
        
        <!-- REUSED: Part Number with Clickable Button Suggestions -->
        <div :class="numberColumnClass + ' sparepart-container'">
          <input type="text" class="form-control mt-2" v-model="localSparepart.sparepartNumber"
            placeholder="Part Number"
            @input="handleInputSearch(localSparepart.sparepartNumber)"
            @keyup="handleInputSearch(localSparepart.sparepartNumber)">
          
          <!-- REUSED: Button-based suggestions -->
          <div v-if="suggestions.length > 0" class="sparepart-dropdown">
            <button
              v-for="(item, index) in suggestions"
              :key="index"
              type="button"
              class="sparepart-suggestion-btn"
              @mousedown.prevent
              @click="selectItem(item)"
            >
              {{ getSparepartNumber(item) }}
            </button>
          </div>
        </div>
        
        <div class="col-2">
          <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="localSparepart.quantity"
            @input="updateCalculation">
        </div>
        <div class="col-2">
          <input type="number" class="form-control mt-2" placeholder="Unit Price"
            v-model="localSparepart.unitPrice" @change="updateCalculation">
        </div>
        <div class="col-2">
          <input type="number" class="form-control mt-2" placeholder="Total Price"
            v-model="localSparepart.totalPrice" disabled>
        </div>
      </div>
    </div>
    <div class="col-1">
      <button type="button" class="btn btn-outline-danger" @click="$emit('remove')"><i
          class="bi bi-trash3"></i></button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String,
    default: 'purchase', // 'purchase' | 'quotation'
    validator: (value) => ['purchase', 'quotation'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'remove'])

// Local reactive copy
const localSparepart = ref({ ...props.modelValue })

// Column classes based on mode (Purchase uses col-4 and col-2, Quotation uses col-3 and col-3)
const nameColumnClass = computed(() => {
  return props.mode === 'purchase' ? 'col-4' : 'col-3'
})

const numberColumnClass = computed(() => {
  return props.mode === 'purchase' ? 'col-2' : 'col-3'
})

// Handle different field naming conventions
const getSparepartName = (item) => {
  return item.sparepartName || item.sparepart_name || item.name || ''
}

const getSparepartNumber = (item) => {
  return item.sparepartNumber || item.sparepart_number || item.part_number || ''
}

const handleInputSearch = (searchTerm) => {
  emit('search', searchTerm)
}

const selectItem = (sparepartData) => {
  if (!sparepartData) {
    console.warn('No sparepart data provided for selection')
    return
  }
  
  console.log('Selecting sparepart:', sparepartData, 'Mode:', props.mode)
  
  // Map sparepartId with comprehensive fallbacks
  const updatedSparepart = {
    ...localSparepart.value,
    sparepartId: sparepartData.sparepartId || sparepartData.id || sparepartData.sparepart_id,
    sparepartName: getSparepartName(sparepartData),
    sparepartNumber: getSparepartNumber(sparepartData),
    quantity: localSparepart.value.quantity || 1,
    stock: sparepartData.stock || sparepartData.available_stock || 'available'
  }
  
  // Set unit price based on mode
  if (props.mode === 'purchase') {
    updatedSparepart.unitPrice = sparepartData.unitPriceBuy || sparepartData.unit_price_buy || sparepartData.purchase_price || 0
  } else if (props.mode === 'quotation') {
    updatedSparepart.unitPrice = sparepartData.unitPriceSell || sparepartData.unit_price_sell || sparepartData.selling_price || 0
  }
  
  // Calculate total price
  updatedSparepart.totalPrice = (updatedSparepart.quantity || 0) * (updatedSparepart.unitPrice || 0)
  
  console.log('Final sparepart data with ID:', updatedSparepart.sparepartId, updatedSparepart)
  
  // Validate sparepartId is properly set
  if (!updatedSparepart.sparepartId) {
    console.error('CRITICAL ERROR: sparepartId not set after selection!')
    console.error('Original sparepartData:', sparepartData)
    alert('Error: Could not get sparepart ID from selection. Please check the sparepart data format.')
    return
  }
  
  // Update local copy and emit
  localSparepart.value = updatedSparepart
  emit('update:modelValue', updatedSparepart)
  
  console.log('Sparepart selection completed successfully with sparepartId:', updatedSparepart.sparepartId)
}

const updateCalculation = () => {
  const updatedSparepart = { ...localSparepart.value }
  updatedSparepart.totalPrice = (updatedSparepart.quantity || 0) * (updatedSparepart.unitPrice || 0)
  
  localSparepart.value = updatedSparepart
  emit('update:modelValue', updatedSparepart)
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localSparepart.value = { ...newValue }
}, { deep: true })
</script>

<style lang="scss" scoped>
// REUSED: Sparepart container for dropdown positioning (from Purchase page)
.sparepart-container {
  position: relative;
}

// REUSED: Proper sparepart dropdown styling (from Purchase page)
.sparepart-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-top: 2px;
}

// REUSED: Clickable sparepart suggestion buttons (from Purchase page)
.sparepart-suggestion-btn {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: #212529;
  border-bottom: 1px solid #f8f9fa;
  
  &:hover {
    background-color: #e9ecef;
    color: #16181b;
  }
  
  &:focus {
    outline: none;
    background-color: #f8f9fa;
  }
  
  &:active {
    background-color: #dee2e6;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.list {
  display: flex;
  align-items: flex-end;
}
</style>