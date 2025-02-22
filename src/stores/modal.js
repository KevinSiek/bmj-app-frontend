import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', () => {
  const isShowConfirmation = ref(false)
  const isShowMessage = ref(false)
  const type = ref('')
	const messages = ref('')
  const action = ref(null)

  const openMessageModal = (modalType = 'success', message) => {
    isShowConfirmation.value = false
    isShowMessage.value = true
    type.value = modalType
    messages.value = message
  }

  const openConfirmationModal = (message, cb) => {
    isShowMessage.value = false
    isShowConfirmation.value = true
    messages.value = message
    action.value = cb
  }

  const closeModal = () => {
    isShowConfirmation.value = false
    isShowMessage.value = false
  }

  return { isShowConfirmation, isShowMessage, type, messages, action, openConfirmationModal, openMessageModal, closeModal }
})
