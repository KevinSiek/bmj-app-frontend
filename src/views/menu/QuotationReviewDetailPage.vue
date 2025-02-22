<template>
  <div class="contain background shadow">
    <form class="row form">
      <div class="upper my-2">
        <div class="title">Project</div>
        <div class="data">
          <div class="left">
            <div class="input form-group col-12">
              <label for="">No Quotation</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.project.noQuotation"
                placeholder="No Quotation">
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Project Type</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.project.type" placeholder="Type">
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
                placeholder="Company Name">
            </div>
            <div class="input form-group col-12">
              <label for="">Address</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.customer.address"
                placeholder="Address">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">City</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.city"
                    placeholder="City">
                </div>
                <div class="col-6">
                  <label for="">Province</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.province"
                    placeholder="Province">
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="input form-group col-12">
              <label for="">Office</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.customer.office"
                placeholder="Office">
            </div>
            <div class="input form-group col-12">
              <div class="row">
                <div class="col-6">
                  <label for="">Urban</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.urban"
                    placeholder="Urban">
                </div>
                <div class="col-6">
                  <label for="">Subdistrict</label><br>
                  <input type="text" class="form-control mt-2" v-model="quotationReview.customer.subdistrict"
                    placeholder="Subdistrict">
                </div>
              </div>
            </div>
            <div class="input form-group col-12">
              <label for="">Postal Code</label><br>
              <input type="text" class="form-control mt-2" v-model="quotationReview.customer.postalCode"
                placeholder="Postal Code">
            </div>
          </div>
        </div>
      </div>
      <div class="table my-2">

      </div>
      <div class="notes my-2">
        <div class="title">Notes</div>
        <div class="inputform-floating">
          <textarea class="form-control" placeholder="Notes" id="floatingTextarea2" style="height: 150px"
            v-model="quotationReview.notes"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="button">
    <div class="right">
      <button type="button" class="btn btn-danger">Reject</button>
    </div>
    <div class="right">
      <button type="button" class="btn btn-approve">Approve</button>
    </div>
  </div>
</template>

<script setup>
import { useQuotationStore } from '@/stores/quotation'
import { storeToRefs } from 'pinia'

const quotationStore = useQuotationStore()

const { quotationReview } = storeToRefs(quotationStore)

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
