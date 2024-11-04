<template>
  <v-snackbar
    :model-value="modelValue"
    :color="color"
    timeout="3000"
    location="top right"
  >
    {{ text }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="$emit('close')"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  modelValue: Boolean,
  text: String,
  color: {
    type: String,
    default: 'error'
  }
})

defineEmits(['update:modelValue', 'close'])
</script>