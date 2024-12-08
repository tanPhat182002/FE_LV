<!-- components/CountdownTimer.vue -->
<template>
  <div class="countdown-timer d-flex align-center">
    <span class="text-white me-2">Kết thúc trong:</span>
    <div class="d-flex">
      <div class="time-block">
        <span class="time">{{ formatNumber(timeRemaining.hours) }}</span>
        <small>Giờ</small>
      </div>
      <span class="separator">:</span>
      <div class="time-block">
        <span class="time">{{ formatNumber(timeRemaining.minutes) }}</span>
        <small>Phút</small>
      </div>
      <span class="separator">:</span>
      <div class="time-block">
        <span class="time">{{ formatNumber(timeRemaining.seconds) }}</span>
        <small>Giây</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'

const props = defineProps({
  endTime: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['timeout'])
const timeRemaining = ref({ hours: 0, minutes: 0, seconds: 0 })
let timer = null

const formatNumber = (num) => {
  return Math.max(0, Math.floor(num)).toString().padStart(2, '0')
}

const calculateTimeRemaining = () => {
  const endTime = new Date(props.endTime).getTime()
  const now = new Date().getTime()
  const timeDiff = endTime - now

  if (timeDiff <= 0) {
    timeRemaining.value = { hours: 0, minutes: 0, seconds: 0 }
    clearInterval(timer)
    emit('timeout')
    return
  }

  // Chuyển đổi milliseconds thành giờ, phút, giây
  const hours = timeDiff / (1000 * 60 * 60)
  const minutes = (hours % 1) * 60
  const seconds = (minutes % 1) * 60

  timeRemaining.value = {
    hours: Math.floor(hours),
    minutes: Math.floor(minutes),
    seconds: Math.floor(seconds)
  }
}

onMounted(() => {
  calculateTimeRemaining()
  timer = setInterval(calculateTimeRemaining, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.countdown-timer {
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

.time-block {
  text-align: center;
  margin: 0 2px;
}

.time {
  background: rgba(255, 255, 255, 0.9);
  color: #ff4444;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: bold;
}

.separator {
  color: white;
  font-weight: bold;
  margin: 0 2px;
}

small {
  color: white;
  font-size: 0.75rem;
  margin-left: 2px;
}
</style>