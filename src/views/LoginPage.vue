<template>
  <LoginDesktop :user="user" :login="login" :is-pass-show="isPassShow" :showHide="showHide" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import LoginDesktop from '@/components/LoginDesktop.vue'
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import { common } from '@/config'

const auth = useAuthStore()
const router = useRouter()
const modalStore = useModalStore()

const isLoading = ref(false)
const isPassShow = ref(false)

const user = reactive({
  email: '',
  password: '',
})

const login = async () => {
  isLoading.value = true
  try {
    await auth.login(user)
    router.push('/menu')
  } catch (error) {
    modalStore.openMessageModal(common.modal.failed, 'Email or Password is incorrect')
  } finally {
    isLoading.value = false
  }
}

const showHide = (isShow) => {
  isPassShow.value = isShow
}

</script>

<style lang="scss" scoped></style>
