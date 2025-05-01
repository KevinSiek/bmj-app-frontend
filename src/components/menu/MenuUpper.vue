<template>
  <div class="upper-bar">
    <div class="upper-bar__item company-name">
      <router-link :to="menuMapping.menu.path" class="nav-link">
        PT. BMJ
      </router-link>
    </div>
    <div class="upper-bar__item title">Menu</div>
    <div class="upper-bar__item profile-bar">
      <ProfileBar />
    </div>
  </div>
</template>

<script setup>
import ProfileBar from '@/components/ProfileBar.vue'
import { menuMapping } from '@/config'
</script>

<style lang="scss" scoped>
.upper-bar {
  display: flex;
  justify-content: space-between;
  padding: 1.5% 2% 1.5% 3.5%;

  &__item {
    width: 100%;
    display: flex;
  }

  .company-name {
    font-size: 2vw;
  }

  .title {
    justify-content: center;
    font-size: 2.3vw;
  }

  .profile-bar {
    justify-content: flex-end;
  }
}
</style>
