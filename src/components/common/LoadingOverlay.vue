<template>
  <v-overlay
    :model-value="loading"
    class="align-center justify-center"
    persistent
    scrim="#ffffff"
  >
    <v-progress-circular
      size="64"
      color="primary"
      indeterminate
    ></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
</script>