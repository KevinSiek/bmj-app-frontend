import { ref } from 'vue'
import { defineStore } from 'pinia'
import { common } from '@/config'

export const useModalStore = defineStore('modal', () => {
  const isShowConfirmation = ref(false)
  const isShowMessage = ref(false)
  const isShowNotes = ref(false)
  const type = ref('')
	const messages = ref('')
  const notes = ref('')
  // PO number field, only shown in the notes modal when requirePoNumber is true (moveToPo).
  const poNumber = ref('')
  const requirePoNumber = ref(false)
  const confirmationMessages = ref('')
  const action = ref(null)

  const openMessageModal = (modalType = common.modal.success, message) => {
    isShowConfirmation.value = false
    isShowMessage.value = true
    isShowNotes.value = false
    type.value = modalType
    messages.value = message
  }

  const openConfirmationModal = (confirmationMessage, message = common.modal.success, cb) => {
    isShowMessage.value = false
    isShowConfirmation.value = true
    isShowNotes.value = false
    messages.value = message
    confirmationMessages.value = confirmationMessage
    action.value = cb
  }

  const openNotesModal = (messageButton, cb, { requirePo = false } = {}) => {
    isShowMessage.value = false
    isShowConfirmation.value = false
    isShowNotes.value = true
    messages.value = messageButton
    notes.value = ''
    poNumber.value = ''
    requirePoNumber.value = requirePo
    action.value = cb
  }

  const closeModal = () => {
    isShowConfirmation.value = false
    isShowMessage.value = false
    isShowNotes.value = false
    action.value = null
    messages.value = ''
    confirmationMessages.value = ''
    type.value = ''
    poNumber.value = ''
    requirePoNumber.value = false
  }

  return {
    isShowConfirmation,
    isShowMessage,
    isShowNotes,
    type,
    confirmationMessages,
    messages,
    action,
    notes,
    poNumber,
    requirePoNumber,
    openConfirmationModal,
    openMessageModal,
    openNotesModal,
    closeModal
  }
})
