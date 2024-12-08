<template>
  <v-container fluid class="pa-0">
  
      <!-- Flash Sale Section -->
      <FlashSale />

    <!-- Featured Products Section -->  
    <FeaturedProducts />

    <!-- Loading -->
    <LoadingOverlay :loading="isLoading" />

    <!-- Error Snackbar -->
    <ErrorSnackbar
      v-model="snackbar.show"
      :text="snackbar.text"
      :color="snackbar.color"
      @close="snackbar.show = false"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

import FlashSale from '@/components/home/FlashSale.vue'
import FeaturedProducts from '@/components/home/FeaturedProducts.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import ErrorSnackbar from '@/components/common/ErrorSnackbar.vue'

const store = useStore()

// State
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const isLoading = computed(() => 
  store.state.home.productsLoading || 
  store.state.home.flashSale.loading
)

// Methods
const showError = (text) => {
  snackbar.value = {
    show: true,
    text,
    color: 'error'
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch('home/fetchProducts'),
      store.dispatch('home/fetchFlashSale')
    ])
  } catch (error) {
    console.error('Error loading home page data:', error)
    showError('Có lỗi khi tải dữ liệu')
  }
})
</script>