<template>
  <div class="sparepart-selector">
    <div class="form-group">
      <label class="form-label">Select Sparepart</label>
      <div class="input-group">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          @focus="showDropdown = true"
          type="text"
          class="form-control"
          :placeholder="selectedSparepart ? `${selectedSparepart.part_number} — ${selectedSparepart.name}` : 'Search spareparts...'"
          :class="{ 'is-invalid': !selectedSparepart && required, 'is-valid': selectedSparepart }"
        />
        <button 
          v-if="selectedSparepart"
          @click="clearSelection"
          type="button" 
          class="btn btn-outline-secondary"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <!-- Dropdown Results -->
      <div 
        v-if="showDropdown && (filteredSpareparts.length > 0 || loading)"
        class="dropdown-menu show w-100 mt-1"
        style="max-height: 300px; overflow-y: auto;"
      >
        <div v-if="loading" class="dropdown-item-text">
          <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            Loading spareparts...
          </div>
        </div>
        
        <button
          v-for="sparepart in filteredSpareparts"
          :key="sparepart.id"
          @click="selectSparepart(sparepart)"
          type="button"
          class="dropdown-item"
          :class="{ 'active': selectedSparepart?.id === sparepart.id }"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ sparepart.part_number }}</strong> — {{ sparepart.name }}
              <br>
              <small class="text-muted">{{ sparepart.category || 'General' }}</small>
            </div>
            <div class="text-end">
              <small class="text-success">
                {{ formatCurrency(sparepart.selling_price || sparepart.default_price || 0) }}
              </small>
              <br>
              <small class="text-muted">Stock: {{ sparepart.stock || 0 }}</small>
            </div>
          </div>
        </button>
        
        <div v-if="!loading && filteredSpareparts.length === 0" class="dropdown-item-text text-muted">
          No spareparts found matching "{{ searchQuery }}"
        </div>
      </div>
      
      <!-- Validation Error -->
      <div v-if="!selectedSparepart && required && showValidation" class="invalid-feedback d-block">
        Please select a sparepart from the list
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  branchId: {
    type: String,
    default: 'all'
  },
  required: {
    type: Boolean,
    default: true
  },
  initialValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select', 'clear'])

// Reactive state
const searchQuery = ref('')
const selectedSparepart = ref(props.initialValue)
const spareparts = ref([])
const loading = ref(false)
const showDropdown = ref(false)
const showValidation = ref(false)

// Computed
const filteredSpareparts = computed(() => {
  if (!searchQuery.value) return spareparts.value
  
  const query = searchQuery.value.toLowerCase()
  return spareparts.value.filter(sp => 
    sp.name.toLowerCase().includes(query) || 
    sp.part_number.toLowerCase().includes(query)
  )
})

// Methods
const fetchSpareparts = async () => {
  try {
    loading.value = true
    const params = {
      page: 1,
      perPage: 100,
      ...(props.branchId !== 'all' && { branch: props.branchId })
    }
    
    const response = await axios.get('/api/spareparts', { params })
    spareparts.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching spareparts:', error)
    spareparts.value = []
  } finally {
    loading.value = false
  }
}

const selectSparepart = (sparepart) => {
  selectedSparepart.value = sparepart
  searchQuery.value = ''
  showDropdown.value = false
  showValidation.value = false
  
  emit('select', {
    sparepartId: sparepart.id,
    name: sparepart.name,
    part_number: sparepart.part_number,
    unit_price: sparepart.selling_price || sparepart.default_price || 0,
    category: sparepart.category,
    stock: sparepart.stock
  })
}

const clearSelection = () => {
  selectedSparepart.value = null
  searchQuery.value = ''
  showValidation.value = true
  emit('clear')
}

const handleSearch = () => {
  showDropdown.value = true
  if (!searchQuery.value && selectedSparepart.value) {
    showValidation.value = true
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Watchers
watch(() => props.branchId, () => {
  fetchSpareparts()
})

// Click outside to close dropdown
const handleClickOutside = (event) => {
  if (!event.target.closest('.sparepart-selector')) {
    showDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchSpareparts()
  document.addEventListener('click', handleClickOutside)
})

// Expose validation method for parent
defineExpose({
  validate: () => {
    showValidation.value = true
    return !!selectedSparepart.value
  },
  getSelected: () => selectedSparepart.value
})
</script>

<style scoped>
.sparepart-selector {
  position: relative;
}

.dropdown-menu {
  display: block;
  position: absolute;
  z-index: 1000;
}

.dropdown-item:hover {
  background-color: var(--bs-primary);
  color: white;
}

.dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.input-group .btn {
  border-left: 0;
}
</style>