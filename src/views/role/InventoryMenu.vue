<template>
  <template v-for="(item, index) in componentList" :key="index">
    <router-link :to="item.path" class="menu-item nav-link">
      <component :is="item.component"></component>
    </router-link>
  </template>
</template>

<script setup>
import { ref } from 'vue'
import MenuPurchase from '@/components/menu/MenuPurchase.vue'
import MenuBackOrder from '@/components/menu/MenuBackOrder.vue'
import MenuSparepart from '@/components/menu/MenuSparepart.vue'
import MenuPurchaseOrder from '@/components/menu/MenuPurchaseOrder.vue'
import { menuMapping } from '@/config'

const componentList = ref([
  {
    name: 'Sparepart',
    component: MenuSparepart,
    path: menuMapping.spareparts.path
  },
  {
    name: 'Purchase Order',
    component: MenuPurchaseOrder,
    path: menuMapping.purchase_order.path
  },
  {
    name: 'Purchase',
    component: MenuPurchase,
    path: menuMapping.purchase.path
  },
  {
    name: 'Back Order',
    component: MenuBackOrder,
    path: menuMapping.back_order.path
  }
])
</script>

<style lang="scss">
.menu-item {
  width: 25%;
  margin: 3%;
  height: 23vh;
  border-radius: 15px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;

  .title {
    margin-top: 3%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3%;
    font-size: 1.5vw;

    .icon {
      width: 1.6vw;
    }
  }

  .information {
    margin-top: 2%;
    display: flex;
    width: 60%;
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
}
</style>
