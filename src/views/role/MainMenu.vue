<template>
  <router-link class="menu-item nav-link director" :to="menuConfig.menu_director.path">
    <div class="title">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
          <path
            d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z" />
          <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z" />
        </svg>
      </div>
      <div class="text">
        Director
      </div>
    </div>
    <div v-if="userRole === common.role.director" class="information">
      <!-- QUOTATION -->
      <div class="information__item">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-file-earmark-text"
            viewBox="0 0 16 16">
            <path
              d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
            <path
              d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
          </svg>
        </div>
        <div class="value">
          : {{ summary?.quotation || 0 }}
        </div>
      </div>
      <!-- PURCHASE ORDER -->
      <div class="information__item">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-file-earmark-check"
            viewBox="0 0 16 16">
            <path
              d="M10.854 7.854a.5.5 0 0 0-.708-.708L7.5 9.793 6.354 8.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z" />
            <path
              d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
          </svg>
        </div>
        <div class="value">
          : {{ summary?.purchase_order || 0 }}
        </div>
      </div>
      <!-- DELIVERY ORDER -->
      <div class="information__item">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-boxes" viewBox="0 0 16 16">
            <path
              d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z" />
          </svg>
        </div>
        <div class="value">
          : {{ summary?.delivery_order || 0 }}
        </div>
      </div>
      <!-- WORK ORDER -->
      <div class="information__item">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-tools" viewBox="0 0 16 16">
            <path
              d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.68-2.643A3.005 3.005 0 0 0 16 3q0-.405-.102-.777l-2.14 2.141L12 4l-.364-1.757L13.777.102a3 3 0 0 0-3.675 3.68L7.462 6.46 4.793 3.793a1 1 0 0 1-.293-.707v-.071a1 1 0 0 0-.419-.814zm9.646 10.646a.5.5 0 0 1 .708 0l2.914 2.915a.5.5 0 0 1-.707.707l-2.915-2.914a.5.5 0 0 1 0-.708M3 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z" />
          </svg>
        </div>
        <div class="value">
          : {{ summary?.work_order || 0 }}
        </div>
      </div>
    </div>
  </router-link>
  <router-link class="menu-item nav-link sales" :to="menuConfig.menu_sales.path">
    <div class="title">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-graph-up-arrow" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5" />
        </svg>
      </div>
      <div class="text">
        Marketing
      </div>
    </div>
    <!-- QUOTATION APPROVE -->
    <div v-if="userRole === common.role.marketing || userRole === common.role.director" class="information marketing">
      <div class="information__item text-success">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-file-earmark-text"
            viewBox="0 0 16 16">
            <path
              d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
            <path
              d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
          </svg>
        </div>
        <div class="value">
          : {{ summary?.quotation?.approve || 0 }} / {{ summary?.quotation?.total || 0 }}
        </div>
      </div>
      <!-- QUOTATION REJECT -->
      <div class="information__item text-danger">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-file-earmark-text"
            viewBox="0 0 16 16">
            <path
              d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
            <path
              d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
          </svg>
        </div>
        <div class="value">
          : {{ summary?.quotation?.reject || 0 }} / {{ summary?.quotation?.total || 0 }}
        </div>
      </div>
      <!-- PURCHASE ORDER DONE -->
      <div class="information__item">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-file-earmark-check"
            viewBox="0 0 16 16">
            <path
              d="M10.854 7.854a.5.5 0 0 0-.708-.708L7.5 9.793 6.354 8.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z" />
            <path
              d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
          </svg>
        </div>
        <div class="value">
          : <span class="text-success">{{ summary?.purchase_order?.done || 0 }}</span>/<span class="text-danger">{{
            summary?.purchase_order?.total || 0 }}</span>
        </div>
      </div>
      <!-- DELIVERY ORDER DONE -->
      <div class="information__item">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-boxes" viewBox="0 0 16 16">
            <path
              d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z" />
          </svg>
        </div>
        <div class="value">
          : <span class="text-success">{{ summary?.delivery_order?.done || 0 }}</span>/<span class="text-danger">{{
            summary?.delivery_order?.total || 0 }}</span>
        </div>
      </div>
      <!-- WORK ORDER DONE -->
      <div class="information__item">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-tools" viewBox="0 0 16 16">
            <path
              d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.68-2.643A3.005 3.005 0 0 0 16 3q0-.405-.102-.777l-2.14 2.141L12 4l-.364-1.757L13.777.102a3 3 0 0 0-3.675 3.68L7.462 6.46 4.793 3.793a1 1 0 0 1-.293-.707v-.071a1 1 0 0 0-.419-.814zm9.646 10.646a.5.5 0 0 1 .708 0l2.914 2.915a.5.5 0 0 1-.707.707l-2.915-2.914a.5.5 0 0 1 0-.708M3 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z" />
          </svg>
        </div>
        <div class="value">
          : <span class="text-success">{{ summary?.work_order?.done || 0 }}</span>/<span class="text-danger">{{
            summary?.work_order?.total || 0 }}</span>
        </div>
      </div>
    </div>
  </router-link>
  <router-link class="menu-item nav-link inventory" :to="menuConfig.menu_inventory.path">
    <div class="title">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-boxes" viewBox="0 0 16 16">
          <path
            d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z" />
        </svg>
      </div>
      <div class="text">
        Inventory
      </div>
    </div>
    <div v-if="userRole === common.role.inventory || userRole === common.role.director" class="information inventory">
      <div>Prepare: {{ summary?.purchase_order?.prepare || 0 }}</div>
      <div>Ready: {{ summary?.purchase_order?.ready || 0 }}</div>
      <div>Release: {{ summary?.purchase_order?.release || 0 }}</div>
      <div>Total: {{ summary?.purchase_order?.total || 0 }}</div>
    </div>
  </router-link>
  <router-link class="menu-item nav-link finance" :to="menuConfig.menu_finance.path">
    <div class="title">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-file-earmark-bar-graph"
          viewBox="0 0 16 16">
          <path
            d="M10 13.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm-2.5.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5zm-3 0a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5z" />
          <path
            d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
        </svg>
      </div>
      <div class="text">
        Finance
      </div>
    </div>
    <div v-if="userRole === common.role.finance || userRole === common.role.director" class="information finance">
      <div>Waiting for payment: {{ summary?.purchase_order?.wait_for_payment || 0 }}</div>
      <div>DP Paid: {{ summary?.purchase_order?.dp_paid || 0 }}</div>
      <div>Full Paid: {{ summary?.purchase_order?.full_paid || 0 }}</div>
    </div>
  </router-link>
  <router-link class="menu-item nav-link service" :to="menuConfig.menu_service.path">
    <div class="title">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-person-fill-gear" viewBox="0 0 16 16">
          <path
            d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4m9.886-3.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
        </svg>
      </div>
      <div class="text">
        Service
      </div>
    </div>
    <div v-if="userRole === common.role.service || userRole === common.role.director" class="information service">
      <div>On progress: {{ summary?.work_order?.on_progress || 0 }}</div>
      <div>Done: {{ summary?.work_order?.done || 0 }}</div>
      <div>Total: {{ summary?.work_order?.total || 0 }}</div>
    </div>
  </router-link>
</template>

<script setup>
import { menuMapping as menuConfig, common } from '@/config'
import { useAuthStore } from '@/stores/auth'
import { useSummaryStore } from '@/stores/summary'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

const summaryStore = useSummaryStore()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore)
const { summary } = storeToRefs(summaryStore)

const userRole = computed(() => user.value?.role || 'guest')

onMounted(() => {
  summaryStore.getSummary()
})

</script>

<style lang="scss" scoped>
.menu-item {
  width: 25%;
  margin: 3%;
  height: 26vh;
  border-radius: 15px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3%;
    font-size: 2vw;

    .icon {
      width: 1.6vw;
      margin-right: 1vw;
    }
  }

  .information {
    display: flex;
    min-width: 60%;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;

    &__item {
      display: flex;
      margin: 4% 10%;

      .icon {
        width: 1.6vw;
      }

      .value {
        font-size: 16px;
      }
    }
  }

  .marketing {
    display: flex;
    flex-wrap: wrap;

    .information__item {
      margin: 3% 5%;
    }
  }

  .finance,
  .inventory,
  .service {
    display: flex;
    flex-direction: column;
  }
}

.director {}
</style>
