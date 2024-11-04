<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header -->
      <v-toolbar color="transparent" flat>
        <v-toolbar-title class="text-h6">Quản lý sản phẩm</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :to="{ name: 'admin-products-create' }"
          prepend-icon="mdi-plus"
        >
          Thêm sản phẩm
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Filters -->
      <v-card-text>
        <v-row>
          <!-- Search -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              label="Tìm kiếm sản phẩm"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- Brand Filter -->
          <v-col cols="12" sm="3">
            <v-select
              v-model="filters.brand_id"
              :items="brands"
              item-title="name"
              item-value="id"
              label="Thương hiệu"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>

          <!-- Category Filter -->
          <v-col cols="12" sm="3">
            <v-select
              v-model="filters.category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Danh mục"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>

          <!-- Status Filter -->
          <v-col cols="12" sm="2">
            <v-select
              v-model="filters.is_active"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              label="Trạng thái"
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
        :items="products"
        :loading="isLoading"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        :items-length="totalItems"
        @update:page="handlePageChange"
        class="product-table"
      >
        <!-- Index Column -->
        <template #[`item.index`]="{ index }">
          <div class="text-center font-weight-medium">{{ calculateIndex(index) }}</div>
        </template>

        <!-- Image Column -->
        <template #[`item.image_url`]="{ item }">
          <div class="d-flex align-center justify-center pa-2">
            <v-img
              :src="item.image_url"
              :alt="item.name"
              width="60"
              height="60"
              cover
              class="bg-grey-lighten-2 rounded-lg"
            >
              <template #error>
                <v-avatar color="grey-lighten-2" size="60">
                  <v-icon icon="mdi-image-off" color="grey-darken-2"></v-icon>
                </v-avatar>
              </template>
            </v-img>
          </div>
        </template>

        <!-- Name Column -->
        <template #[`item.name`]="{ item }">
          <div>
            <span class="text-subtitle-1 font-weight-medium">{{ item.name }}</span>
            <div class="mt-1 text-body-2 text-grey">
              {{ item.category?.name }} | {{ item.brand?.name }}
            </div>
            <div v-if="item.promotion" class="mt-1">
              <v-chip
                size="x-small"
                color="error"
                label
              >
                Giảm giá {{ item.promotion.discount_type === 'percentage' ? item.promotion.discount_value + '%' : formatPrice(item.promotion.discount_value) }}
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Price Column -->
        <template #[`item.price`]="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatPrice(item.price) }}</div>
          </div>
        </template>

        <!-- Variants Column -->
        <template #[`item.variants`]="{ item }">
          <div class="variants-wrap">
            <div 
              v-for="variant in item.variants" 
              :key="variant.id"
              class="variant-item"
            >
              <v-chip
                size="small"
                :color="getVariantColor(variant.stock_quantity)"
                variant="outlined"
                class="mb-1"
              >
                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <span v-bind="props">
                      {{ variant.color.name }} / {{ variant.size.name }}
                      <span :class="getStockClass(variant.stock_quantity)">
                        ({{ variant.stock_quantity }})
                      </span>
                    </span>
                  </template>
                  <span>Tồn kho: {{ variant.stock_quantity }}</span>
                </v-tooltip>
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Status Column -->
        <template #[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            size="small"
          >
            {{ item.is_active ? 'Đang bán' : 'Ngừng bán' }}
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
                  @click="viewProduct(item.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Chỉnh sửa" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="editProduct(item.id)"
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
          Bạn có chắc chắn muốn xóa sản phẩm
          <strong>{{ selectedProduct?.name }}</strong>?
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
import debounce from 'lodash/debounce'

// Store & Router
const store = useStore()
const router = useRouter()

// Data
const search = ref('')
const deleteDialog = ref(false)
const isDeleting = ref(false)
const selectedProduct = ref(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const filters = ref({
  brand_id: null,
  category_id: null,
  is_active: null
})

// Constants
const statusOptions = [
  { text: 'Đang bán', value: true },
  { text: 'Ngừng bán', value: false }
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
    title: 'Hình ảnh',
    key: 'image_url',
    align: 'center',
    width: '100',
    sortable: false
  },
  {
    title: 'Tên sản phẩm',
    key: 'name',
    align: 'start',
    width: '300'
  },
  {
    title: 'Giá bán',
    key: 'price',
    align: 'end',
    width: '150'
  },
  {
    title: 'Biến thể',
    key: 'variants',
    align: 'start',
    sortable: false,
    width: '350'
  },
  {
    title: 'Trạng thái',
    key: 'is_active',
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
    width: '120',
    sortable: false
  }
]

// Computed
const products = computed(() => store.getters['products/products'])
const brands = computed(() => store.state.brands.brands)
const categories = computed(() => store.state.categories.categories)
const isLoading = computed(() => store.getters['products/isLoading'])
const currentPage = computed(() => store.state.products.pagination.currentPage)
const itemsPerPage = computed(() => store.state.products.pagination.itemsPerPage)
const totalItems = computed(() => store.state.products.pagination.totalItems)

// Methods
const calculateIndex = (index) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1
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

const getVariantColor = (stock) => {
  if (stock === 0) return 'error'
  if (stock <= 10) return 'warning'
  return 'success'
}

const getStockClass = (stock) => {
  if (stock === 0) return 'text-error'
  if (stock <= 10) return 'text-warning'
  return 'text-success'
}

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

// Navigation Methods
const viewProduct = (id) => {
  router.push({ name: 'admin-products-detail', params: { id } })
}

const editProduct = (id) => {
  router.push({ name: 'admin-products-edit', params: { id } })
}

// Delete Methods
const confirmDelete = (product) => {
  selectedProduct.value = product
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  selectedProduct.value = null
}

const handleDelete = async () => {
  if (!selectedProduct.value) return

  try {
    isDeleting.value = true
    await store.dispatch('products/deleteProduct', selectedProduct.value.id)
    showMessage('Xóa sản phẩm thành công')
    closeDeleteDialog()
  } catch (error) {
    console.error('Delete error:', error)
    showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm', 'error')
  } finally {
    isDeleting.value = false
  }
}

// Filter Methods
const handleSearch = debounce(async () => {
  try {
    await store.dispatch('products/updateFilters', {
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
    await store.dispatch('products/updateFilters', filters.value)
  } catch (error) {
    console.error('Filter error:', error)
    showMessage('Có lỗi khi lọc dữ liệu', 'error')
  }
}

const handlePageChange = async (page) => {
  try {
    await store.dispatch('products/setCurrentPage', page)
  } catch (error) {
    console.error('Page change error:', error)
    showMessage('Có lỗi khi chuyển trang', 'error')
  }
}

// Lifecycle Hooks
onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch('products/fetchProducts'),
      store.dispatch('brands/fetchBrands'),
      store.dispatch('categories/fetchCategories')
    ])
  } catch (error) {
    console.error('Error loading initial data:', error)
    showMessage('Có lỗi khi tải dữ liệu ban đầu', 'error')
  }
})
</script>

<style scoped>
.product-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}

/* Variants styling */
.variants-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  max-height: 80px;
  overflow-y: auto;
}

.variant-item {
  display: inline-flex;
  align-items: center;
}

/* Custom scrollbar for variants */
.variants-wrap::-webkit-scrollbar {
  width: 4px;
}

.variants-wrap::-webkit-scrollbar-track {
  background: transparent;
}

.variants-wrap::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 2px;
}

.variants-wrap::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.24);
}

/* Stock status colors */
.text-success {
  color: rgb(var(--v-theme-success)) !important;
}

.text-warning {
  color: rgb(var(--v-theme-warning)) !important;
}

.text-error {
  color: rgb(var(--v-theme-error)) !important;
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

  .v-data-table :deep(td[data-label="Tên sản phẩm"]) {
    min-width: 200px;
  }

  .v-data-table :deep(td[data-label="Biến thể"]) {
    min-width: 250px;
  }
}

@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.25rem !important;
  }

  .variants-wrap {
    max-height: 120px;
  }
}
</style>