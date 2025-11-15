<template>
  <div id="container">
    <nav>
      <NavBarDesktopComponent v-if="!isMobile" class="navbar-desktop"></NavBarDesktopComponent>
    </nav>
    <div class="page">
      <div class="up">
        <NavBarMobileComponent v-if="isMobile" :logout="logout" class="navbar-mobile"></NavBarMobileComponent>
        <div class="page-title">
          <div class="title">
            <div v-if="router.currentRoute.value.meta.useBack" class="back">
              <i class="bi bi-caret-left-fill" @click="goBack()"></i>
            </div>
            <div class="text">
              {{ router.currentRoute.value.name }}
            </div>
          </div>
          <div v-if="router.currentRoute.value.meta.useTrack" class="track">
            <button type="button" class="btn" @click="trackStore.openTrackModal()">Track</button>
          </div>
        </div>
        <div class="profile-bar">
          <ProfileComponent v-if="!isMobile" :logout="logout" class="profile"></ProfileComponent>
        </div>
      </div>
      <div class="pages">
        <router-view />
      </div>
    </div>
  </div>
  <TrackNav ref="popup" />
</template>

<script setup>
import { defineAsyncComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBarDesktopComponent from '@/components/NavbarDesktop.vue'
import NavBarMobileComponent from '@/components/NavbarMobile.vue'
import ProfileComponent from '@/components/ProfileBar.vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores/main'
import { useTrackStore } from '@/stores/track'
import { useGeneralStore } from '@/stores/general'
import { useRole } from '@/composeable/useRole'

const TrackNav = defineAsyncComponent(() => import('@/components/TrackNav.vue'))

const authStore = useAuthStore()
const mainStore = useMainStore()
const generalStore = useGeneralStore()
const router = useRouter()
const trackStore = useTrackStore()
const { isMobile } = storeToRefs(mainStore)
const { isRoleDirector } = useRole()

onMounted(() => {
  if (isRoleDirector.value) {
    generalStore.getGeneralData()
  }
})

const goBack = () => {
  if (router) router.back()
}

const logout = async () => {
  await authStore.logout()
  router.replace({ name: 'Login' })
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap');
$primary-color: black;
$background-color: #f0f0f0;

#container {
  font-family: 'poppins';
  display: flex;
  height: 100vh;
  color: $primary-color;
  background-color: $background-color;

  nav {
    width: 25%;
    min-width: 15vw;

    a {
      font-weight: bold;
      color: white;

      &.router-link-exact-active {
        color: $primary-color;
      }
    }
  }

  .page {
    width: 100%;

    .up {
      height: 15vh;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .page-title {
        display: flex;
        font-size: 48px;
        padding-left: 4vw;
        align-items: center;

        .title {
          display: flex;
        }

        .back {
          display: flex;
          align-items: center;

          i {
            font-size: 30px;
          }
        }

        .text {
          padding-left: 1vw;
        }

        .track {
          padding-left: 4vw;
          display: flex;
          align-items: center;

          .btn {
            padding: 1vh 2vw 1vh 2vw;
            color: white;
            background-color: $primary-color
          }
        }

        ;
      }

      .profile-bar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin: 1.5% 2% 1.5% 3.5%;
      }
    }
  }

  .navbar-mobile {
    display: none;
  }
}

@media only screen and (max-width: 768px) {

  /* For mobile phones: */
  .navbar-desktop {
    display: none;
  }

  #container {
    flex-direction: column;

    .page {
      .up {
        height: 10vh;

        .page-title {
          display: flex;
          justify-content: space-between;
          margin-left: 18%;
          width: 100%;

          .back {
            i {
              font-size: 20px;
            }
          }

          .text {
            font-size: 5vw;
          }
        }
      }
    }

    .navbar-mobile {
      display: block;
      padding: 2% 0 0 2%;
      position: absolute;
      z-index: 1;
      top: 0;
      // width: 98vw;
    }
  }
}

@media only screen and (max-width: 766px) {
  #container {
    .up {
      .profile-bar {
        margin: 2.3%;
        display: none;
      }
    }
  }
}
</style>
