<template>
  <div class="modal fade show" style="display: block;" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <div class="logo">
            <svg v-if="modalStore.type === common.modal.success" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
              class="text-success bi bi-check2-circle" viewBox="0 0 16 16">
              <path
                d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z" />
              <path
                d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="text-danger bi bi-x-circle"
              viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path
                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </div>
          <div class="text-header">
            <div v-if="modalStore.type == common.modal.success" class="text text-success mt-1">{{ modalStore.type }}
            </div>
            <div v-else class="text text-danger mt-1">{{ modalStore.type }}</div>
          </div>
          <div class="text">
            {{ modalStore.messages }}
          </div>
          <div class="button-modal">
            <button type="button" class="btn btn-outline-dark mx-2 px-5 py-2"
              @click="modalStore.closeModal()">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" @click.self="closeModal"></div>
  </div>
</template>

<script setup>
import { common } from '@/config'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()

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

  svg {
    width: 14vw;
    height: 14vh;
  }

  .text-header {
    .text {
      font-size: 3vw;
      font-weight: 800;
    }
  }

  .text {
    text-align: center;
    font-size: 1.2vw;
  }

  .button-modal {
    margin-top: 5%;
    padding-bottom: 4%;
    // .btn{
    //   background-color: $primary-color;
    //   color: white;
    // }
  }
}

.modal-backdrop {
  z-index: 1040;
}

@media only screen and (max-width: 768px) {

  /* For mobile phones: */
  .modal-body {
    svg {
      width: 16vw;
      height: 16vh;
    }

    .text-header {
      font-size: 3.5vw;

      .text {
        margin-top: 8%;
        font-size: 8vw;
      }
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
      padding-top: 0%;
      font-size: 3.5vw;
    }
  }
}
</style>
