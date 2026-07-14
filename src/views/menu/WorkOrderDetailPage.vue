<template>
  <div class="contain background shadow">
    <LoaderOverlaySmall v-if="isLoading" />
    <form class="row form">
      <div class="upper my-2" v-if="workOrder.servicePurchaseOrder.id">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.companyName"
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.address" placeholder="Address"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.city" placeholder="City"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.office" placeholder="Office"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.urban" placeholder="Urban"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="workOrder.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="workOrder.customer.postalCode"
                placeholder="Postal Code" disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="left">
          <div class="title">Service Order</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.serviceOrder.serviceOrderNumber"
              placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Branch</label><br>
            <BranchField v-model="workOrder.branch" :disabled="true" :show-director="isRoleDirector"
              :show-readonly="isRoleMarketing" />
          </div>
          <div class="input form-group col-12">
            <div class="row">
              <div class="col-6">
                <label for="">Expected Start Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.serviceOrder.startDate"
                  placeholder="Expected Start Date" disabled>
              </div>
              <div class="col-6">
                <label for="">Expected End Date</label><br>
                <input type="date" class="form-control mt-2" v-model="workOrder.serviceOrder.endDate"
                  placeholder="Expected End Date" disabled>
              </div>
            </div>
          </div>
        </div>
        <div class="right mt-4">
          <div class="input form-group col-12">
            <label for="">Received by</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.serviceOrder.receivedBy"
              placeholder="Received by" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Compiled By</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.poc.compiled" placeholder="Compiled by"
              disabled>
          </div>
          <div class="input form-group col-12 mt-3">
            <label for="">Authorized by</label><br>
            <div class="row px-3">
              <div class="col-6">
                <label for="">Dept Head Service</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.poc.headOfService"
                  placeholder="Dept Head Service" disabled>
              </div>
              <div class="col-6">
                <label for="">Director</label><br>
                <input type="text" class="form-control mt-2" v-model="workOrder.poc.director" placeholder="Director"
                  disabled>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="left" v-if="workOrder.servicePurchaseOrder.id">
          <div class="title">Purchase Order</div>
          <div class="input form-group col-12">
            <label for="">No Internal Request</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.servicePurchaseOrder.purchaseOrderNumber"
              placeholder="No Internal Request" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">No PO</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.servicePurchaseOrder.poNumber"
              placeholder="No PO" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="workOrder.servicePurchaseOrder.purchaseOrderDate"
              placeholder="Date" disabled>
          </div>
        </div>
        <div class="right">
          <div class="title">Additional Comments</div>
          <div class="input form-group col-12">
            <label for="">List backup sparepart</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.backupSparepart"
              placeholder="List backup sparepart" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Scope of Work</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.scope"
              placeholder="Scope of Work" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Execution Time</label><br>
            <input type="text" class="form-control mt-2" v-model="workOrder.additional.executionTime"
              placeholder="Execution Time" disabled>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="left my-2">
          <div class="title">
            Select PO Service
          </div>
          <div class="data">
            <PoSelect type="Service" placeholder="Search PO Service number"
              :model-value="workOrder?.servicePurchaseOrder?.poNumber || workOrder?.servicePurchaseOrder?.purchaseOrderNumber"
              :disabled="true" @select="selectServicePurchaseOrder" />
          </div>
        </div>
        <div class="right my-2">
          <div class="title">
            Select PO Sparepart<small class="text-muted">(optional)</small>
          </div>
          <div class="data">
            <PoSelect type="Spareparts" placeholder="Search PO Sparepart number"
              :model-value="workOrder?.sparepartPurchaseOrder?.poNumber || workOrder?.sparepartPurchaseOrder?.purchaseOrderNumber"
              :disabled="true" @select="selectSparepartPurchaseOrder" />
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
      <div class="description">
        <div class="title">Work Description</div>
        <div class="input form-group col-12">
          <div class="row">
            <div class="col-12">
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
          </div>
        </div>
        <div class="input form-group col-12">
          <div v-for="(unit, unitIndex) in workOrder.units" :key="unitIndex" class="list row">
            <div class="col-12">
              <div class="row">
                <div class="col-4">
                  <input type="text" class="form-control mt-2" placeholder="Job Desc" v-model="unit.jobDescriptions"
                    disabled>
                </div>
                <div class="col-5">
                  <input type="text" class="form-control mt-2" placeholder="Unit Type" v-model="unit.unitType" disabled>
                </div>
                <div class="col-3">
                  <input type="number" class="form-control mt-2" placeholder="Quantity" v-model="unit.quantity"
                    disabled>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="title mt-3">Jobs</div>
        <div class="input form-group col-12">
          <div v-for="(job, jobIndex) in workOrder.jobs" :key="jobIndex" class="list row">
            <div class="col-12 d-flex align-items-center mt-2">
              <label for="">{{ jobIndex + 1 }}</label>
              <input type="text" class="form-control mx-3" placeholder="Job" :value="job" disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="workOrder.notes" disabled></textarea>
        </div>
      </div>
      <div v-if="isShowReport" class="report my-2">
        <div class="title">Report</div>
        <div class="input form-group col-12">
          <label for="">Date Completed</label><br>
          <div class="row px-3">
            <div class="col-6">
              <label for="">Start Date</label><br>
              <input type="date" class="form-control mt-2" v-model="workOrder.date.startDate" placeholder="Start Date"
                :disabled="workOrder.currentStatus === common.status.work_order.done">
            </div>
            <div class="col-6">
              <label for="">End Date</label><br>
              <input type="date" class="form-control mt-2" v-model="workOrder.date.endDate" placeholder="End Date"
                :disabled="workOrder.currentStatus === common.status.work_order.done">
            </div>
          </div>
        </div>
        <div class="input form-group col-12">
          <label for="">Work Performed by</label><br>
          <input type="text" class="form-control mt-2" v-model="workOrder.poc.worker" placeholder="Work Performed by"
            :disabled="workOrder.currentStatus === common.status.work_order.done">
        </div>
        <div class="title">Description of Work Completed</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="workOrder.descriptionCompleted" :disabled="workOrder.currentStatus === common.status.work_order.done"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-edit" @click="back">Back</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-process" @click="download">Print</button>
      <button v-if="isShowEdit" type="button" class="btn btn-process" @click="goToEdit"
        :disabled="isProcessing">Edit</button>
      <button v-if="isShowProcess" type="button" class="btn btn-process" @click="setProcessConfirmation"
        :disabled="isProcessing">Process</button>
      <button v-if="isShowDone" type="button" class="btn btn-process" @click="setDoneConfirmation"
        :disabled="isProcessing">Done</button>
    </div>
  </div>
</template>

<script setup>
import { useRole } from '@/composeable/useRole'
import { common, menuMapping as menuConfig } from '@/config'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'
import { useWorkOrderStore } from '@/stores/work-order'
import LoaderOverlaySmall from '@/components/LoaderOverlaySmall.vue'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createPdf } from '@/utils/pdf/work-order'
import BranchField from '@/components/BranchField.vue'
import PoSelect from '@/components/borrow/PoSelect.vue'

const route = useRoute()
const router = useRouter()
const workOrderStore = useWorkOrderStore()
const trackStore = useTrackStore()
const modalStore = useModalStore()

const { workOrder } = storeToRefs(workOrderStore)
const { isRoleDirector, isRoleService, isRoleMarketing } = useRole()

const isProcessing = ref(false)
const isLoading = ref(true)

const isService = computed(() => isRoleService.value || isRoleDirector.value)
const isMarketing = computed(() => isRoleMarketing.value || isRoleDirector.value)

const isShowEdit = computed(() =>
  !isLoading.value &&
  isMarketing.value && workOrder.value.currentStatus === common.status.work_order.wait_on_progress
)
// Process button: WO is in "Wait On Progress" -> advance to "On Progress".
const isShowProcess = computed(() =>
  !isLoading.value &&
  isService.value && workOrder.value.currentStatus === common.status.work_order.wait_on_progress
)
// Done button: WO is in "On Progress" -> finish it.
const isShowDone = computed(() =>
  !isLoading.value &&
  isService.value && workOrder.value.currentStatus === common.status.work_order.on_progress
)
const isShowReport = computed(() =>
  workOrder.value.currentStatus === common.status.work_order.on_progress ||
  workOrder.value.currentStatus === common.status.work_order.done
)


onBeforeMount(() => {
  if (!workOrder.value) workOrderStore.$resetWorkOrder()
})
onMounted(async () => {
  await fetchData()
  isLoading.value = false
})

const fetchData = async () => {
  await workOrderStore.getWorkOrder(route.params.id)
  await trackStore.setTrackData(workOrder.value.status, 'WorkOrder')
}

const runAction = async (action) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await action(route.params.id)
    await fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}

const setProcessConfirmation = () => {
  modalStore.openConfirmationModal('to start processing this Work Order ?', 'Work Order In Progress',
    () => runAction(workOrderStore.process))
}
const setDoneConfirmation = () => {
  modalStore.openConfirmationModal('to mark this Work Order as Done ?', 'Work Order Done',
    () => runAction(workOrderStore.done))
}
const goToEdit = () => {
  router.push(`${menuConfig.work_order_edit.path.replace(':id', route.params.id)}`)
}
const download = () => {
  createPdf(workOrder.value)
}
const back = () => {
  router.push(menuConfig.work_order.path)
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
    .data {
      display: flex;
      justify-content: space-between;
    }

    .left,
    .right {
      width: 48%;
    }
  }

  .lower {
    display: flex;
    justify-content: space-between;

    .left,
    .right {
      width: 48%;
    }
  }

  .description {
    .input {
      margin: 0% 0%;
    }
  }
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: space-between;

  .left,
  .right {
    display: flex;
    gap: 20px;
  }

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

@media only screen and (max-width: 767px) {
  .contain {
    padding: 4% 5%;
    height: 72vh;

    .upper,
    .lower {
      flex-direction: column;

      .left,
      .right {
        width: 100%;
      }

      .data {
        flex-direction: column;
      }
    }

    .table-placeholder {
      .table {
        min-width: 800px;
        font-size: 14px;
      }
    }
  }

  .button {
    margin: 4% 6%;
    flex-direction: column;
    gap: 15px;

    .btn {
      padding: 1.2vh 4vw;
      font-size: 3vw;
      width: 100%;
      margin: 0;
    }

    .left,
    .right {
      display: flex;
      flex-direction: row;
      gap: 10px;
      width: 100%;

      .btn {
        width: 100%;
      }
    }
  }
}
</style>
