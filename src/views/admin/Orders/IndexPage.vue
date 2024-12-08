<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header -->
      <v-toolbar color="transparent" flat>
        <v-toolbar-title class="text-h6">Quản lý đơn hàng</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Filters -->
      <v-card-text>
        <v-row>
          <!-- Search -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              label="Tìm kiếm đơn hàng"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- Status Filter -->
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Trạng thái đơn hàng"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>

          <!-- Payment Method Filter -->
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.payment_method"
              :items="paymentMethodOptions"
              label="Phương thức thanh toán"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="orders"
        :loading="isLoading"
        :items-per-page="-1"
        class="order-table"
      >
        <!-- Index Column -->
        <template #[`item.index`]="{ index }">
          <div class="text-center font-weight-medium">{{ calculateIndex(index) }}</div>
        </template>

        <!-- Order ID Column -->
        <template #[`item.id`]="{ item }">
          <div class="font-weight-medium">{{ item.id }}</div>
        </template>

        <!-- Customer Info Column -->
        <template #[`item.customer_info`]="{ item }">
          <div>
            <div class="text-subtitle-1 font-weight-medium">{{ item.name }}</div>
            <div class="text-body-2 text-grey">{{ item.phone }}</div>
            <div class="text-body-2 text-grey">{{ item.address }}</div>
          </div>
        </template>

        <!-- Total Amount Column -->
        <template #[`item.total_amount`]="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatPrice(item.total_amount) }}</div>
            <div class="text-caption text-grey">
              {{ item.payment_method === 'cod' ? 'Tiền mặt' : item.payment_method.toUpperCase() }}
            </div>
          </div>
        </template>

        <!-- Status Column -->
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <!-- Created Date Column -->
        <template #[`item.created_at`]="{ item }">
          <div class="text-center text-grey">{{ formatDate(item.created_at) }}</div>
        </template>

        <!-- Actions Column -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-tooltip text="Chi tiết" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  variant="text"
                  color="info"
                  size="small"
                  @click="viewOrder(item.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Cập nhật trạng thái" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="openUpdateStatus(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Loading -->
        <template #loader>
          <v-skeleton-loader type="table-row-divider@3"></v-skeleton-loader>
        </template>

        <!-- No Data -->
        <template #no-data>
          <v-sheet class="pa-6 text-center">
            <v-icon icon="mdi-alert-circle" size="large" color="grey-darken-1" class="mb-2"></v-icon>
            <div class="text-grey-darken-1">Không có dữ liệu</div>
          </v-sheet>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <div class="d-flex justify-end pa-4">
        <v-pagination
          v-model="currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          @update:model-value="handlePageChange"
        ></v-pagination>
      </div>
    </v-card>

    <!-- Update Status Dialog -->
    <v-dialog v-model="statusDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          Cập nhật trạng thái đơn hàng
        </v-card-title>

        <v-card-text class="pa-4">
          <v-select
            v-model="newStatus"
            :items="availableStatuses"
            label="Trạng thái mới"
            variant="outlined"
            density="compact"
          ></v-select>
          
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="closeStatusDialog"
            :disabled="isUpdating"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateStatus"
            :loading="isUpdating"
            class="ml-2"
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
      location="top right"
      :timeout="2000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import debounce from 'lodash/debounce'

// Store & Router
const store = useStore()
const router = useRouter()

// Data
const search = ref('')
const statusDialog = ref(false)
const isUpdating = ref(false)
const selectedOrder = ref(null)
const newStatus = ref('')
const statusNote = ref('')
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const filters = ref({
  status: null,
  payment_method: null
})

// Constants
const statusOptions = [
  { title: 'Chờ xử lý', value: 'PENDING' },
  { title: 'Đã xác nhận', value: 'CONFIRMED' },
  { title: 'Đang giao hàng', value: 'SHIPPING' },
  { title: 'Hoàn thành', value: 'COMPLETED' },
  { title: 'Đã hủy', value: 'CANCELLED' }
]

const paymentMethodOptions = [
  { title: 'Tiền mặt', value: 'cod' },
  { title: 'VNPAY', value: 'vnpay' },
  { title: 'MOMO', value: 'momo' }
]

const headers = [
  {
    title: 'STT',
    key: 'index',
    align: 'center',
    width: '60',
    sortable: false
  },
  {
    title: 'Mã đơn hàng',
    key: 'id',
    align: 'start',
    width: '150'
  },
  {
    title: 'Thông tin khách hàng',
    key: 'customer_info',
    align: 'start',
    width: '300'
  },
  {
    title: 'Tổng tiền',
    key: 'total_amount',
    align: 'end',
    width: '150'
  },
  {
    title: 'Trạng thái',
    key: 'status',
    align: 'center',
    width: '150'
  },
  {
    title: 'Ngày tạo',
    key: 'created_at',
    align: 'center',
    width: '150'
  },
  {
    title: 'Thao tác',
    key: 'actions',
    align: 'center',
    width: '120',
    sortable: false
  }
]

// Computed
const orders = computed(() => store.getters['order/getAllOrders'])
const pagination = computed(() => store.getters['order/getPagination'])
const currentPage = ref(1)

const isLoading = computed(() => store.getters['order/isLoading'])

const availableStatuses = computed(() => {
  if (!selectedOrder.value) return []
  return statusOptions.filter(status => 
    isValidStatusTransition(selectedOrder.value.status, status.value)
  )
})

// Methods
const calculateIndex = (index) => {
  return (currentPage.value - 1) * pagination.value.perPage + index + 1
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

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
    'PENDING': 'Chờ xử lý',
    'CONFIRMED': 'Đã xác nhận',
    'SHIPPING': 'Đang giao hàng',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy'
  }
  return texts[status] || status
}

const isValidStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SHIPPING', 'CANCELLED'],
    'SHIPPING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [],
    'CANCELLED': []
  }
  return allowedTransitions[currentStatus]?.includes(newStatus)
}

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

// Navigation Methods
const viewOrder = (id) => {
  router.push({ name: 'admin-orders-detail', params: { id } })
}

// Status Update Methods
const openUpdateStatus = (order) => {
  selectedOrder.value = order
  newStatus.value = ''
  statusNote.value = ''
  statusDialog.value = true
}

const closeStatusDialog = () => {
  statusDialog.value = false
  selectedOrder.value = null
  newStatus.value = ''
  statusNote.value = ''
}

const handleUpdateStatus = async () => {
  if (!selectedOrder.value || !newStatus.value) return

  try {
    isUpdating.value = true
    await store.dispatch('order/updateOrderStatus', {
      orderId: selectedOrder.value.id,
      status: newStatus.value,
      note: statusNote.value
    })
    showMessage('Cập nhật trạng thái thành công')
    closeStatusDialog()
  } catch (error) {
    console.error('Update status error:', error)
    showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái', 'error')
  } finally {
    isUpdating.value = false
  }
}

// Filter Methods
const handleSearch = debounce(async () => {
  try {
    await store.dispatch('order/fetchOrders', {
      ...filters.value,
      search: search.value
    })
  } catch (error) {
    console.error('Search error:', error)
    showMessage('Có lỗi khi tìm kiếm', 'error')
  }
}, 300)

const handleFilterChange = async () => {
  try {
    await store.dispatch('order/fetchOrders', {
      ...filters.value,
      search: search.value
    })
  } catch (error) {
    console.error('Filter error:', error)
    showMessage('Có lỗi khi lọc dữ liệu', 'error')
  }
}

const handlePageChange = async (page) => {
  try {
    await store.dispatch('order/fetchOrders', {
      ...filters.value,
      search: search.value,
      page
    })
  } catch (error) {
    console.error('Page change error:', error)
    showMessage('Có lỗi khi chuyển trang', 'error')
  }
}

// Lifecycle Hooks
onMounted(async () => {
  try {
    await store.dispatch('order/fetchOrders')
  } catch (error) {
    console.error('Error loading initial data:', error)
    showMessage('Có lỗi khi tải dữ liệu ban đầu', 'error')
  }
})
</script>

<style scoped>
.order-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}

/* Table styling */
:deep(.v-data-table__thead) {
  background-color: rgb(var(--v-theme-background));
}

:deep(.v-data-table__thead th) {
  font-weight: 600 !important;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

:deep(.v-data-table__tbody tr:hover td) {
  background-color: rgb(var(--v-theme-surface-variant));
}

/* Make header sticky */
:deep(.v-data-table__header) {
  position: sticky;
  top: 0;
  z-index: 1;
}

/* Responsive styles */
@media (max-width: 960px) {
  .v-data-table :deep(.v-data-table__wrapper) {
    overflow-x: auto;
  }
  
  .v-data-table :deep(td), 
  .v-data-table :deep(th) {
    min-width: 100px;
  }

  .v-data-table :deep(td[data-label="Thông tin khách hàng"]) {
    min-width: 200px;
  }
}

@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.25rem !important;
  }
}
</style>
