<template>
  <MenuUpper />
  <div class="menu">
    <router-view></router-view>
  </div>
</template>

<script setup>
import MenuUpper from '@/components/menu/MenuUpper.vue'

</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
</style>
