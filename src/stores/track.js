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
  }

  const trackType = ref(null)

  const setTrackData = async (data, type = null) => {
    trackData.value = data
    trackType.value = type
  }

  return {
    isShowTrack,
    trackData,
    trackType,
    openTrackModal,
    closeModal,
    setTrackData
  }
})
