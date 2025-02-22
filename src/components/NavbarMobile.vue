<template>
  <div class="contain">
    <div class="left">
      <nav class="navbar navbar-light">
        <div class="container">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <!-- <div v-for="(menu) in menus" class="menu-role nav-link" :key="menu.path">
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
            </div> -->
            <ul class="navbar-nav me-auto mb-2 py-3 mb-lg-0">
              <li v-for="(menu) in menus" :key="menu.path" data-bs-toggle="collapse"
                data-bs-target=".navbar-collapse.show">
                <div class="role">
                  <div class="logo">
                    <i :class="`bi bi-${iconMap[menu.name.toLowerCase()]}`"></i>
                  </div>
                  <div class="text text-role">{{ menu.name }}</div>
                </div>
                <router-link v-for="(feature) in menu.feature" :to="menuMapping[feature].path" class="nav-link"
                  :key="menuMapping[feature]">
                  <div class="nav">
                    <div class="logo">
                      <i :class="`bi bi-${iconMap[feature]}`"></i>
                    </div>
                    <div class="text text-feature">{{ menuMapping[feature].name }}</div>
                  </div>
                </router-link>
              </li>
              <!-- <li data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
								<router-link to="/" class="nav-link">
									<div class="nav">
										<div class="logo">
											<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16">
												<path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/>
											</svg>
										</div>
										<div class="text">Home</div>
									</div>
								</router-link>
							</li> -->
              <li data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                <router-link to="/price-list" class="nav-link">
                  <div class="nav">
                    <div class="logo">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-down-up"
                        viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                          d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z" />
                      </svg>
                    </div>
                    <div class="text">Price List</div>
                  </div>
                </router-link>
              </li>
              <li data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                <router-link to="/profile" class="nav-link">
                  <div class="nav">
                    <div class="logo">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-down-up"
                        viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                          d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z" />
                      </svg>
                    </div>
                    <div class="text">Profile</div>
                  </div>
                </router-link>
              </li>
              <li>
                <div class="logout">
                  <div class="nav">
                    <a class="dropdown-item text" @click="logout()">Log out</a>
                  </div>
                </div>
              </li>

            </ul>
          </div>
        </div>
      </nav>
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
.contain {
  display: flex;
}

.navbar-nav {
  text-align: center;
  background-color: white;
  width: 90vw;
  border-radius: 20px;

  .role,
  .nav {
    display: flex;
    justify-content: center;
    align-items: center;

    .text {
      font-size: 4vw;
      padding-left: 2%;
    }

    .text-role {
      font-size: 5vw;
      font-weight: 700;
    }
  }
}

.profile {
  position: fixed;
  top: 0;
  right: 0;

  img {
    width: 70%;
  }
}
</style>
