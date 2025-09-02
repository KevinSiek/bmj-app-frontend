<template>
  <div class="contain">
    <div class="user-profile shadow">
      <div class="profile-name">
        <div class="profile-picture">
          <img src="@/assets/images/ProfilePicture.png" alt="">
        </div>
        <div class="name">
          Hi, {{ userName }} !
        </div>
      </div>
      <form @submit.prevent="updateProfileConfirmation()" class="row form-profile">
        <div class="input form-group col-12">
          <label for="name">Full Name</label><br>
          <input type="text" class="form-control mt-2" v-model="user.fullname" placeholder="Full name" disabled>
        </div>
        <div class="input form-group col-12">
          <label for="email">Email</label><br>
          <input type="email" class="form-control mt-2" v-model="user.email" placeholder="Email" disabled>
        </div>
        <div class="input form-group col-12">
          <label for="role">Role</label><br>
          <input type="role" class="form-control mt-2" v-model="user.role" placeholder="Role" disabled>
        </div>
        <div class="input form-group col-6">
          <label for="password">Password</label><br>
          <div class="input-group mt-2">
            <input :type="isPassShow ? 'text' : 'password'" class="input form-control" v-model="user.password"
              placeholder="Password">
            <span class="input input-group-text">
              <button type="button" @mousedown="showHidePass(true)" @mouseup="showHidePass(false)"
                @mouseleave="showHidePass(false)" class="showHideBtn">
                <svg v-if="!isPassShow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-eye" viewBox="0 0 16 16">
                  <path
                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-eye-slash" viewBox="0 0 16 16">
                  <path
                    d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                  <path
                    d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                  <path
                    d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                </svg>
              </button>
            </span>
          </div>
        </div>
        <div class="input form-group col-6">
          <label for="password">Confirm Password</label><br>
          <div class="input-group mt-2">
            <input :type="isConfPassShow ? 'text' : 'password'" class="input form-control"
              v-model="user.confirm_password" placeholder="Retype Password">
            <span class="input input-group-text">
              <button type="button" @mousedown="showHideConfPass(true)" @mouseup="showHideConfPass(false)"
                @mouseleave="showHideConfPass(false)" class="showHideBtn">
                <svg v-if="!isConfPassShow" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                  fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                  <path
                    d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-eye-slash" viewBox="0 0 16 16">
                  <path
                    d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                  <path
                    d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                  <path
                    d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                </svg>
              </button>
            </span>
          </div>
        </div>
        <div class="button">
          <button type="submit" class="btn btn-update">
            Update Profile
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'
import { common } from '@/config'

const auth = useAuthStore()
const modalStore = useModalStore()

const userName = ref('')
const isPassShow = ref(false)
const isConfPassShow = ref(false)
const user = reactive({
  fullname: '',
  email: '',
  role: '',
  password: '',
  confirm_password: ''
})

onBeforeMount(() => {
  _getUser()
});

watch(() => auth.user, () => {
  _getUser()
  user.password = ''
  user.confirm_password = ''
})

const _getUser = () => {
  user.fullname = auth.user?.fullname
  user.email = auth.user?.email
  user.role = auth.user?.role
  user.password = ''
  user.confirm_password = ''
  userName.value = auth.user?.fullname.split(' ')[0]
}

const showHidePass = (isShow) => {
  isPassShow.value = isShow
}
const showHideConfPass = (isShow) => {
  isConfPassShow.value = isShow
}

const updateProfile = async () => {
  try {
    if (user.password === user.confirm_password) {
      await auth.updateUser(user)
    } else {
      throw {
        data: {
          error: 'Password and Confirm Password do not match'
        }
      }
    }
  } catch (error) {
    console.log('error', error)
    throw error.data.error || error.data.message
  }
}

const updateProfileConfirmation = () => {
  modalStore.openConfirmationModal('to Update this Profile ?', 'Update Profile Success', updateProfile)
}
</script>

<style lang="scss" scoped>
$primary-color: black;

.user-profile {
  margin: 2% 4%;
  padding: 1%;
  height: 80vh;
  border-radius: 20px;
  background-color: white;

  .profile-name {
    display: flex;
    padding: 4% 10% 1.5% 10%;

    .profile-picture img {
      width: 10vw;
    }

    .name {
      margin-left: 4vw;
      align-self: center;
      font-size: 3vw;
    }
  }

  .form-profile {
    padding: 2% 10% 0 10%;

    .input {
      margin-top: 1%;

      .showHideBtn {
        background-color: transparent;
        border-color: transparent;
        display: flex;
      }
    }
  }
}

.btn-update {
  width: 40%;
  margin-top: 3%;
  padding: 1vh 0 1vh 0;
  font-weight: 500;
  color: white;
  background-color: $primary-color;
  font-size: 1.1vw;
  letter-spacing: 0.03vw;
}

@media only screen and (max-width: 769px) {
  .contain {
    .up {
      .title {
        font-size: 4vw;
      }
    }

    .user-profile {
      .profile-name {
        .name {
          font-size: 5vw;
        }

        .email {
          font-size: 2vw;
        }
      }
    }

    .btn-update {
      width: 100%;
      font-size: 2vw;
    }
  }
}

@media only screen and (max-width: 767px) {
  .contain {
    .up {
      .title {
        font-size: 5vw;
      }
    }

    .user-profile {
      padding-top: 7%;
      margin: 5% 6% 3% 6%;

      .profile-name {
        .name {
          font-size: 7vw;
        }

        .email {
          font-size: 3vw;
        }
      }

      .input {
        padding-top: 5%;

        label {
          font-size: 3vw;
        }
      }
    }

    .btn-update {
      margin-top: 8%;
      font-size: 3vw;
    }
  }
}
</style>
