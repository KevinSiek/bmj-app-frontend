<template>
  <div class="main">
    <ul>
      <li v-for="(track, index) in trackProgress" :key="index">
        <template v-if="index === 0">
          <div class="step first" :class="{ active: !!track.active }">
            <i class="awesome bi bi-check-lg"></i>
          </div>
          <p class="label" :class="{ active: !!track?.active }">{{ track.state }}</p>
          <div class="info" :class="{ active: !!track?.active }">
            <div class="employee">{{ track.employee }}</div>
            <div class="date">{{ formatDateAndTime(track.timestamp) }}</div>
          </div>
        </template>
        <template v-else>
          <div class="step" :class="{ active: !!track?.active }">
            <i class="awesome bi bi-check-lg"></i>
          </div>
          <p class="label" :class="{ active: !!track?.active }">{{ track.state }}</p>
          <div class="info" :class="{ active: !!track?.active }">
            <div class="employee">{{ track.employee }}</div>
            <div class="date">{{ formatDateAndTime(track.timestamp) }}</div>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { common } from '@/config'
import { useTrackStore } from '@/stores/track'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { formatDateAndTime } from '@/utils/form-util'

const trackStore = useTrackStore()

const { trackData } = storeToRefs(trackStore)

const progressSteps = [
  common.track.po,
  common.track.pi,
  common.track.dpPaid,
  common.track.ready,
  common.track.release,
  common.track.done,
  common.track.return
]

const trackProgress = computed(() => {
  console.log(trackData.value)
  const activeSteps = trackData.value.map((step) => ({
    state: step.state?.toUpperCase() ?? null,
    employee: step?.employee ?? null,
    timestamp: step?.timestamp ?? null,
    active: true
  }))

  progressSteps.forEach((step) => {
    const found = trackData.value?.find(item => item.state === step)
    if (!found) {
      activeSteps.push({
        state: step?.toUpperCase(),
        employee: null,
        timestamp: null,
        active: false
      })
    }
  })
  console.log(activeSteps)
  return activeSteps
})

</script>

<style lang="scss" scoped>
$primary-color: black;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

ul {
  display: flex;
  flex-direction: column;
  align-items: center;
}

ul li {
  height: 28px;
  list-style: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 25px 0;
}

ul li {
  font-family: sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #c1c1c1;

  .label {
    margin-left: 10px;
    text-align: left;
    width: 100px;
  }

  .info {
    width: 200px;
  }
}

ul li .step {
  height: 30px;
  width: 30px;
  border-radius: 50%;
  background-color: #d7d7c3;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ghostwhite;
  position: relative;
  cursor: pointer;
}

.step::after {
  content: "";
  position: absolute;
  width: 3.5px;
  height: 48px;
  background-color: #d7d7c3;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.first::after {
  width: 0;
  height: 0;
}

ul li .step .awesome {
  display: none;
}

ul li .step.active {
  background-color: $primary-color;
}

ul li .active {
  color: #333;
}

li .active::after {
  background-color: $primary-color;
}

ul li .active .awesome {
  display: flex;
  font-size: 16px;
  color: ghostwhite;
}
</style>
