<template>
  <div class="search-autocomplete position-relative">
    <div class="input-group">
      <input 
        type="text" 
        class="form-control input-search" 
        v-model="search" 
        @input="handleInput"
        @keyup.enter="handleSearchClick"
        @focus="isFocused = true"
        @blur="handleBlur"
        placeholder="Search Spareparts, PO, Employee, Customers..."
      >
      <button class="btn btn-primary search-btn" type="button" @click="handleSearchClick">
        <i class="bi bi-search"></i>
      </button>
    </div>
    
    <!-- Suggestions Dropdown -->
    <div v-if="isFocused && (isLoading || suggestions.length > 0)" class="suggestions-dropdown shadow rounded bg-white">
      <div v-if="isLoading" class="p-2 text-muted text-center small">
        Searching...
      </div>
      <div v-else class="suggestion-list">
        <div 
          v-for="(suggestion, index) in suggestions" 
          :key="`${suggestion.type}-${suggestion.id}`"
          class="suggestion-item p-2 border-bottom"
          @mousedown="selectSuggestion(suggestion)"
        >
          <div class="fw-bold small" style="color: #0d6efd;">{{ suggestion.type }}</div>
          <div class="small">{{ suggestion.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import stockMovementApi from '@/api/stock-movement'

const emit = defineEmits(['searched', 'selected'])

const search = ref('')
const suggestions = ref([])
const isLoading = ref(false)
const isFocused = ref(false)
let debounceTimeout = null
let pendingSelection = null

const handleInput = () => {
  pendingSelection = null // clear pending selection if they type
  if (debounceTimeout) clearTimeout(debounceTimeout)
  
  if (!search.value.trim()) {
    suggestions.value = []
    return
  }

  debounceTimeout = setTimeout(async () => {
    fetchSuggestions(search.value)
  }, 400)
}

const fetchSuggestions = async (query) => {
  isLoading.value = true
  try {
    const { data } = await stockMovementApi.getSuggestions(query)
    suggestions.value = data.data || []
  } catch (error) {
    console.error('Error fetching suggestions', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

const selectSuggestion = (suggestion) => {
  search.value = suggestion.label
  pendingSelection = suggestion
  suggestions.value = []
  isFocused.value = false
}

const handleSearchClick = () => {
  suggestions.value = []
  isFocused.value = false
  if (pendingSelection) {
    emit('selected', { filter_type: pendingSelection.type, filter_id: pendingSelection.id })
  } else {
    emit('searched', search.value)
  }
}

const handleBlur = () => {
  // Timeout to allow mousedown on suggestion to fire before hiding dropdown
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}
</script>

<style lang="scss" scoped>
.search-autocomplete {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 250px;
  max-width: 400px;
  
  .input-group {
    width: 100%;
  }

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    margin-top: 4px;
    
    .suggestion-item {
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      &:last-child {
        border-bottom: none !important;
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .search-autocomplete {
    max-width: 100%;
  }
}
</style>
