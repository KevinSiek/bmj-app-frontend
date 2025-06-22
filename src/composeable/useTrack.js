import { ref } from "vue"

export function useTrack() {
  const isShowTrack = ref(false)
  const trackData = ref(null)
  const getTrackFunc = ref(() => {})

  const openTrackModal = () => {
    isShowTrack.value = true
  }

  const setGetTrackFunc = (fn) => {
    getTrackFunc.value = fn
  }

  const setTrackData = (data) => {
    trackData.value = data
  }

  const closeModal = () => {
    isShowTrack.value = false
    trackData.value = null
  }

  return {
    isShowTrack,
    trackData,
    getTrackFunc,
    openTrackModal,
    closeModal,
    setGetTrackFunc,
    setTrackData
  }
}
