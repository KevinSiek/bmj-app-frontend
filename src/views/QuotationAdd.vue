<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4>Add Quotation</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitQuotation">
              <!-- Project Details -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Branch</label>
                  <select v-model="formData.branch" class="form-select" required>
                    <option value="">Select Branch</option>
                    <option value="semarang">Semarang</option>
                    <option value="jakarta">Jakarta</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Project Type</label>
                  <select v-model="formData.project_type" class="form-select" required @change="handleProjectTypeChange">
                    <option value="">Select Project Type</option>
                    <option value="spareparts">Spareparts</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>
              
              <!-- Customer Information -->
              <div class="card mb-3">
                <div class="card-header">
                  <h6>Customer</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Company Name</label>
                      <input v-model="formData.customer.company_name" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Address</label>
                      <input v-model="formData.customer.address" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">City</label>
                      <input v-model="formData.customer.city" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Province</label>
                      <input v-model="formData.customer.province" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Office</label>
                      <input v-model="formData.customer.office" type="text" class="form-control" />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Spareparts Items (shown when project_type is spareparts) -->
              <div v-if="formData.project_type === 'spareparts'" class="card mb-3">
                <div class="card-header">
                  <h6>Spareparts</h6>
                </div>
                <div class="card-body">
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
                          v-for="(item, index) in quotationItems"
                          :key="index"
                          :item="item"
                          :branch-id="formData.branch"
                          @update="(updatedItem) => updateQuotationItem(index, updatedItem)"
                          @remove="removeQuotationItem(index)"
                          :ref="el => { if (el) itemRefs[index] = el }"
                        />
                      </tbody>
                    </table>
                  </div>
                  <button 
                    @click="addQuotationItem" 
                    type="button" 
                    class="btn btn-outline-primary"
                  >
                    <i class="bi bi-plus-circle"></i> Add Sparepart
                  </button>
                </div>
              </div>
              
              <!-- Service Items (shown when project_type is service) -->
              <div v-if="formData.project_type === 'service'" class="card mb-3">
                <div class="card-header">
                  <h6>Service</h6>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Service Name</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(service, index) in serviceItems" :key="index">
                          <td>
                            <input v-model="service.service_name" type="text" class="form-control" required />
                          </td>
                          <td>
                            <input v-model.number="service.quantity" @input="updateServiceTotal(index)" type="number" class="form-control" min="1" required />
                          </td>
                          <td>
                            <input v-model.number="service.unit_price" @input="updateServiceTotal(index)" type="number" class="form-control" min="0" required />
                          </td>
                          <td>
                            <input :value="formatCurrency(service.total_price)" type="text" class="form-control" readonly />
                          </td>
                          <td>
                            <button @click="removeServiceItem(index)" type="button" class="btn btn-outline-danger btn-sm">
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button @click="addServiceItem" type="button" class="btn btn-outline-primary">
                    <i class="bi bi-plus-circle"></i> Add Service
                  </button>
                </div>
              </div>
              
              <!-- Total Amount -->
              <div class="mb-3">
                <h5>Total Amount: {{ formatCurrency(totalAmount) }}</h5>
              </div>
              
              <!-- Notes -->
              <div class="mb-3">
                <label for="notes" class="form-label">Notes</label>
                <textarea
                  v-model="formData.notes"
                  id="notes"
                  class="form-control"
                  rows="3"
                  placeholder="Additional notes"
                ></textarea>
              </div>
              
              <!-- Submit Button -->
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-success"
                  :disabled="!canSubmit || submitting"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ submitting ? 'Creating Quotation...' : 'Add Quotation' }}
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
            <h5 class="modal-title">Confirm Quotation</h5>
          </div>
          <div class="modal-body">
            <p>Are you sure to Add this Quotation?</p>
            <div class="alert alert-info">
              <strong>Total Amount:</strong> {{ formatCurrency(totalAmount) }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showConfirmation = false">
              Cancel
            </button>
            <button type="button" class="btn btn-success" @click="confirmSubmit">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import PurchaseItemRow from '@/components/PurchaseItemRow.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { showToast } = useToast()

// State
const formData = ref({
  branch: '',
  project_type: '',
  customer: {
    company_name: '',
    address: '',
    city: '',
    province: '',
    office: ''
  },
  notes: ''
})

const quotationItems = ref([createEmptyItem()])
const serviceItems = ref([createEmptyServiceItem()])
const submitting = ref(false)
const showConfirmation = ref(false)
const itemRefs = ref([])

// Computed
const totalAmount = computed(() => {
  if (formData.value.project_type === 'spareparts') {
    return quotationItems.value.reduce((sum, item) => sum + (item.total_price || 0), 0)
  } else if (formData.value.project_type === 'service') {
    return serviceItems.value.reduce((sum, item) => sum + (item.total_price || 0), 0)
  }
  return 0
})

const canSubmit = computed(() => {
  const basicValid = formData.value.branch && 
                    formData.value.project_type && 
                    formData.value.customer.company_name
  
  if (formData.value.project_type === 'spareparts') {
    return basicValid && quotationItems.value.every(item => 
      item.sparepartId && item.quantity > 0 && item.unit_price > 0
    )
  } else if (formData.value.project_type === 'service') {
    return basicValid && serviceItems.value.every(item => 
      item.service_name && item.quantity > 0 && item.unit_price > 0
    )
  }
  
  return false
})

// Methods for Spareparts
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

function addQuotationItem() {
  quotationItems.value.push(createEmptyItem())
}

function removeQuotationItem(index) {
  quotationItems.value.splice(index, 1)
  if (quotationItems.value.length === 0) {
    addQuotationItem()
  }
}

function updateQuotationItem(index, updatedItem) {
  quotationItems.value[index] = updatedItem
}

// Methods for Services
function createEmptyServiceItem() {
  return {
    service_name: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0
  }
}

function addServiceItem() {
  serviceItems.value.push(createEmptyServiceItem())
}

function removeServiceItem(index) {
  serviceItems.value.splice(index, 1)
  if (serviceItems.value.length === 0) {
    addServiceItem()
  }
}

function updateServiceTotal(index) {
  const service = serviceItems.value[index]
  service.total_price = (service.quantity || 0) * (service.unit_price || 0)
}

function handleProjectTypeChange() {
  // Reset items when project type changes
  if (formData.value.project_type === 'spareparts') {
    quotationItems.value = [createEmptyItem()]
  } else if (formData.value.project_type === 'service') {
    serviceItems.value = [createEmptyServiceItem()]
  }
}

function submitQuotation() {
  showConfirmation.value = true
}

async function confirmSubmit() {
  try {
    submitting.value = true
    showConfirmation.value = false
    
    let payload = {
      branch_id: formData.value.branch,
      project_type: formData.value.project_type,
      customer: formData.value.customer,
      total_amount: totalAmount.value,
      notes: formData.value.notes
    }
    
    if (formData.value.project_type === 'spareparts') {
      payload.items = quotationItems.value.map(item => ({
        sparepartId: item.sparepartId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))
    } else if (formData.value.project_type === 'service') {
      payload.items = serviceItems.value.map(item => ({
        service_name: item.service_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))
    }
    
    const response = await axios.post('/api/quotations', payload)
    
    showToast('Quotation created successfully!', 'success')
    
    // Navigate to quotation list and refresh
    setTimeout(() => {
      const now = new Date()
      const month = now.toLocaleString('en', { month: 'long' }).toLowerCase()
      const year = now.getFullYear()
      router.push(`/quotation?page=1&month=${month}&year=${year}&refresh=true`)
    }, 1500)
    
  } catch (error) {
    console.error('Quotation creation error:', error)
    const errorMessage = error.response?.data?.message || 'Failed to create quotation'
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
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>