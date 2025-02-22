<template>
  <LoginDesktop :user="user" :login="login" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import LoginDesktop from '@/components/LoginDesktop.vue'
import { reactive, ref } from 'vue'

// const auth = useAuth()
const router = useRouter()
// const infoStore = useInfoStore()

const isLoading = ref(false)
const isPassShow = ref(false)

const user = reactive({
  email: '',
  password: '',
})

const login = async () => {
  isLoading.value = true
  try {
    // await auth.login(user)
    router.push('/menu')
  } catch (error) {
    // infoStore.setInfo(true, 'Failed', 'Email or Password is incorrect')
  }
  isLoading.value = false
}
</script>

<style lang="scss" scoped></style>
