<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Project</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">No Quotation</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.project.quotationNumber"
                placeholder="No Quotation" disabled>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Project Type</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.project.type" placeholder="Type"
                disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="lower my-2">
        <div class="title">Customer</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">Company Name</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.customer.companyName"
                placeholder="Company Name" disabled>
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.customer.address"
                placeholder="Address" disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.city"
                    placeholder="City" disabled>
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.province"
                    placeholder="Province" disabled>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.customer.office"
                placeholder="Office" disabled>
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.urban"
                    placeholder="Urban" disabled>
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.subdistrict"
                    placeholder="Subdistrict" disabled>
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.customer.postalCode"
                placeholder="Postal Code" disabled>
            </div>
          </div>
        </div>
      </div>
      <div class="sparepart my-2">
        <div class="title">Sparepart</div>
        <div class="table-placeholder">
          <table class="table table-hover">
            <thead>
              <tr class="align-middle">
                <th scope="col-1" class="table-number">NO</th>
                <th scope="col" class="table-name">PART NAME</th>
                <th scope="col" class="table-part-number">PART NUMBER</th>
                <th scope="col" class="table-name">QUANTITY</th>
                <th scope="col" class="table-name">UNIT</th>
                <th scope="col" class="table-name">UNIT PRICE</th>
                <th scope="col" class="table-name">TOTAL PRICE</th>
                <th scope="col" class="table-name">STOCK</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-for="(sparepart, index) in quotationReview.spareparts" :key="index" class="align-middle">
                <td scope="row" class="table-col table-number">{{ index + 1 }}</td>
                <td class="table-col table-part-number">{{ sparepart.sparepartName }}</td>
                <td class="table-col table-name">{{ sparepart.sparepartNumber }}</td>
                <td class="table-col table-name">{{ sparepart.quantity }}</td>
                <td class="table-col table-name">{{ sparepart.unit }}</td>
                <td class="table-col table-name">{{ sparepart.unitPriceSell }}</td>
                <td class="table-col table-name">{{ sparepart.totalPrice }}</td>
                <td class="table-col table-name">{{ sparepart.stock }}</td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-part-number">SubTotal</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ quotationReview.price.subtotal }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">PPN 12%</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ quotationReview.price.ppn }}</td>
                <td class="table-col table-name"></td>
              </tr>
              <tr class="align-middle">
                <td scope="row" class="table-col table-number"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">Grand Total</td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name"></td>
                <td class="table-col table-name">{{ quotationReview.price.grandTotal }}</td>
                <td class="table-col table-name"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="quotationReview.notes" disabled></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-danger" @click="rejectQuotationConfirmation"
        :disabled="isProcessing">Reject</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-approve" @click="needChangeQuotationConfirmation"
        :disabled="isProcessing">Need Change</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-success" @click="approveQuotationConfirmation"
        :disabled="isProcessing">Approve</button>
    </div>
  </div>
</template>

<script setup>
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useRoute, useRouter } from 'vue-router'
import { useModalStore } from '@/stores/modal'

const quotationStore = useQuotationStore()
const trackStore = useTrackStore()
const modalStore = useModalStore()

const route = useRoute()
const router = useRouter()
const { quotationReview } = storeToRefs(quotationStore)

const isProcessing = ref(false)

onBeforeMount(() => {
  if (!quotationReview.value) quotationStore.$resetQuotationReview()
})
onMounted(() => {
  quotationStore.getQuotationReview(route.params.id)
  trackStore.setTrackData(quotationReview.value.status)
})

const approveQuotation = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await quotationStore.approveQuotation(route.params.id)
    // router.push(menuConfig.quotation.path)
  } catch (error) {
    console.log('ERROR PAGE', error)
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const approveQuotationConfirmation = () => {
  modalStore.openConfirmationModal('to Approve this Quotation ?', `Quotation ${route.params.id} Approved`, approveQuotation)
}
const needChangeQuotation = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await quotationStore.needChangeQuotation(route.params.id)
    // router.push(menuConfig.quotation.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const needChangeQuotationConfirmation = () => {
  modalStore.openConfirmationModal('to review this Quotation ?', `Quotation ${route.params.id} Reviewed`, needChangeQuotation)
}
const rejectQuotation = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    await quotationStore.rejectQuotation(route.params.id)
    // router.push(menuConfig.quotation.path)
  } catch (error) {
    throw error.data.error || error.data.message
  } finally {
    isProcessing.value = false
  }
}
const rejectQuotationConfirmation = () => {
  modalStore.openConfirmationModal('to Reject this Quotation ?', `Quotation ${route.params.id} Rejected`, rejectQuotation)
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
  }

  .upper,
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
  }
}

.button {
  display: flex;
  margin: 2% 4%;
  justify-content: flex-end;

  .btn {
    padding: 1.5vh 3vw 1.5vh 3vw;
    margin: 0vw 1vw;
    font-weight: 500;
    color: white;
    font-size: 1.1vw;
    letter-spacing: 0.03vw;
  }

  .btn-approve {
    background-color: $primary-color;
  }
}
</style>
