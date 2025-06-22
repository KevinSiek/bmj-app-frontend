import { defineStore } from "pinia"
import { ref } from "vue"

export const useTrackStore = defineStore('track', () => {
  const isShowTrack = ref(false)
  const trackData = ref(null)

  const openTrackModal = () => {
    isShowTrack.value = true
  }

  const closeModal = () => {
    isShowTrack.value = false
    trackData.value = null
  }

  const setTrackData = async (data) => {
    trackData.value = data
  }

  return {
    isShowTrack,
    trackData,
    openTrackModal,
    closeModal,
    setTrackData
  }
})
