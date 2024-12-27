<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="isLoading" class="d-flex justify-center my-8">
      <v-progress-circular 
        indeterminate 
        color="primary"
        size="48"
      ></v-progress-circular>
    </div>

    <template v-else-if="orderDetail">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="d-flex align-center">
          <v-icon size="32" color="primary" class="me-3">mdi-package-variant</v-icon>
          <h2 class="text-h5 font-weight-medium mb-0">Chi tiết đơn hàng {{ orderDetail.order.id }}</h2>
        </div>
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-arrow-left"
          to="/orders"
        >
          Quay lại
        </v-btn>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <!-- Order Status -->
          <v-card class="mb-4">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <div class="text-subtitle-1 font-weight-medium mb-1">Trạng thái đơn hàng</div>
                  <v-chip
                    :color="getStatusColor(orderDetail.order.status)"
                    :text-color="orderDetail.order.status === 'PENDING' ? 'black' : 'white'"
                    size="small"
                    class="font-weight-medium"
                  >
                    {{ getStatusText(orderDetail.order.status) }}
                  </v-chip>
                </div>
                <v-chip
                  :color="getPaymentMethodColor(orderDetail.order.payment_method)"
                  size="small"
                  class="font-weight-medium"
                >
                  {{ getPaymentMethodText(orderDetail.order.payment_method) }}
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                Đặt hàng lúc: {{ orderDetail.summary.created_date }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Order Items -->
          <v-card class="mb-4">
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4">
              Sản phẩm đã đặt
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  v-for="item in orderDetail.order.items"
                  :key="item.id"
                  class="py-4"
                >
                  <template v-slot:prepend>
                    <v-img
                      :src="item.product.thumbnail"
                      width="80"
                      height="80"
                      cover
                      class="rounded bg-grey-lighten-2"
                    ></v-img>
                  </template>

                  <v-list-item-title class="font-weight-medium mb-1">
                    {{ item.product.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Phân loại: {{ item.product.variant_name }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="text-right">
                      <div class="text-body-2 font-weight-medium text-primary">
                        {{ formatPrice(item.price) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Số lượng: {{ item.quantity }}
                      </div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Order Info -->
          <v-card class="mb-4">
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4">
              Thông tin nhận hàng
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Người nhận</v-list-item-title>
                  <v-list-item-subtitle>{{ orderDetail.order.name }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title>Số điện thoại</v-list-item-title>
                  <v-list-item-subtitle>{{ orderDetail.order.phone }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-map-marker</v-icon>
                  </template>
                  <v-list-item-title>Địa chỉ</v-list-item-title>
                  <v-list-item-subtitle>{{ orderDetail.order.address }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Order Summary -->
          <v-card>
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4">
              Tổng thanh toán
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-medium-emphasis">Tạm tính</span>
                <span>{{ formatPrice(orderDetail.summary.subtotal) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-medium-emphasis">Giảm giá</span>
                <span class="text-error">
                  -{{ formatPrice(orderDetail.summary.discount) }}
                </span>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="d-flex justify-space-between text-h6 font-weight-medium">
                <span>Tổng cộng</span>
                <span class="text-primary">
                  {{ formatPrice(orderDetail.summary.total) }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

const store = useStore()
const route = useRoute()

const isLoading = computed(() => store.getters['order/isLoading'])
const orderDetail = computed(() => store.getters['order/getUserOrderDetail'])

// Status helpers
const getStatusColor = (status) => {
  const colors = {
    'PENDING': 'warning',
    'CONFIRMED': 'info',
    'SHIPPING': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'error'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang giao',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy'
  }
  return texts[status] || status
}

// Payment method helpers
const getPaymentMethodColor = (method) => {
  const colors = {
    'cod': 'orange',
    'vnpay': 'blue',
    'momo': 'pink'
  }
  return colors[method] || 'grey'
}

const getPaymentMethodText = (method) => {
  const texts = {
    'cod': 'Tiền mặt',
    'vnpay': 'VNPay',
    'momo': 'Momo'
  }
  return texts[method] || method
}

// Format helpers
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// const formatDate = (dateString) => {
//   return new Date(dateString).toLocaleDateString('vi-VN', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit'
//   })
// }

// Fetch order detail on mount
onMounted(async () => {
  try {
    const orderId = route.params.id
    await store.dispatch('order/getUserOrderDetail', orderId)
  } catch (error) {
    console.error('Error fetching order detail:', error)
  }
})
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.v-list-item:last-child {
  border-bottom: none;
}
</style>