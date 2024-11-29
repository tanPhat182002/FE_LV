<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header -->
      <v-toolbar color="transparent" flat>
        <v-toolbar-title class="text-h6">Quản lý khuyến mãi</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :to="{ name: 'admin-promotions-create' }"
          prepend-icon="mdi-plus"
        >
          Thêm khuyến mãi
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="promotions"
        :loading="isLoading"
        class="promotion-table"
      >
        <!-- Index Column -->
        <template #[`item.index`]="{ index }">
          <div class="text-center font-weight-medium">{{ index + 1 }}</div>
        </template>

        <!-- Name Column -->
        <template #[`item.name`]="{ item }">
          <div>
            <span class="text-subtitle-1 font-weight-medium">{{ item.name }}</span>
            <div class="mt-1 text-body-2 text-grey">{{ item.description }}</div>
          </div>
        </template>

        <!-- Discount Column -->
        <template #[`item.discount`]="{ item }">
          <v-chip
            :color="item.discount_type === 'percentage' ? 'primary' : 'success'"
            size="small"
          >
            {{ formatDiscount(item.discount_type, item.discount_value) }}
          </v-chip>
        </template>

        <!-- Date Range Column -->
        <template #[`item.date_range`]="{ item }">
          <div class="text-center">
            <div>{{ formatDate(item.start_date) }}</div>
            <v-icon icon="mdi-arrow-down" size="small" class="my-1"></v-icon>
            <div>{{ formatDate(item.end_date) }}</div>
          </div>
        </template>

        <!-- Products Column -->
        <template #[`item.products`]="{ item }">
          <div class="products-wrap">
            <v-chip
              v-for="product in item.products"
              :key="product.id"
              size="small"
              class="ma-1"
            >
              {{ product.name }}
            </v-chip>
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
            <!-- <v-tooltip text="Chi tiết" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  variant="text"
                  color="info"
                  size="small"
                  @click="viewPromotion(item.id)"
                ></v-btn>
              </template>
            </v-tooltip> -->

            <v-tooltip text="Chỉnh sửa" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="editPromotion(item.id)"
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
    </v-card>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <v-icon icon="mdi-alert" color="error" class="mr-2"></v-icon>
          Xác nhận xóa
        </v-card-title>

        <v-card-text class="pa-4">
          Bạn có chắc chắn muốn xóa khuyến mãi
          <strong>{{ selectedPromotion?.name }}</strong>?
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

// Store & Router
const store = useStore()
const router = useRouter()

// Data
const deleteDialog = ref(false)
const isDeleting = ref(false)
const selectedPromotion = ref(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Constants
const headers = [
  {
    title: 'STT',
    key: 'index',
    align: 'center',
    width: '60',
    sortable: false
  },
  {
    title: 'Tên khuyến mãi',
    key: 'name',
    align: 'start',
    width: '300'
  },
  {
    title: 'Giảm giá',
    key: 'discount',
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
    title: 'Sản phẩm áp dụng',
    key: 'products',
    align: 'start',
    sortable: false
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
const promotions = computed(() => store.getters['promotions/promotions'])
const isLoading = computed(() => store.getters['promotions/isLoading'])

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(dateString))
}

const formatDiscount = (type, value) => {
  return type === 'percentage' 
    ? `Giảm ${value}%`
    : `Giảm ${new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value)}`
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Đang diễn ra': return 'success'
    case 'Sắp diễn ra': return 'warning'
    case 'Đã kết thúc': return 'error'
    default: return 'grey'
  }
}

const toggleStatus = async (item) => {
  try {
    await store.dispatch('promotions/updatePromotionStatus', {
      id: item.id,
      isActive: item.is_active
    })
    snackbar.value = {
      show: true,
      color: 'success',
      text: `Đã ${item.is_active ? 'kích hoạt' : 'vô hiệu hóa'} khuyến mãi thành công`
    }
  } catch (error) {
    // Revert the switch state if API call fails
    item.is_active = !item.is_active
    snackbar.value = {
      show: true,
      color: 'error',
      text: error.response?.data?.message || 'Không thể kích hoạt khuyến mãi đã hết hạn'
    }
  }
}

const confirmDelete = (promotion) => {
  selectedPromotion.value = promotion
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  selectedPromotion.value = null
}

const handleDelete = async () => {
  if (!selectedPromotion.value) return

  try {
    isDeleting.value = true
    await store.dispatch('promotions/deletePromotion', selectedPromotion.value.id)
    
    snackbar.value = {
      show: true,
      color: 'success',
      text: 'Xóa khuyến mãi thành công'
    }
    closeDeleteDialog()
    
  } catch (error) {
    console.error('Delete error:', error)
    snackbar.value = {
      show: true,
      color: 'error',
      text: error.response?.data?.message || 'Có lỗi xảy ra khi xóa khuyến mãi'
    }
  } finally {
    isDeleting.value = false
  }
}

// const viewPromotion = (id) => {
//   router.push({ name: 'admin-promotions-view', params: { id } })
// }

const editPromotion = (id) => {
  router.push({ name: 'admin-promotions-edit', params: { id } })
}

// Lifecycle
onMounted(() => {
  store.dispatch('promotions/fetchPromotions')
})
</script>