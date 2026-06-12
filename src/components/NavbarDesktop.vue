<template>
  <div class="contain">
    <div class="webName">
      <!-- <img src="/assets/images.png" alt=""> -->
      <router-link :to="menuMapping.menu.path" class="nav-link">
        PT. BMJ
      </router-link>
    </div>
    <div class="navs">
      <div class="menu-role nav-link">
        <div class="nav my-2">
          <div class="role my-3">
            <div class="logo">
              <i :class="`bi bi-${iconMap['user']}`"></i>
            </div>
            <div class="text text-role mx-2">{{ menu?.name }}</div>
          </div>
          <template v-for="(feature, index) in menu?.feature" :key="index">
            <!-- Submenu group -->
            <template v-if="typeof feature === 'object'">
              <div class="submenu-header" @click="toggleSubmenu(index)">
                <div class="feature">
                  <div class="logo">
                    <i :class="`bi bi-${iconMap[feature.key]}`"></i>
                  </div>
                  <div class="text text-feature">{{ feature.label }}</div>
                  <div class="chevron">
                    <i :class="`bi bi-chevron-${openSubmenus.has(index) ? 'up' : 'down'}`"></i>
                  </div>
                </div>
              </div>
              <div v-if="openSubmenus.has(index)" class="submenu-children">
                <router-link v-for="child in feature.feature" :to="menuMapping[child].path" :key="child"
                  class="menu-feature">
                  <div class="feature feature-child">
                    <div class="logo">
                      <i :class="`bi bi-${iconMap[child]}`"></i>
                    </div>
                    <div class="text text-feature">{{ menuMapping[child]?.name }}</div>
                  </div>
                </router-link>
              </div>
            </template>
            <!-- Regular feature -->
            <router-link v-else :to="menuMapping[feature].path" class="menu-feature">
              <div class="feature">
                <div class="logo">
                  <i :class="`bi bi-${iconMap[feature]}`"></i>
                </div>
                <div class="text text-feature">{{ menuMapping[feature]?.name }}</div>
              </div>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { menuMapping, accessFeature } from '@/config'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const route = useRoute()

const { user } = storeToRefs(authStore)

const menu = computed(() => {
  return accessFeature[user.value.role.toLowerCase()]
})

const openSubmenus = ref(new Set())

const toggleSubmenu = (index) => {
  const updated = new Set(openSubmenus.value)
  if (updated.has(index)) {
    updated.delete(index)
  } else {
    updated.add(index)
  }
  openSubmenus.value = updated
}

const iconMap = {
  user: 'person-square',
  dashboard: 'clipboard-data',
  quotation: 'file-text-fill',
  purchase_order: 'clipboard-check-fill',
  proforma_invoice: 'bookmark-star-fill',
  invoice: 'receipt',
  spareparts: 'boxes',
  back_order: 'cart-plus',
  purchase: 'cart',
  employee: 'person-fill-gear',
  work_order: 'person-workspace',
  delivery_order: 'truck',
  general: 'sliders',
  upload_data: 'file-earmark-arrow-up',
  borrow: 'box-arrow-right',
  stock_history: 'clock-history'
}

// const menus = [
//   {
//     path: '/director',
//     name: 'Director',
//     feature: [
//       'dashboard',
//       'quotation',
//       'purchase_order',
//       'proforma_invoice',
//       'invoice',
//       'spareparts',
//       'back_order',
//       'purchase',
//       'employee',
//       'work_order',
//       'delivery_order',
//       'general'
//     ]
//   },
//   // {
//   //   path: '/marketing',
//   //   name: 'Marketing',
//   //   feature: [
//   //     'quotation',
//   //     'purchase_order'
//   //   ]
//   // },
//   // {
//   //   path: '/inventory',
//   //   name: 'Inventory',
//   //   feature: [
//   //     'purchase_order',
//   //     'spareparts',
//   //     'back_order',
//   //     'purchase'
//   //   ]
//   // },
//   // {
//   //   path: '/finance',
//   //   name: 'Finance',
//   //   feature: [
//   //     'quotation',
//   //     'purchase_order',
//   //     'proforma_invoice',
//   //     'invoice'
//   //   ]
//   // },
//   // {
//   //   path: '/service',
//   //   name: 'Service',
//   //   feature: [
//   //     'purchase_order',
//   //     'back_order',
//   //     'work_order'
//   //   ]
//   // }
// ]

</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
$primary-color: black;
$white: #ffffff;
$dark-white: #D1D1D1;

.contain {
  background-color: $primary-color;
  font-family: 'Roboto';
  letter-spacing: 1px;
  border-radius: 20px;
  font-size: 1.2vw;
  height: 100vh;

  .webName {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 15vh;
    color: $white;
    font-size: 2.2vw;
    font-weight: 600;

    img {
      width: 75%;
    }
  }

  .navs {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: calc(85vh);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 0px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: $dark-white;
      border-radius: 10px;
    }

    .menu-role {
      width: 100%;
      display: flex;
      justify-content: center;

      .nav {
        width: 80%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: $dark-white;

        .role {
          display: flex;
          align-items: center;
          margin-bottom: 3%;
          font-size: 20px;
        }

        .text {
          padding-left: 1vw;
          font-weight: 800;
        }
      }

      .menu-feature {
        width: 100%;
        text-decoration: none;
      }

      .feature {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        color: $dark-white;
        align-items: center;
        border-style: solid;
        border-radius: 10px;
        border-color: transparent;
        padding: 3.5% 0% 3.5% 10%;
        margin: 1%;

        .text-feature {
          display: flex;
          flex-direction: row;
          font-weight: 500;
          width: 100%;
        }
      }

      .submenu-header {
        width: 100%;
        cursor: pointer;

        .feature {
          .chevron {
            margin-left: auto;
            padding-right: 10%;
          }
        }
      }

      .submenu-children {
        width: 100%;
        overflow: hidden;

        .feature-child {
          padding-left: 18%;
          width: calc(100% - 2%);
          box-sizing: border-box;
        }
      }
    }

    a.active {
      .feature {
        border-color: $white;

        .logo,
        .text {
          font-weight: 600;
          color: $white;
        }
      }
    }
  }
}
</style>
