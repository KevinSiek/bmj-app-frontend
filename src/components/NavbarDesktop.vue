<template>
  <div class="contain">
    <div class="webName">
      <!-- <img src="../assets/WebName.png" alt=""> -->
      PT. BMJ
    </div>
    <div class="navs">
      <div v-for="(menu) in menus" class="menu-role nav-link" :key="menu.path">
        <div class="nav my-2">
          <div class="role my-3">
            <div class="logo">
              <i :class="`bi bi-${iconMap[menu.name.toLowerCase()]}`"></i>
            </div>
            <div class="text text-role mx-2">{{ menu.name }}</div>
          </div>
          <router-link v-for="(feature) in menu.feature" :to="menuMapping[feature].path" class="menu-feature"
            :key="menuMapping[feature]">
            <div class="feature">
              <div class="logo">
                <i :class="`bi bi-${iconMap[feature]}`"></i>
              </div>
              <div class="text text-feature">{{ menuMapping[feature].name }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { menuMapping } from '@/config'

const iconMap = {
  director: 'person-square',
  dashboard: 'clipboard-data',
  quotation: 'file-text-fill',
  purchase_order: 'clipboard-check-fill',
  proforma_invoice: 'bookmark-star-fill',
  invoice: 'receipt',
  spareparts: 'boxes',
  back_order: 'cart-plus',
  purchase: 'cart',
  employee: 'person-fill-gear',
  work_order: 'person-workspace'
}

const menus = [
  {
    path: '/director',
    name: 'Director',
    feature: [
      'dashboard',
      'quotation',
      'purchase_order',
      'proforma_invoice',
      'invoice',
      'spareparts',
      'back_order',
      'purchase',
      'employee',
      'work_order'
    ]
  },
  // {
  //   path: '/marketing',
  //   name: 'Marketing',
  //   feature: [
  //     'quotation',
  //     'purchase_order'
  //   ]
  // },
  // {
  //   path: '/inventory',
  //   name: 'Inventory',
  //   feature: [
  //     'purchase_order',
  //     'spareparts',
  //     'back_order',
  //     'purchase'
  //   ]
  // },
  // {
  //   path: '/finance',
  //   name: 'Finance',
  //   feature: [
  //     'quotation',
  //     'purchase_order',
  //     'proforma_invoice',
  //     'invoice'
  //   ]
  // },
  // {
  //   path: '/service',
  //   name: 'Service',
  //   feature: [
  //     'purchase_order',
  //     'back_order',
  //     'work_order'
  //   ]
  // }
]

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
