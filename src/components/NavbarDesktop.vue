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
          <template v-for="(entry) in renderedMenu" :key="entry.key">
            <!-- Collapsible group (e.g. Spareparts -> Spareparts / Borrow / Stock History) -->
            <template v-if="entry.type === 'group'">
              <div class="feature group-header" @click="toggleGroup(entry.key)">
                <div class="logo">
                  <i :class="`bi bi-${iconMap[entry.key]}`"></i>
                </div>
                <div class="text text-feature">{{ entry.name }}</div>
                <i class="bi chevron" :class="openGroups[entry.key] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div v-show="openGroups[entry.key]" class="group-children">
                <router-link v-for="(feature) in entry.children" :to="menuMapping[feature].path"
                  class="menu-feature" :key="feature">
                  <div class="feature child">
                    <div class="logo">
                      <i :class="`bi bi-${iconMap[feature]}`"></i>
                    </div>
                    <div class="text text-feature">{{ menuMapping[feature]?.name }}</div>
                  </div>
                </router-link>
              </div>
            </template>

            <!-- Flat feature link -->
            <router-link v-else :to="menuMapping[entry.key].path" class="menu-feature">
              <div class="feature">
                <div class="logo">
                  <i :class="`bi bi-${iconMap[entry.key]}`"></i>
                </div>
                <div class="text text-feature">{{ menuMapping[entry.key]?.name }}</div>
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
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()

const { user } = storeToRefs(authStore)

const menu = computed(() => {
  return accessFeature[user.value.role.toLowerCase()]
})

// Sidebar groups: a parent label + the child feature keys it collapses. Children are still
// normal features in accessFeature — grouping is purely a rendering concern, so a role only
// sees the children it actually has access to. The group header reuses the parent feature's
// label/icon (e.g. 'spareparts').
const featureGroups = {
  spareparts: { name: menuMapping.spareparts.name, children: ['spareparts', 'borrow', 'stock_history'] }
}

// Reverse lookup: feature key -> group key it belongs to.
const featureToGroup = {}
Object.entries(featureGroups).forEach(([groupKey, def]) => {
  def.children.forEach((child) => { featureToGroup[child] = groupKey })
})

// Build the ordered render list: grouped features collapse into a single group entry (placed at
// the first occurrence of any of its children), everything else stays a flat feature.
const renderedMenu = computed(() => {
  const features = menu.value?.feature ?? []
  const out = []
  const emittedGroup = {}
  features.forEach((feature) => {
    const groupKey = featureToGroup[feature]
    if (groupKey) {
      if (!emittedGroup[groupKey]) {
        emittedGroup[groupKey] = true
        const children = featureGroups[groupKey].children.filter((c) => features.includes(c))
        out.push({ type: 'group', key: groupKey, name: featureGroups[groupKey].name, children })
      }
    } else {
      out.push({ type: 'feature', key: feature })
    }
  })
  return out
})

// Open/closed state per group. Default a group OPEN if the current route is one of its children.
const openGroups = reactive({})
Object.keys(featureGroups).forEach((groupKey) => {
  openGroups[groupKey] = featureGroups[groupKey].children.some(
    (child) => route.path === menuMapping[child].path || route.path.startsWith(menuMapping[child].path + '/')
  )
})

const toggleGroup = (groupKey) => {
  openGroups[groupKey] = !openGroups[groupKey]
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

      // Collapsible group header (e.g. Spareparts). Not a link — toggles its children.
      .group-header {
        cursor: pointer;

        .chevron {
          font-size: 0.9vw;
          padding-right: 12%;
        }
      }

      // Children sit indented under the group header.
      .group-children {
        width: 100%;

        .menu-feature .feature.child {
          padding-left: 22%;
          font-size: 0.95em;
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
