<template>
  <div class="contain">
    <img src="@/assets/images/ProfilePicture.png" alt="">
    <div class="text" data-bs-toggle="dropdown">
      Hello, {{ userName }}
    </div>
    <div class="profilePP">
      <div class="nav-item dropdown">
        <a class="nav-link" data-bs-toggle="dropdown" href="#" aria-expanded="false">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
            <path
              d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
          </svg>
        </a>
        <ul class="dropdown-menu dropdown-menu-right dropdown">
          <li><router-link to="/profile" class="dropdown-item">Profile</router-link></li>
          <li><button type="button" class="dropdown-item logout-btn" @click="handleLogout">Log out</button></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps(["logout"])

const authStore = useAuthStore()
const router = useRouter()

const userName = computed(() =>
  authStore.user?.fullname?.split(' ')[0] || 'User'
)

// FIXED: Handle logout with multiple fallback mechanisms
const handleLogout = async () => {
  try {
    console.log('Logout initiated')
    
    // Try using the parent logout prop first (if provided)
    if (props.logout && typeof props.logout === 'function') {
      console.log('Using parent logout function')
      await props.logout()
    } else {
      // Fallback to direct auth store logout
      console.log('Using auth store logout')
      await authStore.logout()
      router.replace({ name: 'Login' })
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Force logout as last resort
    authStore.forceLogout()
  }
}

</script>

<style scoped lang="scss">
$primary-color: black;

.contain {
  display: flex;
  align-items: center;

  img {
    width: 35%;
  }

  .text {
    margin-left: 1vw;
    font-size: 1.2vw;
    width: 100%;
  }

  svg {
    display: flex;
    align-items: center;
    width: 2vw;
    height: 2.5vh;
    color: $primary-color;
  }
}

// FIXED: Logout button styling to be properly clickable
.logout-btn {
  border: none !important;
  background: none !important;
  width: 100% !important;
  text-align: left !important;
  cursor: pointer !important;
  padding: 0.25rem 1rem !important;
  font-size: inherit !important;
  color: #212529 !important;
  
  &:hover {
    background-color: #e9ecef !important;
    text-decoration: none !important;
  }
  
  &:focus {
    outline: none !important;
    background-color: #f8f9fa !important;
  }
}

@media only screen and (max-width: 769px) {
  .contain {
    img {
      width: 25%;
    }

    .text {
      font-size: 2vw;
    }

    svg {
      width: 3vw;
    }
  }
}

@media only screen and (max-width: 767px) {

  /* For mobile phones: */
  .contain {
    img {
      width: 15%;
    }

    .text {
      font-size: 3.5vw;
    }

    svg {
      width: 3.5vw;
    }
  }
}
</style>