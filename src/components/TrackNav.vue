<template>
  <Teleport to="body">
    <transition name="slide">
      <div v-if="isShowTrack" class="overlay" @click.self="trackStore.closeModal()">
        <div class="popup">
          <div class="title">
            Tracking Progress:
            <i class="bi bi-x" @click="trackStore.closeModal()"></i>
          </div>
          <Track />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { useTrackStore } from '@/stores/track'
import { storeToRefs } from 'pinia'
import Track from '@/components/Track.vue'

const trackStore = useTrackStore()

const { isShowTrack } = storeToRefs(trackStore)

</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 5%;
  left: 0;
  right: 0;
  bottom: 5%;
  display: flex;
  justify-content: flex-end;
  z-index: 1000;

  @media (max-width: 768px) {
    top: 3%;
    bottom: 0%;
  }
}

.popup {
  background-color: white;
  width: 33%;
  height: 100%;
  padding: 20px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    width: 90%;
    border-radius: 15px;
    padding: 15px;
  }

  .title {
    font-size: 28px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    margin: 0% 3% 3% 3%;

    @media (max-width: 768px) {
      font-size: 22px;
      margin: 0% 2% 5% 2%;
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
