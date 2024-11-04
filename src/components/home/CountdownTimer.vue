<!-- components/CountdownTimer.vue -->
<template>
  <div v-if="showCountdown" class="d-flex align-center">
    <span class="text-white me-2">Kết thúc trong:</span>
    <v-chip
      v-for="(value, unit) in timeRemaining"
      :key="unit"
      color="white"
      size="small"
      class="font-weight-bold mx-1"
    >
      {{ String(value).padStart(2, '0') }}
      {{ unit === 'hours' ? 'h' : unit === 'minutes' ? 'm' : 's' }}
    </v-chip>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  endTime: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['timeout'])

const timeRemaining = ref({
  hours: 0,
  minutes: 0,
  seconds: 0
})

const showCountdown = ref(true)
let timer = null

const calculateTimeRemaining = () => {
  const now = new Date().getTime()
  const end = new Date(props.endTime).getTime()
  const diff = end - now

  if (diff <= 0) {
    showCountdown.value = false
    clearInterval(timer)
    emit('timeout')
    return
  }

  timeRemaining.value = {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

// Watch for changes in endTime
watch(() => props.endTime, (newEndTime) => {
  if (newEndTime) {
    showCountdown.value = true
    calculateTimeRemaining()
  }
})

onMounted(() => {
  calculateTimeRemaining()
  timer = setInterval(calculateTimeRemaining, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>