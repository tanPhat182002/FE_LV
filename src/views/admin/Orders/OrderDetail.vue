<template>
  <v-card>
    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>

    <!-- Header -->
    <v-card-title class="d-flex align-center">
      Chi tiết đơn hàng
      <v-spacer />
      <v-btn
        color="primary"
        @click="openUpdateStatus"
        prepend-icon="mdi-pencil"
        :loading="isUpdating"
        :disabled="!canUpdateStatus"
      >
        Cập nhật trạng thái
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Order Info -->
      <v-card class="mb-4">
        <v-card-title>Thông tin đơn hàng</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-pound</v-icon>
                </template>
                <v-list-item-title>Mã đơn hàng</v-list-item-title>
                <v-list-item-subtitle>{{ order?.order?.id || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Ngày đặt hàng</v-list-item-title>
                <v-list-item-subtitle>{{ order?.summary?.created_date }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :color="getStatusColor(order?.order?.status)">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>Trạng thái</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="getStatusColor(order?.order?.status)"
                    size="small"
                  >
                    {{ getStatusText(order?.order?.status) }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-cash</v-icon>
                </template>
                <v-list-item-title>Phương thức thanh toán</v-list-item-title>
                <v-list-item-subtitle>
                  {{ getPaymentMethodText(order?.order?.payment_method) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Customer Info -->
      <v-card class="mb-4">
        <v-card-title>Thông tin khách hàng</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account</v-icon>
                </template>
                <v-list-item-title>Tên khách hàng</v-list-item-title>
                <v-list-item-subtitle>{{ order?.order?.name }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-phone</v-icon>
                </template>
                <v-list-item-title>Số điện thoại</v-list-item-title>
                <v-list-item-subtitle>{{ order?.order?.phone }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title>Địa chỉ giao hàng</v-list-item-title>
                <v-list-item-subtitle>{{ order?.order?.address }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Order Items -->
      <v-card class="mb-4">
        <v-card-title>Chi tiết sản phẩm</v-card-title>
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th class="text-center">Số lượng</th>
                <th class="text-end">Đơn giá</th>
                <th class="text-end">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order?.order?.items" :key="item.id">
                <td>
                  <div class="d-flex align-center gap-4">
                    <v-img
                      :src="item.product.thumbnail"
                      :lazy-src="item.product.thumbnail"
                      width="100"
                      height="100"
                      cover
                      class="bg-grey-lighten-2 rounded-lg"
                    >
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-progress-circular
                            color="grey-lighten-4"
                            indeterminate
                          ></v-progress-circular>
                        </div>
                      </template>
                    </v-img>
                    <div>
                      <div class="text-subtitle-1 font-weight-medium">{{ item.product.name }}</div>
                      <div class="text-caption text-grey" v-if="item.product.variant_name">
                        Phân loại: {{ item.product.variant_name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-end">{{ formatPrice(item.price) }}</td>
                <td class="text-end">{{ formatPrice(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end font-weight-bold">Tổng tiền hàng:</td>
                <td class="text-end">{{ formatPrice(order?.summary?.subtotal) }}</td>
              </tr>
              <tr v-if="order?.summary?.discount > 0">
                <td colspan="3" class="text-end font-weight-bold">Giảm giá:</td>
                <td class="text-end">-{{ formatPrice(order?.summary?.discount) }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end font-weight-bold">Tổng thanh toán:</td>
                <td class="text-end font-weight-bold">{{ formatPrice(order?.summary?.total) }}</td>
              </tr>
            </tfoot>
          </v-table>
        </v-card-text>
      </v-card>
    </v-card-text>

    <!-- Update Status Dialog -->
    <v-dialog v-model="statusDialog" max-width="500">
      <v-card>
        <v-card-title>Cập nhật trạng thái đơn hàng</v-card-title>
        <v-card-text>
          <v-select
            v-model="newStatus"
            :items="availableStatuses"
            label="Trạng thái mới"
            item-title="title"
            item-value="value"
            variant="outlined"
            class="mb-4"
          ></v-select>
          <v-textarea
            v-model="statusNote"
            label="Ghi chú"
            variant="outlined"
            rows="3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeStatusDialog"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateStatus"
            :loading="isUpdating"
            :disabled="!newStatus"
          >
            Cập nhật
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()

// State
const loading = ref(false)
const order = ref(null)
const statusDialog = ref(false)
const newStatus = ref('')
const statusNote = ref('')
const isUpdating = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const canUpdateStatus = computed(() => {
  const status = order.value?.order?.status?.toUpperCase()
  return status !== 'COMPLETED' && status !== 'CANCELLED'
})

const availableStatuses = computed(() => {
  if (!order.value?.order) return []
  return getAvailableStatuses(order.value.order.status?.toUpperCase())
})

// Helper Functions
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

const getStatusColor = (status) => {
  const colors = {
    'PENDING': 'warning',
    'PROCESSING': 'info',
    'CONFIRMED': 'info',
    'SHIPPING': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'error'
  }
  return colors[status?.toUpperCase()] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': 'Chờ xác nhận',
    'PROCESSING': 'Đang xử lý',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang giao hàng',
    'COMPLETED': 'Đã hoàn thành',
    'CANCELLED': 'Đã hủy'
  }
  return texts[status?.toUpperCase()] || status
}

const getPaymentMethodText = (method) => {
  const texts = {
    'cod': 'Tiền mặt khi nhận hàng',
    'vnpay': 'VNPay',
    'momo': 'Ví MoMo'
  }
  return texts[method] || method
}

const getAvailableStatuses = (currentStatus) => {
  const allowedTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'PROCESSING': ['SHIPPING', 'CANCELLED'],
    'CONFIRMED': ['SHIPPING', 'CANCELLED'],
    'SHIPPING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [],
    'CANCELLED': []
  }

  const statusOptions = [
    { title: 'Đã xác nhận', value: 'CONFIRMED' },
    { title: 'Đang giao hàng', value: 'SHIPPING' },
    { title: 'Đã hoàn thành', value: 'COMPLETED' },
    { title: 'Đã hủy', value: 'CANCELLED' }
  ]

  return statusOptions.filter(option => 
    allowedTransitions[currentStatus]?.includes(option.value)
  )
}

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

// Methods
const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const response = await store.dispatch('order/fetchOrderDetail', route.params.id)
    if (!response?.success) {
      throw new Error('Không thể tải thông tin đơn hàng')
    }
    order.value = response.data
  } catch (error) {
    console.error('Error loading order:', error)
    showMessage('Có lỗi khi tải thông tin đơn hàng', 'error')
  } finally {
    loading.value = false
  }
}

const openUpdateStatus = () => {
  newStatus.value = ''
  statusNote.value = ''
  statusDialog.value = true
}

const closeStatusDialog = () => {
  statusDialog.value = false
  newStatus.value = ''
  statusNote.value = ''
}

const handleUpdateStatus = async () => {
  if (!newStatus.value) return

  try {
    isUpdating.value = true
    await store.dispatch('order/updateOrderStatus', {
      orderId: order.value.order.id,
      status: newStatus.value,
      note: statusNote.value
    })
    showMessage('Cập nhật trạng thái thành công')
    closeStatusDialog()
    await fetchOrderDetail()
  } catch (error) {
    console.error('Update status error:', error)
    showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái', 'error')
  } finally {
    isUpdating.value = false
  }
}

// Initialize
onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.rounded-lg {
 border-radius: 12px;
}

.gap-4 {
  gap: 16px;
}

.bg-grey-lighten-2 {
  background-color: rgb(245, 245, 245);
}
</style>
