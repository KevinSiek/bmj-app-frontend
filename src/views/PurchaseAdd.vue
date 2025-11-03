<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4>Add Purchase</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitPurchase">
              <!-- Purchase Items Table -->
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th colspan="2">Sparepart</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <PurchaseItemRow
                      v-for="(item, index) in purchaseItems"
                      :key="index"
                      :item="item"
                      :branch-id="selectedBranch"
                      @update="(updatedItem) => updateItem(index, updatedItem)"
                      @remove="removeItem(index)"
                      :ref="el => { if (el) itemRefs[index] = el }"
                    />
                  </tbody>
                </table>
              </div>
              
              <!-- Add Sparepart Button -->
              <div class="mb-3">
                <button 
                  @click="addItem" 
                  type="button" 
                  class="btn btn-outline-primary"
                >
                  <i class="bi bi-plus-circle"></i> Add Sparepart
                </button>
              </div>
              
              <!-- Description -->
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea
                  v-model="formData.description"
                  id="description"
                  class="form-control"
                  rows="3"
                  placeholder="Purchase description"
                  required
                ></textarea>
              </div>
              
              <!-- Total Purchase -->
              <div class="mb-3">
                <h5>Total Purchase: {{ formatCurrency(totalPurchase) }}</h5>
              </div>
              
              <!-- Submit Button -->
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-success"
                  :disabled="!canSubmit || submitting"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ submitting ? 'Creating Purchase...' : 'Create Purchase' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Purchase</h5>
          </div>
          <div class="modal-body">
            <p>Are you sure to Purchase {{ purchaseItems.length }} Spareparts?</p>
            <div class="alert alert-info">
              <strong>Total Amount:</strong> {{ formatCurrency(totalPurchase) }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showConfirmation = false">
              Cancel
            </button>
            <button type="button" class="btn btn-success" @click="confirmSubmit">
              Confirm Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import PurchaseItemRow from '@/components/PurchaseItemRow.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { showToast } = useToast()

// State
const purchaseItems = ref([createEmptyItem()])
const formData = ref({
  description: ''
})
const selectedBranch = ref('jakarta')
const submitting = ref(false)
const showConfirmation = ref(false)
const itemRefs = ref([])

// Computed
const totalPurchase = computed(() => {
  return purchaseItems.value.reduce((sum, item) => sum + (item.total_price || 0), 0)
})

const canSubmit = computed(() => {
  return purchaseItems.value.length > 0 &&
         purchaseItems.value.every(item => 
           item.sparepartId && 
           item.quantity > 0 && 
           item.unit_price > 0
         ) &&
         formData.value.description.trim()
})

// Methods
function createEmptyItem() {
  return {
    sparepartId: null,
    name: '',
    part_number: '',
    quantity: 0,
    unit_price: 0,
    total_price: 0,
    selectedSparepart: null
  }
}

function addItem() {
  purchaseItems.value.push(createEmptyItem())
}

function removeItem(index) {
  purchaseItems.value.splice(index, 1)
  if (purchaseItems.value.length === 0) {
    addItem()
  }
}

function updateItem(index, updatedItem) {
  purchaseItems.value[index] = updatedItem
}

function submitPurchase() {
  // Validate all items
  const allValid = itemRefs.value.every(ref => ref?.validate())
  
  if (!allValid) {
    showToast('Please complete all sparepart selections', 'error')
    return
  }
  
  showConfirmation.value = true
}

async function confirmSubmit() {
  try {
    submitting.value = true
    showConfirmation.value = false
    
    const payload = {
      spareparts: purchaseItems.value.map(item => ({
        sparepartId: item.sparepartId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })),
      description: formData.value.description,
      total_purchase: totalPurchase.value
    }
    
    const response = await axios.post('/api/purchases', payload)
    
    showToast('Purchase created successfully!', 'success')
    
    // Navigate to purchase list and refresh
    setTimeout(() => {
      router.push('/purchase?refresh=true')
    }, 1500)
    
  } catch (error) {
    console.error('Purchase creation error:', error)
    const errorMessage = error.response?.data?.message || 'Failed to create purchase'
    showToast(errorMessage, 'error')
  } finally {
    submitting.value = false
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

// Initialize with one empty item
onMounted(() => {
  if (purchaseItems.value.length === 0) {
    addItem()
  }
})
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table th,
.table td {
  vertical-align: middle;
}
</style>