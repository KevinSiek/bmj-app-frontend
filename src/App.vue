<template>
  <div id="bmjApp">
    <RouterView />
    <ModalMessage v-show="modalStore.isShowMessage" />
    <ModalConfirmation v-show="modalStore.isShowConfirmation" />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import ModalMessage from '@/components/ModalMessage.vue'
import ModalConfirmation from '@/components/ModalConfirmation.vue'
import { useModalStore } from '@/stores/modal'
import { useMainStore } from './stores/main'
import responsiveUtil from '@/utils/responsive'

const modalStore = useModalStore()
const mainStore = useMainStore()

const setDeviceType = () => {
  mainStore.setIsMobile(responsiveUtil.isMobile())
}

const handleResize = () => {
  setDeviceType()
  window.addEventListener('resize', setDeviceType)
}

const initPage = () => {
  handleResize()
}

initPage()

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap');

#bmjApp {
  font-family: 'poppins';
}
</style>
