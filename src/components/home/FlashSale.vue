<template>
  <v-card v-if="hasActiveFlashSale" class="mb-4" elevation="1">
    <!-- Header -->
    <v-card-item class="bg-error">
      <template v-slot:prepend>
        <v-icon color="white" icon="mdi-flash" class="me-2"></v-icon>
      </template>
      
      <v-card-title class="text-white">
        Flash Sale
      </v-card-title>
      
      <v-spacer></v-spacer>
      
      <!-- Countdown Timer -->
      <CountdownTimer
        v-if="flashSaleEndTime" 
        :end-time="flashSaleEndTime"
        @timeout="handleTimeout"
      />
    </v-card-item>

    <!-- Products -->
    <v-card-text class="pa-4">
      <v-row>
        <v-col
          v-for="product in flashSaleProducts"
          :key="product.id"
          cols="12"
          sm="6"
          md="3"
          class="d-flex"
        >
          <ProductCard 
            :product="product"
            :is-flash-sale="true"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import CountdownTimer from './CountdownTimer.vue'
import ProductCard from './ProductCard.vue'

const store = useStore()

// Computed
const hasActiveFlashSale = computed(() => store.getters['home/hasActiveFlashSale'])
const flashSaleProducts = computed(() => store.getters['home/flashSaleProducts'])
const flashSaleEndTime = computed(() => store.getters['home/flashSaleEndTime'])

// Methods
const handleTimeout = () => {
  store.dispatch('home/fetchFlashSale')
}
</script>