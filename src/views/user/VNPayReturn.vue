<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="text-center pa-6">
            <v-progress-circular
              v-if="isProcessing"
              indeterminate
              color="primary"
              size="64"
            />
            
            <template v-else>
              <v-icon
                :color="paymentStatus.color"
                size="64"
                class="mb-4"
              >
                {{ paymentStatus.icon }}
              </v-icon>
              
              <h2 class="text-h5 mb-4">
                {{ paymentStatus.title }}
              </h2>
              
              <p class="mb-6">{{ paymentStatus.message }}</p>
              
              <v-btn
                :color="paymentStatus.color"
                :to="paymentStatus.buttonLink"
              >
                {{ paymentStatus.buttonText }}
              </v-btn>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useStore } from 'vuex'
  
  const route = useRoute()
  const store = useStore()
  
  const isProcessing = ref(true)
  const paymentResult = ref(null)
  
  const paymentStatus = computed(() => {
    if (!paymentResult.value) return {}
  
    if (paymentResult.value.success) {
      return {
        color: 'success',
        icon: 'mdi-check-circle',
        title: 'Thanh toán thành công',
        message: 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.',
        buttonText: 'Xem đơn hàng',
        buttonLink: '/orders'
      }
    }
  
    return {
      color: 'error',
      icon: 'mdi-close-circle',
      title: 'Thanh toán thất bại',
      message: paymentResult.value.message || 'Đã có lỗi xảy ra trong quá trình thanh toán.',
      buttonText: 'Thử lại',
      buttonLink: '/cart'
    }
  })
  
  onMounted(async () => {
    try {
      // Lấy tất cả query params từ URL
      const queryParams = route.query
      
      // Gọi API xử lý kết quả thanh toán
      const response = await store.dispatch('order/vnpayReturn', queryParams)
      paymentResult.value = response
      
      // Xóa pending order ID khỏi localStorage
      localStorage.removeItem('pending_order_id')
    } catch (error) {
      paymentResult.value = {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán'
      }
    } finally {
      isProcessing.value = false
    }
  })
  </script>