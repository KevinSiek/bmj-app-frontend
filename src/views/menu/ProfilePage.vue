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
          <input type="text" class="form-control mt-2" v-model="user.fullname" placeholder="Full name">
        </div>
        <div class="input form-group col-12">
          <label for="email">Email</label><br>
          <input type="email" class="form-control mt-2" v-model="user.email" placeholder="Email">
        </div>
        <div class="input form-group col-12">
          <label for="role">Role</label><br>
          <input type="role" class="form-control mt-2" v-model="user.role" placeholder="Role">
        </div>
        <div class="input form-group col-6">
          <label for="password">Password</label><br>
          <input type="password" class="form-control mt-2" v-model="user.password" placeholder="Password">
        </div>
        <div class="input form-group col-6">
          <label for="password">Confirm Password</label><br>
          <input type="password" class="form-control mt-2" v-model="user.confirm_password"
            placeholder="Retype Password">
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
