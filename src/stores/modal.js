import { ref } from 'vue'
import { defineStore } from 'pinia'
import { common } from '@/config'

export const useModalStore = defineStore('modal', () => {
  const isShowConfirmation = ref(false)
  const isShowMessage = ref(false)
  const type = ref('')
	const messages = ref('')
  const confirmationMessages = ref('')
  const action = ref(null)

  const openMessageModal = (modalType = common.modal.success, message) => {
    isShowConfirmation.value = false
    isShowMessage.value = true
    type.value = modalType
    messages.value = message
  }

  const openConfirmationModal = (confirmationMessage, message = common.modal.success, cb) => {
    isShowMessage.value = false
    isShowConfirmation.value = true
    messages.value = message
    confirmationMessages.value = confirmationMessage
    action.value = cb
  }

  const closeModal = () => {
    isShowConfirmation.value = false
    isShowMessage.value = false
  }

  return {
    isShowConfirmation,
    isShowMessage,
    type,
    confirmationMessages,
    messages,
    action,
    openConfirmationModal,
    openMessageModal,
    closeModal
  }
})
