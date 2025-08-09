<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="left">
          <div class="title">Purchase Order</div>
          <div class="input form-group col-12">
            <label for="">No</label><br>
            <input type="text" class="form-control mt-2" v-model="purchaseOrder.purchaseOrder.purchaseOrderNumber"
              placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="purchaseOrder.purchaseOrder.purchaseOrderDate"
              placeholder="Date" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Project Type</label><br>
            <input type="text" class="form-control mt-2" v-model="purchaseOrder.purchaseOrder.type"
              placeholder="Project Type" disabled>
          </div>
        </div>
        <div class="right">
          <div class="title">Proforma Invoice</div>
          <div class="input form-group col-12">
            <label for="name">No</label><br>
            <input type="text" class="form-control mt-2" v-model="purchaseOrder.proformaInvoice.proformaInvoiceNumber"
              placeholder="No" disabled>
          </div>
          <div class="input form-group col-12">
            <label for="">Date</label><br>
            <input type="date" class="form-control mt-2" v-model="purchaseOrder.proformaInvoice.proformaInvoiceDate"
              placeholder="Date" disabled>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.companyName"
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.address"
                placeholder="Address" disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.city" placeholder="City"
                    disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.office" placeholder="Office"
                disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.urban"
                    placeholder="Urban" disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="purchaseOrder.customer.postalCode"
                placeholder="Postal Code" disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="my-2">
        <div class="title">{{ purchaseOrder.purchaseOrder.type }}</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle" v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'">
                <th scope="col-1" class="table-number">NO</th>
                <th scope="col" class="table-name">DESCRIPTION</th>
                <th scope="col" class="table-name">PART NUMBER</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">AMOUNT</th>
                <th scope="col" class="table-name">STATUS</th>
              </tr>
              <tr class="align-middle" v-else>
                <th scope="col-1" class="table-number">NO</th>
                <th scope="col" class="table-name">SERVICE</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody class="table-group-divider" v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'">
              <tr v-for="(sparepart, index) in purchaseOrder.spareparts" :key="sparepart.id"
                class="align-middle borderless">
                <td scope="row" class="table-col table-number">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.sparepartName }}
                  </div>
                </td>
                <td class="table-col table-part-number">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.sparepartNumber }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.quantity }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.unit || 'pcs' }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.unitPriceSell }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.totalPrice }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.spareparts.length - 1 }">
                    {{ sparepart.stock }}
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody class="table-group-divider" v-else>
              <tr v-for="(service, index) in purchaseOrder.services" :key="index" class="align-middle borderless">
                <td scope="row" class="table-col table-number">
                  <div :class="{ space: index === purchaseOrder.services.length - 1 }">
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.services.length - 1 }">
                    {{ service.service }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.services.length - 1 }">
                    {{ service.quantity }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.services.length - 1 }">
                    {{ service.unitPriceSell }}
                  </div>
                </td>
                <td class="table-col table-name">
                  <div :class="{ space: index === purchaseOrder.services.length - 1 }">
                    {{ service.totalPrice }}
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr class="align-middle">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'"></td>
              </tr>
            </tbody>
            <tbody>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">1</td>
                <td class="table-col table-part-number">Amount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name">{{
                  purchaseOrder.price.amount }}</td>
                <td v-else class="table-col table-name">{{ purchaseOrder.price.amount }}</td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">2</td>
                <td class="table-col table-name">Less: Discount</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name">{{
                  purchaseOrder.price.discount }}</td>
                <td v-else class="table-col table-name">{{ purchaseOrder.price.discount }}</td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">3</td>
                <td class="table-col table-name">Sub Total (1-2)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name">{{
                  purchaseOrder.price.subtotal }}</td>
                <td v-else class="table-col table-name">{{ purchaseOrder.price.subtotal }}</td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">4</td>
                <td class="table-col table-name">Less: Advance Payment</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name">{{
                  purchaseOrder.price.advancePayment }}</td>
                <td v-else class="table-col table-name">{{ purchaseOrder.price.advancePayment }}</td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">5</td>
                <td class="table-col table-name">Total (3-4)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name">{{
                  purchaseOrder.price.total }}</td>
                <td v-else class="table-col table-name">{{ purchaseOrder.price.total }}</td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">6</td>
                <td class="table-col table-name">VAT</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name">{{
                  purchaseOrder.price.vat }}</td>
                <td v-else class="table-col table-name">{{ purchaseOrder.price.vat }}</td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number">7</td>
                <td class="table-col table-name">TOTAL AMOUNT(5+6)</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name">{{
                  purchaseOrder.price.totalAmount }}</td>
                <td v-else class="table-col table-name">{{ purchaseOrder.price.totalAmount }}</td>
                <td class="table-col table-name"></td>
                <td v-if="purchaseOrder.purchaseOrder.type === 'Spareparts'" class="table-col table-name"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="purchaseOrder.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="down-payment background background-dp">
    <div class="title">
      Advance Payment:
    </div>
    <div class="value">
      {{ purchaseOrder.downPayment }} %
    </div>
  </div>
  <div class="button">
    <div class="left">
      <button type="button" class="btn btn-process mx-3" @click="download">Print</button>
    </div>
    <div class="right">
      <button v-if="isShowFullPaid" type="button" class="btn btn-process mx-3" @click="setFullPaidConfirmation"
        :disabled="isProcessing">Full
        Paid</button>
      <button v-if="isShowReady" type="button" class="btn btn-process mx-3" @click="setToReadyConfirmation"
        :disabled="isProcessing">Sparepart
        Ready</button>
      <button v-if="isShowCreatePi" type="button" class="btn btn-process mx-3" @click="createPiConfirmation"
        :disabled="isProcessing">Create
        PI</button>
      <button v-if="isShowRelease" type="button" class="btn btn-process mx-3" @click="doRelease"
        :disabled="isProcessing">Release</button>
      <button v-if="isShowDone" type="button" class="btn btn-process mx-3" @click="setToDoneConfirmation"
        :disabled="isProcessing">Done</button>
      <button v-if="isShowReturn" type="button" class="btn btn-process mx-3" @click="doReturn"
        :disabled="isProcessing">Return</button>
    </div>
  </div>
</template>

<script setup>
import { usePurchaseOrderStore } from '@/stores/purchase-order'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { common, menuMapping as menuConfig } from '@/config'
import { useRole } from '@/composeable/useRole'
import { useModalStore } from '@/stores/modal'
import { useTrackStore } from '@/stores/track'
import { createPdf } from '@/utils/pdf/purchase-order'

const router = useRouter()
const route = useRoute()
const { isRoleDirector, isRoleMarketing, isRoleInventory, isRoleFinance, isRoleService } = useRole()
const purchaseOrderStore = usePurchaseOrderStore()
const modalStore = useModalStore()
const trackStore = useTrackStore()

const { purchaseOrder } = storeToRefs(purchaseOrderStore)

const isProcessing = ref(false)

const isShowFullPaid = computed(() =>
  (isRoleFinance.value || isRoleDirector.value) &&
  purchaseOrder.value.proformaInvoice.isDpPaid &&
  !purchaseOrder.value.proformaInvoice.isFullPaid
)
const isShowReady = computed(() => (isRoleInventory.value || isRoleDirector.value) &&
  !purchaseOrder.value.status.some(item => item.state === common.track.ready)
)
const isShowCreatePi = computed(() =>
  (isRoleFinance.value || isRoleDirector.value) &&
  !purchaseOrder.value.status.some(item => item.state === common.track.pi)
)
const isShowRelease = computed(() =>
  (isRoleService.value || isRoleInventory.value || isRoleDirector.value) &&
  purchaseOrder.value.status.some(item => item.state === common.track.ready) &&
  purchaseOrder.value.status.some(item => item.state === common.track.dp_paid) &&
  !purchaseOrder.value.status.some(item => item.state === common.track.release)
)
const isShowDone = computed(() =>
  (isRoleMarketing.value || isRoleDirector.value) &&
  purchaseOrder.value.status.some(item => item.state === common.track.release) &&
  !purchaseOrder.value.status.some(item => item.state === common.track.done)
)
const isShowReturn = computed(() =>
  (isRoleMarketing.value || isRoleDirector.value) &&
  purchaseOrder.value.status.some(item => item.state === common.track.done) &&
  !purchaseOrder.value.status.some(item => item.state === common.track.return)
)

const fetchData = async () => {
  await purchaseOrderStore.getPurchaseOrder(route.params.id)
  await trackStore.setTrackData(purchaseOrder.value.status)
}
onBeforeMount(() => {
  if (!purchaseOrder.value) purchaseOrderStore.$resetPurchaseOrder()
})
onMounted(async () => {
  await fetchData()
})

const fullPaid = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseOrderStore.fullPaid(route.params.id)
    fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const setFullPaidConfirmation = () => {
  modalStore.openConfirmationModal('Purchase Order has been Paid ?', 'Purchase Order has been paid', fullPaid)
}
const setToReady = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseOrderStore.ready(route.params.id)
    fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const setToReadyConfirmation = () => {
  modalStore.openConfirmationModal('Sparepart is Ready ?', 'Spareparts are Ready', setToReady)
}

const createProformaInvoice = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseOrderStore.processToProformaInvoice(route.params.id)
    await router.push(`${menuConfig.proforma_invoice.path}`)
  } catch (error) {
    throw error.data.error
  } finally {
    isProcessing.value = false
  }
}
const createPiConfirmation = () => {
  modalStore.openConfirmationModal('to create Proforma Invoice ?', 'PI Created', createProformaInvoice)
}

const doRelease = async () => {
  if (purchaseOrder.value.purchaseOrder.type === common.type.sparepart) {
    await router.push(`${menuConfig.delivery_order.path}/add/${route.params.id}`)
    return
  }
  await router.push(`${menuConfig.work_order.path}/add/${route.params.id}`)
}

const doReturn = async () => {
  if (purchaseOrder.value.purchaseOrder.type === common.type.service) {
    modalStore.openMessageModal(common.modal.failed, "Service quotations cannot be returned")
    return
  }
  await router.push(`${menuConfig.purchase_order.path}/return/${route.params.id}`)
}

const setToDone = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await purchaseOrderStore.done(route.params.id)
    fetchData()
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const setToDoneConfirmation = () => {
  modalStore.openConfirmationModal('Purchase Order has been Done ?', 'Purchase Order Done', setToDone)
}

const download = () => {
  createPdf(purchaseOrder.value)
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.contain {
  padding: 2.5% 5%;
  height: 62vh;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 1%;
  }

  .input {
    margin: 2% 0%;
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
    .data {
      display: flex;
      justify-content: space-between;
    }

    .left,
    .right {
      width: 48%;
    }
  }

  .table-placeholder {
    text-align: center;
    border: 2px solid $primary-color;
    border-radius: 20px;
    overflow: auto;

    .space {
      min-height: 100px;
    }

    .borderless th,
    .borderless td {
      border: none !important;
    }
  }
}

.down-payment {
  font-size: 20px;
  height: 8vh;
  padding: 0 4%;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
