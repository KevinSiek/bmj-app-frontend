<template>
  <div v-if="isLoading" class="loader-overlay">
    <div class="loader"></div>
  </div>
  <div v-else class="modal fade show" style="display: block;" id="ModalNotes" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="false">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">

          <div class="text-header">
            Notes for {{ messages }}
          </div>
          <div class="text mt-4">
            <div class="inputform-floating">
              <textarea class="form-control" placeholder="Notes" id="floatingTextarea2"
                style="height: 150px; width: 500px;" v-model="notes"></textarea>
            </div>
          </div>
          <div class="button-modal">
            <button type="button" class="btn btn-cancel mx-2 px-4 py-2" data-bs-dismiss="modal"
              @click="modalStore.closeModal">Cancel</button>
            <button type="button" class="btn btn-process mx-2 px-4 py-2" @click="event" data-bs-dismiss="modal">
              {{ messages }}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" @click.self="closeModal"></div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modal'
import { common } from '@/config'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

const modalStore = useModalStore()

const { messages, notes } = storeToRefs(modalStore)
const isLoading = ref(false)

const event = async () => {
  try {
    isLoading.value = true
    await modalStore.action()
  } catch (error) {
    modalStore.openMessageModal(common.modal.failed, error)
  } finally {
    isLoading.value = false
  }
}
const closeModal = () => {
  modalStore.closeModal()
}
</script>

<style lang="scss" scoped>
$primary-color: black;
$secondary-color: rgb(98, 98, 98);

.modal-dialog {
  z-index: 1050;
}

.modal-body {
  margin-top: 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 30vh;

  svg {
    width: 18vw;
    height: 18vh;
  }

  .text-header {
    justify-content: center;
    font-size: 2vw;
    text-align: center;
    font-weight: 600;
  }

  .button-modal {
    margin-top: 7%;
    padding-bottom: 5%;

    .btn {
      color: white;
    }

    .btn-cancel {
      background-color: $secondary-color;
    }

    .btn-process {
      background-color: $primary-color;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.modal-backdrop {
  z-index: 1000;
}

.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  border: 4px solid #f3f3f3;
  border-top: 4px solid $primary-color;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  z-index: 9999;
}

.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

@keyframes spin {
  0% {
    transform: rotate(0deg) translate(-50%, -50%);
  }

  100% {
    transform: rotate(360deg) translate(-50%, -50%);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media only screen and (max-width: 768px) {

  /* For mobile phones: */
  .modal-body {
    svg {
      width: 16vw;
      height: 16vh;
    }

    .text-header {
      // margin-top: -7%;
      font-size: 3.5vw;
    }

    .text {
      font-size: 2vw;
    }
  }
}

@media only screen and (max-width: 767px) {

  /* For mobile phones: */
  .modal-body {
    margin-top: 2%;
    padding: 15px;

    svg {
      width: 20vw;
      height: 18vh;
    }

    .text-header {
      font-size: 5vw;
    }

    .text {
      font-size: 3.5vw;
      width: 100%;

      .inputform-floating {
        textarea {
          width: 100% !important;
          height: 120px !important;
        }
      }
    }

    .button-modal {
      margin-top: 5%;
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 10px;

      .btn {
        font-size: 3.5vw;
        padding: 8px 15px !important;
      }
    }
  }
}
</style>
