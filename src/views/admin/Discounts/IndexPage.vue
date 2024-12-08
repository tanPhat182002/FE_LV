<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header Card -->
      <v-toolbar color="transparent" flat>
        <v-toolbar-title class="text-h6">
          Danh sách mã giảm giá
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :to="{ name: 'admin-discounts-create' }"
          prepend-icon="mdi-plus"
        >
          Thêm mã giảm giá
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="discounts"
        :loading="isLoading"
        class="discount-table"
      >
        <!-- Index Column -->
        <template #[`item.index`]="{ index }">
          <div class="text-center font-weight-medium">{{ index + 1 }}</div>
        </template>

        <!-- Code Column -->
        <template #[`item.code`]="{ item }">
          <div>
            <span class="text-subtitle-1 font-weight-medium">{{ item.code }}</span>
            <div class="mt-1 text-grey">
              {{ formatDiscountValue(item) }} | Tối thiểu: {{ formatCurrency(item.min_order_value) }}
            </div>
          </div>
        </template>

        <!-- Discount Column -->
        <template #[`item.discount`]="{ item }">
          <v-chip
            :color="item.discount_type === 'percentage' ? 'primary' : 'success'"
            size="small"
          >
            {{ formatDiscountValue(item) }}
          </v-chip>
        </template>

        <!-- Min Order Column -->
        <template #[`item.min_order`]="{ item }">
          <div class="text-center">
            {{ formatCurrency(item.min_order_value) }}
          </div>
        </template>

        <!-- Usage Column -->
        <template #[`item.usage`]="{ item }">
          <div class="text-center">
            {{ item.used_count }}/{{ item.usage_limit || '∞' }}
          </div>
        </template>

        <!-- Date Range Column -->
        <template #[`item.date_range`]="{ item }">
          <div class="text-center">
            <div>{{ formatDate(item.start_date) }}</div>
            <v-icon icon="mdi-arrow-down" size="small" class="my-1"></v-icon>
            <div>{{ formatDate(item.end_date) }}</div>
          </div>
        </template>

        <!-- Status Column -->
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-tooltip text="Chỉnh sửa" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="editDiscount(item.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Xóa" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="confirmDelete(item)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip :text="item.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'" location="top">
              <template #activator="{ props }">
                <v-switch
                  v-bind="props"
                  v-model="item.is_active"
                  color="success"
                  hide-details
                  density="compact"
                  @change="toggleStatus(item)"
                ></v-switch>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Loading state -->
        <template #loader>
          <v-skeleton-loader type="table-row-divider@3"></v-skeleton-loader>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <v-sheet class="pa-6 text-center">
            <v-icon icon="mdi-alert-circle" size="large" color="grey-darken-1" class="mb-2"></v-icon>
            <div class="text-grey-darken-1">Không có dữ liệu</div>
          </v-sheet>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <v-icon icon="mdi-alert" color="error" class="mr-2"></v-icon>
          Xác nhận xóa
        </v-card-title>

        <v-card-text class="pa-4">
          Bạn có chắc chắn muốn xóa mã giảm giá
          <strong>{{ selectedDiscount?.code }}</strong>?
          <br />
          Hành động này không thể hoàn tác.
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="closeDeleteDialog"
            :disabled="isDeleting"
          >
            Hủy
          </v-btn>
          <v-btn
            color="error"
            @click="handleDelete"
            :loading="isDeleting"
            class="ml-2"
          >
            Xóa
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

const store = useStore()
const router = useRouter()

// Data
const deleteDialog = ref(false)
const isDeleting = ref(false)
const selectedDiscount = ref(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Table headers
const headers = [
  {
    title: 'STT',
    key: 'index',
    align: 'center',
    width: '60',
    sortable: false
  },
  {
    title: 'Mã giảm giá',
    key: 'code',
    align: 'start',
    width: '250'
  },
  {
    title: 'Giảm giá',
    key: 'discount',
    align: 'center',
    width: '120'
  },
  {
    title: 'Tối thiểu',
    key: 'min_order',
    align: 'center',
    width: '150'
  },
  {
    title: 'Lượt sử dụng',
    key: 'usage',
    align: 'center',
    width: '120'
  },
  {
    title: 'Thời gian',
    key: 'date_range',
    align: 'center',
    width: '200'
  },
  {
    title: 'Trạng thái',
    key: 'status',
    align: 'center',
    width: '120'
  },
  {
    title: 'Thao tác',
    key: 'actions',
    align: 'center',
    width: '160',
    sortable: false
  }
]

// Computed
const discounts = computed(() => store.getters['discounts/discounts'])
const isLoading = computed(() => store.getters['discounts/isLoading'])

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(dateString))
}

const formatCurrency = (value) => {
  if (typeof value === 'string') {
    value = value.replace(/,/g, '')
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const formatDiscountValue = (discount) => {
  if (discount.discount_type === 'percentage') {
    return `Giảm ${discount.discount_value}%`
  }
  return `Giảm ${formatCurrency(discount.discount_value)}`
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Đang diễn ra': return 'success'
    case 'Sắp diễn ra': return 'warning'
    case 'Đã kết thúc': return 'error'
    default: return 'grey'
  }
}

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const editDiscount = (id) => {
  router.push({
    name: 'admin-discounts-edit',
    params: { id }
  })
}

const toggleStatus = async (discount) => {
  try {
    await store.dispatch('discounts/toggleDiscountStatus', discount.id)
    showMessage('Cập nhật trạng thái thành công')
  } catch (error) {
    console.error('Toggle status failed:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái',
      'error'
    )
    discount.is_active = !discount.is_active
  }
}

const confirmDelete = (discount) => {
  selectedDiscount.value = discount
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  selectedDiscount.value = null
}

const handleDelete = async () => {
  if (!selectedDiscount.value) return

  try {
    isDeleting.value = true
    await store.dispatch('discounts/deleteDiscount', selectedDiscount.value.id)
    showMessage('Xóa mã giảm giá thành công')
    closeDeleteDialog()
  } catch (error) {
    console.error('Delete failed:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi xóa mã giảm giá',
      'error'
    )
  } finally {
    isDeleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  store.dispatch('discounts/fetchDiscounts')
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
