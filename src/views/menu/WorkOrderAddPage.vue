<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          <div class="title">Service Order</div>
          <div class="input form-group col-12">
            <label for="">Branch</label><br>
            <BranchField v-model="workOrder.branch" :show-director="isRoleDirector" :show-readonly="isRoleMarketing" />
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Expected Start Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.serviceOrder.expectedStartDate"
                  placeholder="Expected Start Date">
              </div>
              <div class="col-6">
                <label for="">Expected End Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.serviceOrder.expectedEndDate"
                  placeholder="Expected End Date">
              </div>
            </div>
          </div>
        </div>
        <div class="right mt-4">
          <div class="input form-group col-12">
            <label for="">Received by</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.serviceOrder.receivedBy"
              placeholder="Received by">
          </div>
          <div class="input form-group col-12 mt-3">
            <label for="">Authorized by</label><br>
            <div class="row px-3">
              <div class="col-6">
                <label for="">Dept Head Service</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.poc.headOfService"
                  placeholder="Dept Head Service">
              </div>
              <div class="col-6">
                <label for="">Director</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.poc.director" placeholder="Director">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Work Description</div>
        <div class="input form-group col-12">
          <div class="row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <label for="">Job Desc</label>
                </div>
                <div class="col-5">
                  <label for="">Unit Type</label>
                </div>
                <div class="col-3">
                  <label for="">Quantity</label>
                </div>
              </div>
            </div>
            <div class="col-1">
              <div class="button-placeholder"></div>
            </div>
          </div>
        </div>
        <div class="input form-group col-12">
          <div v-for="(unit, unitIndex) in workOrder.units" :key="unitIndex" class="list row">
            <div class="col-11">
              <div class="row">
                <div class="col-4">
                  <input type="text" class="form-control mt-2" placeholder="Job Desc" v-model="unit.jobDescriptions">
                </div>
                <div class="col-5">
                  <input type="text" class="form-control mt-2" placeholder="Unit Type" v-model="unit.unitType">
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="unit.quantity"
                    @wheel.prevent min="0" @keydown="(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()">
                </div>
              </div>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeUnit(unitIndex)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="add-btn mt-3">
            <button type="button" class="btn btn-outline-dark" @click="addUnit">
              <i class="bi bi-plus-lg"></i>
              <span class="mx-2">Add Work</span>
            </button>
          </div>
        </div>
        <div class="title mt-3">Jobs</div>
        <div class="input form-group col-12">
          <div v-for="(job, jobIndex) in workOrder.jobs" :key="jobIndex" class="list row">
            <div class="col-11">
              <input type="text" class="form-control mt-2" placeholder="Job" v-model="workOrder.jobs[jobIndex]">
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-outline-danger" @click="removeJob(jobIndex)"><i
                  class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="add-btn mt-3">
            <button type="button" class="btn btn-outline-dark" @click="addJob">
              <i class="bi bi-plus-lg"></i>
              <span class="mx-2">Add Job</span>
            </button>
          </div>
        </div>
        <div class="upper my-2">
          <div class="left my-2">
            <div class="title">
              Select PO Service
            </div>
            <div class="data">
              <PoSelect type="Service" placeholder="Search PO Service number"
                :model-value="workOrder?.servicePurchaseOrder?.poNumber || workOrder?.servicePurchaseOrder?.purchaseOrderNumber"
                @select="selectServicePurchaseOrder" />
            </div>
          </div>
          <div class="right my-2">
            <div class="title">
              Select PO Sparepart<small class="text-muted">(optional)</small>
            </div>
            <div class="data">
              <PoSelect type="Spareparts" placeholder="Search PO Sparepart number"
                :model-value="workOrder?.sparepartPurchaseOrder?.poNumber || workOrder?.sparepartPurchaseOrder?.purchaseOrderNumber"
                @select="selectSparepartPurchaseOrder" @clear="clearSparepartPurchaseOrder" />
            </div>
          </div>
        </div>

        <div v-if="workOrder?.sparepartPurchaseOrder?.spareparts?.length" class="my-3">
          <div class="title">
            List Sparepart from PO Sparepart {{ workOrder?.sparepartPurchaseOrder?.poNumber ||
              workOrder?.sparepartPurchaseOrder?.purchaseOrderNumber }}
          </div>
          <div class="table-placeholder">
            <table class="table table-hover mb-0">
              <thead>
                <tr class="align-middle">
                  <th class="table-number">NO</th>
                  <th>PART NAME</th>
                  <th>PART NUMBER</th>
                  <th class="text-center">QTY</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr v-for="(sp, i) in workOrder.sparepartPurchaseOrder.spareparts" :key="i" class="align-middle">
                  <td class="table-number">{{ i + 1 }}</td>
                  <td>{{ sp.sparepartName }}</td>
                  <td>{{ sp.sparepartNumber }}</td>
                  <td class="text-center">{{ sp.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="title">Additional Comments</div>
        <div class="data">
          <div class="input form-group col-12">
            <label for="">List backup sparepart</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.backupSparepart"
              placeholder="List backup sparepart">
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Scope of Work</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.additional.scope"
                  placeholder="Scope of Work">
              </div>
            </div>
          </div>
          <div class="input form-group col-12">
            <label for="">Execution Time</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.executionTime"
              placeholder="Execution Time">
          </div>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="workOrder.notes"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="doReleaseConfirmation" :disabled="isProcessing">Add
        WO</button>
    </div>
  </div>
</template>

<script setup>
import PoSelect from '@/components/borrow/PoSelect.vue'
import BranchField from '@/components/BranchField.vue'
import { useModalStore } from '@/stores/modal'
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { useWorkOrderStore } from '@/stores/work-order'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { common, menuMapping as menuConfig } from '@/config'
import { useRole } from '@/composeable/useRole'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const workOrderStore = useWorkOrderStore()
const purchaseOrderStore = usePurchaseOrderStore()
const modalStore = useModalStore()
const authStore = useAuthStore()

const { workOrder } = storeToRefs(workOrderStore)
const { purchaseOrder } = storeToRefs(purchaseOrderStore)
const { user } = storeToRefs(authStore)
const isProcessing = ref(false)

const { isRoleDirector, isRoleMarketing } = useRole()

onBeforeMount(async () => {
  if (!workOrder.value) await workOrderStore.$resetWorkOrder()
  if (workOrder.value.units.length === 0) addUnit()
  if (workOrder.value.jobs.length === 0) addJob()
})

watch([user, workOrder], ([userVal, workOrderVal]) => {
  if (isRoleMarketing.value && workOrder.value && !workOrderVal?.branch && userVal && userVal?.branch.name) {
    workOrder.value.branch = userVal.branch.name
  }
  if (workOrder.value && userVal?.fullname) {
    workOrder.value.poc.compiled = userVal.fullname
  }
}, { immediate: true })

const addUnit = () => {
  workOrder.value.units.push({
    jobDescriptions: '',
    unitType: '',
    quantity: 0
  })
}
const removeUnit = (index) => {
  workOrder.value.units.splice(index, 1)
}
const addJob = () => {
  workOrder.value.jobs.push('')
}
const removeJob = (index) => {
  workOrder.value.jobs.splice(index, 1)
}
const selectServicePurchaseOrder = (po) => {
  workOrder.value.servicePurchaseOrder = {
    id: po.id,
    poNumber: po.poNumber,
    purchaseOrderNumber: po.purchaseOrderNumber
  }
}
const selectSparepartPurchaseOrder = (po) => {
  workOrder.value.sparepartPurchaseOrder = {
    id: po.id,
    poNumber: po.poNumber,
    purchaseOrderNumber: po.purchaseOrderNumber,
    spareparts: po.spareparts || []
  }
}
const clearSparepartPurchaseOrder = () => {
  workOrder.value.sparepartPurchaseOrder = null
}

const doRelease = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await workOrderStore.addWorkOrder()
    router.push(menuConfig.work_order.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const doReleaseConfirmation = () => {
  modalStore.openConfirmationModal('to add this Work Order?', 'Add Work Order Success', doRelease)
}

const back = () => {
  const authStore = useAuthStore()
  if (authStore.user?.role?.toLowerCase() === 'marketing') {
    router.push(`${menuConfig.purchase_order.path}/${route.params.id}`)
  } else {
    router.push(menuConfig.work_order.path)
  }
}

</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 72vh;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 1%;
  }

  .input {
    margin: 2% 0%;

    .list {
      display: flex;
      align-items: flex-end;
    }

    .add-btn {
      display: flex;
      justify-content: center;
    }
  }

  .upper {
    display: flex;
    justify-content: space-between;

    .left,
    .right {
      width: 48%;
    }
  }

  .lower {
    .input {
      margin: 0.5% 0%;
    }

    .data {
      display: flex;
      flex-direction: column;
    }

    .left,
    .right {
      width: 48%;
    }

    .table-placeholder {
      border: 2px solid $primary-color;
      border-radius: 12px;
      overflow: auto;
      font-size: 0.85rem;
    }
  }
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: space-between;

  .btn {
    padding: 1.5vh 3vw 1.5vh 3vw;
    font-weight: 500;
    color: white;
    font-size: 1.1vw;
    letter-spacing: 0.03vw;
  }

  .btn-edit {
    background-color: $secondary-color;
  }

  .btn-process {
    background-color: $primary-color;
  }
}
</style>
