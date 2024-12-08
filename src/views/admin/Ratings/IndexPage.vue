<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header -->
      <v-toolbar color="transparent" flat>
        <v-toolbar-title class="text-h6">Quản lý đánh giá</v-toolbar-title>
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
              label="Tìm kiếm đánh giá"
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
              v-model="filters.is_approved"
              :items="approvalStatusOptions"
              label="Trạng thái phê duyệt"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>

          <!-- Rating Filter -->
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.star_rating"
              :items="ratingOptions"
              label="Số sao"
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
        :items="ratings"
        :loading="isLoading"
        :items-per-page="-1"
        class="rating-table"
      >
        <!-- Index Column -->
        <template #[`item.index`]="{ index }">
          <div class="text-center font-weight-medium">{{ calculateIndex(index) }}</div>
        </template>

        <!-- User Info Column -->
        <template #[`item.user_info`]="{ item }">
          <div>
            <div class="text-subtitle-1 font-weight-medium">{{ item.user?.name }}</div>
            <div class="text-body-2 text-grey">{{ item.user?.email }}</div>
          </div>
        </template>

        <!-- Product Info Column -->
        <template #[`item.product_info`]="{ item }">
          <div>
            <div class="text-subtitle-1 font-weight-medium">{{ item.product?.name }}</div>
            <div class="text-body-2 text-grey">Mã SP: {{ item.product?.id }}</div>
          </div>
        </template>

        <!-- Rating Column -->
        <template #[`item.star_rating`]="{ item }">
          <div class="d-flex justify-center align-center">
            <v-rating
              :model-value="item.star_rating"
              color="warning"
              density="compact"
              half-increments
              readonly
              size="small"
            ></v-rating>
          </div>
        </template>

        <!-- Status Column -->
        <template #[`item.is_approved`]="{ item }">
          <v-chip
            :color="item.is_approved ? 'success' : 'warning'"
            size="small"
          >
            {{ item.is_approved ? 'Đã duyệt' : 'Chờ duyệt' }}
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
                  @click="viewRating(item)"
                ></v-btn>
              </template>
            </v-tooltip>

            <template v-if="!item.is_approved">
              <v-tooltip text="Phê duyệt" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-check"
                    variant="text"
                    color="success"
                    size="small"
                    @click="approveRating(item.id)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Từ chối" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-close"
                    variant="text"
                    color="error"
                    size="small"
                    @click="rejectRating(item.id)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </template>
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

    <!-- Rating Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card v-if="selectedRating">
        <v-card-title class="text-h6 pa-4">
          Chi tiết đánh giá
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">Thông tin người đánh giá</div>
            <div>Tên: {{ selectedRating.user?.name }}</div>
            <div>Email: {{ selectedRating.user?.email }}</div>
          </div>

          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">Thông tin sản phẩm</div>
            <div>Tên sản phẩm: {{ selectedRating.product?.name }}</div>
            <div>Mã sản phẩm: {{ selectedRating.product?.id }}</div>
          </div>

          <div class="mb-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">Đánh giá</div>
            <v-rating
              :model-value="selectedRating.star_rating"
              color="warning"
              readonly
              class="mb-2"
            ></v-rating>
            <div>{{ selectedRating.comment }}</div>
          </div>

          <div>
            <div class="text-subtitle-1 font-weight-bold mb-2">Thông tin khác</div>
            <div>Ngày đánh giá: {{ formatDate(selectedRating.created_at) }}</div>
            <div>Trạng thái: {{ selectedRating.is_approved ? 'Đã duyệt' : 'Chờ duyệt' }}</div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="closeDetailDialog"
          >
            Đóng
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
import debounce from 'lodash/debounce'

// Store
const store = useStore()

// Data
const search = ref('')
const detailDialog = ref(false)
const selectedRating = ref(null)
const currentPage = ref(1)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const filters = ref({
  is_approved: null,
  star_rating: null
})

// Constants
const approvalStatusOptions = [
  { title: 'Đã duyệt', value: true },
  { title: 'Chờ duyệt', value: false }
]

const ratingOptions = [
  { title: '5 sao', value: 5 },
  { title: '4 sao', value: 4 },
  { title: '3 sao', value: 3 },
  { title: '2 sao', value: 2 },
  { title: '1 sao', value: 1 }
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
    title: 'Người đánh giá',
    key: 'user_info',
    align: 'start',
    width: '200'
  },
  {
    title: 'Sản phẩm',
    key: 'product_info',
    align: 'start',
    width: '200'
  },
  {
    title: 'Đánh giá',
    key: 'star_rating',
    align: 'center',
    width: '150'
  },
  {
    title: 'Trạng thái',
    key: 'is_approved',
    align: 'center',
    width: '120'
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
    width: '150',
    sortable: false
  }
]

// Computed
const ratings = computed(() => store.getters['rating/getAllRatings'])
const pagination = computed(() => store.getters['rating/getPagination'])
const isLoading = computed(() => store.getters['rating/isLoading'])

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

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

// Dialog Methods
const viewRating = (rating) => {
  selectedRating.value = rating
  detailDialog.value = true
}

const closeDetailDialog = () => {
  detailDialog.value = false
  selectedRating.value = null
}

// Rating Actions
const approveRating = async (id) => {
  try {
    await store.dispatch('rating/approveRating', id)
    showMessage('Phê duyệt đánh giá thành công')
  } catch (error) {
    console.error('Approve rating error:', error)
    showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt đánh giá', 'error')
  }
}

const rejectRating = async (id) => {
  try {
    await store.dispatch('rating/rejectRating', id)
    showMessage('Từ chối đánh giá thành công')
  } catch (error) {
    console.error('Reject rating error:', error)
    showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối đánh giá', 'error')
  }
}

// Filter Methods
const handleSearch = debounce(async () => {
  try {
    await store.dispatch('rating/getRatings', {
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
    await store.dispatch('rating/getRatings', {
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
    await store.dispatch('rating/getRatings', {
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
    await store.dispatch('rating/getRatings')
  } catch (error) {
    console.error('Error loading initial data:', error)
    showMessage('Có lỗi khi tải dữ liệu ban đầu', 'error')
  }
})
</script>

<style scoped>
.rating-table {
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

  .v-data-table :deep(td[data-label="Người đánh giá"]),
  .v-data-table :deep(td[data-label="Sản phẩm"]) {
    min-width: 200px;
  }
}

@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.25rem !important;
  }
}
</style>