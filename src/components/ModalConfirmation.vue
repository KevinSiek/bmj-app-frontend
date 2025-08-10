<template>
  <div v-if="isLoading" class="loader-overlay">
    <div class="loader"></div>
  </div>
  <div v-else class="modal fade show" style="display: block;" :id="idModal" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-question-lg" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777ZM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14" />
          </svg>
          <div class="text-header">
            Are you sure
          </div>
          <div class="text mt-1">
            {{ modalStore.confirmationMessages }}
          </div>
          <div class="button-modal">
            <button type="button" class="btn btn-danger mx-2 px-4 py-2" data-bs-dismiss="modal"
              @click="modalStore.closeModal">No</button>
            <button type="button" class="btn btn-success mx-2 px-4 py-2" @click="event"
              data-bs-dismiss="modal">Yes</button>
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

const modalStore = useModalStore()

const isLoading = ref(false)

const event = async () => {
  try {
    isLoading.value = true
    await modalStore.action()
    modalStore.openMessageModal(common.modal.success, modalStore.messages)
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
    svg {
      width: 24vw;
      height: 20vh;
    }

    .text-header {
      margin-top: -7%;
      font-size: 6.5vw;
    }

    .text {
      font-size: 3.5vw;
    }
  }
}
</style>
