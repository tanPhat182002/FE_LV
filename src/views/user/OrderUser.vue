<template>
  <!-- Thêm snackbar lên đầu trang -->
  <v-snackbar
    v-model="showSnackbar"
    :color="snackbarColor"
    location="top"
    :timeout="3000"
  >
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="showSnackbar = false"
      >
        Đóng
      </v-btn>
    </template>
  </v-snackbar>

  <v-container>
    <!-- Header -->
    <h2 class="text-h5 font-weight-medium mb-6">Đơn hàng của tôi</h2>

    <!-- Order Tabs -->
    <v-tabs
      v-model="activeTab"
      color="primary"
      class="mb-6"
    >
      <v-tab value="all">Tất cả đơn</v-tab>
      <v-tab value="PENDING">Chờ thanh toán</v-tab>
      <v-tab value="CONFIRMED">Đang xử lý</v-tab>
      <v-tab value="SHIPPING">Đang vận chuyển</v-tab>
      <v-tab value="COMPLETED">Đã giao</v-tab>
      <v-tab value="CANCELLED">Đã hủy</v-tab>
    </v-tabs>

    <!-- Search Bar -->
    <v-card class="mb-6" variant="flat">
      <v-card-text>
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="Tìm đơn hàng theo Mã đơn hàng, Nhà bán hoặc Tên sản phẩm"
          variant="outlined"
          density="comfortable"
          hide-details
          class="search-field"
        >
          <template v-slot:append>
            <v-btn
              color="primary"
              @click="handleSearch"
            >
              Tìm đơn hàng
            </v-btn>
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>

    <!-- Loading state -->
    <div v-if="isLoading" class="d-flex justify-center my-8">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
    </div>

    <!-- Orders list -->
    <template v-else>
      <template v-if="filteredOrders.length > 0">
        <v-card v-for="order in filteredOrders" 
          :key="order.id" 
          class="mb-4 rounded-lg"
        >
          <v-card-text class="pa-4">
            <!-- Order header -->
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="d-flex align-center">
                <v-icon color="primary" class="me-2">mdi-store</v-icon>
               
                <v-chip
                  :color="getStatusColor(order.status)"
                  :text-color="order.status === 'PENDING' ? 'black' : 'white'"
                  size="small"
                  class="ms-4"
                >
                  {{ getStatusText(order.status) }}
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                Đặt hàng ngày {{ formatDate(order.created_at) }}
              </div>
            </div>

            <!-- Order items -->
            <div v-for="item in order.orderItems" :key="item.id" class="d-flex py-2">
              <div class="image-container">
                <v-img
                  :src="item.image_url"
                  width="100"
                  height="100"
                  cover
                  class="product-image"
                  :lazy-src="item.image_url"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular
                        indeterminate
                        color="grey-lighten-2"
                      ></v-progress-circular>
                    </div>
                  </template>
                </v-img>
              </div>
              <div class="ms-4 flex-grow-1">
                <div class="d-flex justify-space-between">
                  <div>
                    <div class="text-body-1 font-weight-medium mb-1">
                      {{ item.product.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Phân loại: {{ item.product.variant_name || 'Mặc định' }}
                    </div>
                    <div class="text-caption">x{{ item.quantity }}</div>
                    <div v-if="order.status === 'COMPLETED'" class="mt-2">
                      <v-btn
                        v-if="!item.hasRating"
                        color="primary"
                        variant="text"
                        density="comfortable"
                        size="small"
                        @click="openRatingDialog(order, item)"
                      >
                        <v-icon start>mdi-star</v-icon>
                        Đánh giá
                      </v-btn>
                      <v-chip
                        v-else
                        color="success"
                        size="small"
                        variant="tonal"
                      >
                        <v-icon start size="small">mdi-check</v-icon>
                        Đã đánh giá
                      </v-chip>
                    </div>
                  </div>
                  <div class="text-primary font-weight-medium">
                    {{ formatPrice(item.price) }}
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Order footer -->
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <v-icon size="20" color="grey" class="me-2">mdi-cash</v-icon>
                <span class="text-body-2">
                  {{ getPaymentMethodText(order.payment_method) }}
                </span>
              </div>
              <div class="d-flex align-center">
                <span class="text-body-2 me-4">
                  Tổng tiền: <span class="text-primary font-weight-medium">{{ formatPrice(order.total_amount) }}</span>
                </span>
                <v-btn
                  :to="`/orders/${order.id}`"
                  color="primary"
                  variant="tonal"
                >
                  Xem chi tiết
                </v-btn>
                <v-btn
                  v-if="order.status === 'PENDING'"
                  color="error"
                  variant="text"
                  class="ms-2"
                  @click="confirmCancelOrder(order)"
                >
                  Hủy đơn
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Pagination -->
        <div class="d-flex justify-center py-4">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            rounded="circle"
          ></v-pagination>
        </div>
      </template>

      <!-- Empty state -->
      <v-card v-else class="pa-12 text-center rounded-lg">
        <v-img
          src="/images/empty-order.png"
          class="mx-auto mb-6"
          max-width="200"
          contain
        ></v-img>
        <h3 class="text-h6 font-weight-medium mb-2">Chưa có đơn hàng nào</h3>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Hãy khám phá các sản phẩm và đặt hàng ngay!
        </p>
        <v-btn
          color="primary"
          to="/products"
          prepend-icon="mdi-shopping"
          size="large"
        >
          Mua sắm ngay
        </v-btn>
      </v-card>
    </template>

    <!-- Cancel Order Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          Xác nhận hủy đơn hàng
        </v-card-title>
        <v-card-text class="pa-4">
          <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
          <p class="text-caption mt-2 text-grey">
            Lưu ý: Sau khi hủy đơn hàng, bạn sẽ cần đặt hàng lại nếu muốn mua sản phẩm.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showCancelDialog = false"
          >
            Không
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            :loading="isCancelling"
            @click="handleCancelOrder"
          >
            Xác nhận hủy
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Thêm Rating Dialog -->
    <v-dialog v-model="showRatingDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          Đánh giá sản phẩm
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="d-flex align-center mb-4">
            <v-img
              :src="selectedItem?.image_url"
              width="80"
              height="80"
              cover
              class="rounded-lg"
            ></v-img>
            <div class="ms-4">
              <div class="text-body-1 font-weight-medium">
                {{ selectedItem?.product.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Phân loại: {{ selectedItem?.product.variant_name || 'Mặc định' }}
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-body-2 mb-2">Đánh giá của bạn</div>
            <v-rating
              v-model="ratingForm.star_rating"
              color="warning"
              hover
              :half-increments="false"
            ></v-rating>
          </div>

          <v-textarea
            v-model="ratingForm.comment"
            label="Nhận xét của bạn"
            placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này"
            variant="outlined"
            rows="4"
            counter="500"
            :rules="[v => !!v || 'Vui lòng nhập nhận xét']"
          ></v-textarea>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeRatingDialog"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            :loading="isSubmittingRating"
            @click="submitRating"
          >
            Gửi đánh giá
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const activeTab = ref('all')
const searchQuery = ref('')
const showCancelDialog = ref(false)
const isCancelling = ref(false)
const selectedOrder = ref(null)
const selectedItem = ref(null)
const isSubmittingRating = ref(false)
const ratingForm = ref({
  star_rating: 5,
  comment: ''
})

// Snackbar state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const isLoading = computed(() => store.getters['order/isLoading'])
const orders = computed(() => store.getters['order/getUserOrders']?.data || [])

// Filter orders based on active tab and search query
const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filter by status
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(order => order.status === activeTab.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(query) ||
      order.orderItems.some(item => 
        item.product.name.toLowerCase().includes(query)
      )
    )
  }

  return filtered
})

// Pagination
const pagination = computed(() => {
  const data = store.getters['order/getUserOrders']
  if (!data) return { currentPage: 1, totalPages: 1 }
  return {
    currentPage: data.current_page,
    totalPages: data.last_page,
    total: data.total,
    perPage: data.per_page
  }
})

const totalPages = computed(() => pagination.value.totalPages)
const currentPage = computed({
  get: () => pagination.value.currentPage,
  set: (value) => handlePageChange(value)
})

// Methods
const handleSearch = () => {
  // Implement search logic here
  console.log('Searching for:', searchQuery.value)
}

const handlePageChange = async (page) => {
  try {
    await store.dispatch('order/getUserOrders', { 
      page,
      status: activeTab.value === 'all' ? null : activeTab.value,
      search: searchQuery.value || null
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

const confirmCancelOrder = (order) => {
  selectedOrder.value = order
  showCancelDialog.value = true
}

const handleCancelOrder = async () => {
  if (!selectedOrder.value) return

  try {
    isCancelling.value = true
    const result = await store.dispatch('order/cancelUserOrder', selectedOrder.value.id)
    
    if (result.success) {
      // Đóng dialog
      showCancelDialog.value = false
      
      // Refresh danh sách đơn hàng
      await store.dispatch('order/getUserOrders', {
        status: activeTab.value === 'all' ? null : activeTab.value,
        search: searchQuery.value || null
      })
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
  } finally {
    isCancelling.value = false
    selectedOrder.value = null
  }
}

// Watch for tab changes
watch(activeTab, async (newValue) => {
  try {
    await store.dispatch('order/getUserOrders', {
      status: newValue === 'all' ? null : newValue,
      search: searchQuery.value || null
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
})

// Helpers
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

const getPaymentMethodText = (method) => {
  const texts = {
    'cod': 'Thanh toán khi nhận hàng',
    'vnpay': 'Thanh toán qua VNPay',
    'momo': 'Thanh toán qua Momo'
  }
  return texts[method] || method
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch initial data
onMounted(async () => {
  try {
    await store.dispatch('order/getUserOrders')
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
})

// Rating methods
const showRatingDialog = ref(false)

const openRatingDialog = (order, item) => {
  selectedOrder.value = order
  selectedItem.value = item
  ratingForm.value = {
    star_rating: 5,
    comment: ''
  }
  showRatingDialog.value = true
}

const closeRatingDialog = () => {
  showRatingDialog.value = false
  selectedOrder.value = null
  selectedItem.value = null
  ratingForm.value = {
    star_rating: 5,
    comment: ''
  }
}

const submitRating = async () => {
  if (!ratingForm.value.comment) {
    snackbarText.value = 'Vui lòng nhập nhận xét'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    return
  }

  try {
    isSubmittingRating.value = true
    
    const response = await store.dispatch('rating/createRating', {
      order_id: selectedOrder.value.id,
      product_id: selectedItem.value.product.id,
      star_rating: ratingForm.value.star_rating,
      comment: ratingForm.value.comment
    })

    // Hiển thị thông báo thành công từ response
    snackbarText.value = response.message || 'Gửi đánh giá thành công'
    snackbarColor.value = 'success'
    showSnackbar.value = true

    // Đóng dialog
    closeRatingDialog()

    // Cập nhật trạng thái hasRating của item
    if (selectedItem.value) {
      selectedItem.value.hasRating = true
    }

    // Refresh danh sách đơn hàng để cập nhật trạng thái đánh giá
    await store.dispatch('order/getUserOrders', {
      status: activeTab.value === 'all' ? null : activeTab.value,
      search: searchQuery.value || null
    })

  } catch (error) {
    console.error('Error submitting rating:', error)
    snackbarText.value = error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    isSubmittingRating.value = false
  }
}
</script>

<style scoped>
.search-field :deep(.v-field__append-inner) {
  padding-inline-start: 0;
}

.image-container {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 16px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.v-rating {
  display: inline-flex;
}
</style>