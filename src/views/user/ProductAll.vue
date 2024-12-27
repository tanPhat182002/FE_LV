<template>
  <v-container>
    <v-row>
      <!-- Breadcrumbs -->
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
      </v-col>
    </v-row>

    <v-row>
      <!-- Sidebar Filters - Responsive -->
      <v-col cols="12" sm="12" md="3">
        <!-- Mobile Filter Button -->
        <v-btn
          block
          class="mb-4 d-md-none"
          prepend-icon="mdi-filter-variant"
          @click="showFilterDialog = true"
        >
          Bộ lọc tìm kiếm
        </v-btn>

        <!-- Desktop Filter Card -->
        <v-card class="d-none d-md-block">
          <v-card-title>Bộ lọc tìm kiếm</v-card-title>
          
          <v-card-text>
            <!-- Search -->
            <v-text-field
              v-model="filters.search"
              label="Tìm kiếm"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              @update:model-value="debouncedSearch"
            ></v-text-field>

            <!-- Categories -->
            <div class="mt-4">
              <div class="text-subtitle-2 mb-2">Danh mục</div>
              <v-select
                v-model="filters.categories"
                :items="categoryOptions"
                label="Chọn danh mục"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              ></v-select>
            </div>

            <!-- Brands -->
            <div class="mt-4">
              <div class="text-subtitle-2 mb-2">Thương hiệu</div>
              <v-select
                v-model="filters.brands"
                :items="brandOptions"
                label="Chọn thương hiệu"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              ></v-select>
            </div>

            <!-- Promotion -->
           
          </v-card-text>

          <v-card-actions>
            <v-btn
              block
              color="primary"
              variant="outlined"
              @click="resetFilters"
            >
              Xóa bộ lọc
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Mobile Filter Dialog -->
        <v-dialog
          v-model="showFilterDialog"
          fullscreen
          transition="dialog-bottom-transition"
          class="d-md-none"
        >
          <v-card>
            <v-toolbar dark color="primary">
              <v-btn icon dark @click="showFilterDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title>Bộ lọc tìm kiếm</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn variant="text" @click="applyFiltersAndClose">
                  Áp dụng
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>

            <v-card-text>
              <!-- Filter content for mobile -->
              <v-container>
                <!-- Search -->
                <v-text-field
                  v-model="filters.search"
                  label="Tìm kiếm"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  @update:model-value="debouncedSearch"
                ></v-text-field>

                <!-- Categories -->
                <div class="mt-4">
                  <div class="text-subtitle-2 mb-2">Danh mục</div>
                  <v-select
                    v-model="filters.categories"
                    :items="categoryOptions"
                    label="Chọn danh mục"
                    multiple
                    chips
                    closable-chips
                    variant="outlined"
                    density="compact"
                  ></v-select>
                </div>

                <!-- Brands -->
                <div class="mt-4">
                  <div class="text-subtitle-2 mb-2">Thương hiệu</div>
                  <v-select
                    v-model="filters.brands"
                    :items="brandOptions"
                    label="Chọn thương hiệu"
                    multiple
                    chips
                    closable-chips
                    variant="outlined"
                    density="compact"
                  ></v-select>
                </div>
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>

      <!-- Products Grid -->
      <v-col cols="12" sm="12" md="9">
        <!-- Sort Bar - Responsive -->
        <v-row align="center" class="mb-4">
          <v-col cols="auto" class="d-none d-sm-flex">
            <span class="text-subtitle-1">{{ pagination.total }} sản phẩm</span>
          </v-col>
          <v-spacer class="d-none d-sm-block"></v-spacer>
          <v-col cols="12" sm="auto">
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              label="Sắp xếp"
              density="compact"
              class="sort-select"
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
        </v-row>

        <!-- Products Grid - Responsive -->
        <v-row v-if="!loading && products.length > 0">
          <v-col 
            v-for="product in products" 
            :key="product.id"
            cols="6" 
            sm="6" 
            md="4" 
            lg="3"
            class="product-col"
          >
            <v-card :to="`/products/${product.id}`" class="h-100">
              <v-img
                :src="product.main_image"
                height="280"
                cover
                class="product-image"
              >
                <div 
                  v-if="product.promotion" 
                  class="promotion-badge"
                >
                  {{ product.promotion.discount.display }}
                </div>
              </v-img>

              <v-card-text>
                <div class="product-brand">{{ product.brand.name }}</div>
                <div class="product-name">{{ product.name }}</div>
                
                <div class="d-flex align-center">
                  <span class="product-price">{{ product.price.final }}</span>
                  <span 
                    v-if="product.promotion"
                    class="original-price"
                  >
                    {{ product.price.original }}
                  </span>
                </div>

                <!-- Variants -->
                <div class="color-chips">
                  <v-chip
                    v-for="color in product.variants.colors"
                    :key="color.id"
                    size="x-small"
                    class="color-chip"
                  >
                    {{ color.name }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-card 
          v-else-if="!loading && products.length === 0" 
          class="text-center pa-4"
        >
          <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
          <div class="text-h6 mt-4">Không tìm thấy sản phẩm</div>
          <v-btn color="primary" class="mt-4" @click="resetFilters">
            Xóa bộ lọc
          </v-btn>
        </v-card>

        <!-- Loading State -->
        <v-row v-if="loading">
          <v-col 
            v-for="n in 8" 
            :key="n"
            cols="12" sm="6" md="4" lg="3"
          >
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </v-col>
        </v-row>

        <!-- Pagination -->
        <div 
          v-if="!loading && products.length > 0" 
          class="d-flex justify-center mt-4"
        >
          <div class="d-flex align-center gap-2">
            <!-- Previous page button -->
            <v-btn
              :disabled="currentPage === 1"
              icon="mdi-chevron-left"
              variant="text"
              @click="changePage(currentPage - 1)"
            ></v-btn>

            <!-- Page numbers -->
            <div class="d-flex">
              <v-btn
                v-for="page in pagination.lastPage"
                :key="page"
                :color="currentPage === page ? 'primary' : ''"
                :variant="currentPage === page ? 'flat' : 'text'"
                size="small"
                class="mx-1"
                @click="changePage(page)"
              >
                {{ page }}
              </v-btn>
            </div>

            <!-- Next page button -->
            <v-btn
              :disabled="currentPage === pagination.lastPage"
              icon="mdi-chevron-right"
              variant="text"
              @click="changePage(currentPage + 1)"
            ></v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import debounce from 'lodash/debounce'

// Store & Router
const store = useStore()
const route = useRoute()
const router = useRouter()

// Computed từ các stores
const products = computed(() => store.getters['home/allProducts'])
const loading = computed(() => store.getters['home/allProductsLoading'])
const pagination = computed(() => store.getters['home/allProductsPagination'])

// Lấy categories và brands từ stores tương ứng
const categories = computed(() => store.getters['categories/categories'])
const brands = computed(() => store.getters['brands/brands'])

// Format options cho v-select
const categoryOptions = computed(() => {
  return categories.value.map(cat => ({
    title: cat.name,
    value: cat.id
  }))
})

const brandOptions = computed(() => {
  return brands.value.map(brand => ({
    title: brand.name,
    value: brand.id
  }))
})

// State
const currentPage = ref(1)
const filters = ref({
  search: '',
  categories: null,
  brands: null,
  promotion: false,
  sortBy: 'latest'
})

// Constants
const breadcrumbs = [
  { title: 'Trang chủ', to: '/' },
  { title: 'Sản phẩm', disabled: true }
]

const sortOptions = [
  { title: 'Mới nhất', value: 'latest' },
  { title: 'Giá tăng dần', value: 'price_asc' },
  { title: 'Giá giảm dần', value: 'price_desc' },
  { title: 'Tên A-Z', value: 'name_asc' },
  { title: 'Tên Z-A', value: 'name_desc' }
]

// Methods
const loadProducts = async () => {
  try {
    // Tạo URLSearchParams để xử lý params đúng cách
    const searchParams = new URLSearchParams()
    searchParams.append('page', currentPage.value)
    searchParams.append('per_page', 12)
    
    if (filters.value.categories?.length) {
      searchParams.append('categories', filters.value.categories.join(','))
    }
    
    if (filters.value.brands?.length) {
      searchParams.append('brands', filters.value.brands.join(','))
    }
    
    if (filters.value.search) {
      searchParams.append('search', filters.value.search) // Không encode ở đây
    }
    
    if (filters.value.sortBy !== 'latest') {
      searchParams.append('sort_by', filters.value.sortBy)
    }

    await store.dispatch('home/fetchAllProducts', Object.fromEntries(searchParams))
    
    // Cập nhật URL mà không encode lại
    const currentURL = new URL(window.location.href)
    currentURL.search = searchParams.toString()
    router.replace(currentURL.pathname + currentURL.search)
    
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const applyFilters = () => {
  currentPage.value = 1
  loadProducts()
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const changePage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadProducts()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    categories: null,
    brands: null,
    promotion: false,
    sortBy: 'latest'
  }
  currentPage.value = 1
  loadProducts()
}

// Init
onMounted(async () => {
  try {
    // Load categories và brands trước
    await Promise.all([
      store.dispatch('categories/fetchCategories'),
      store.dispatch('brands/fetchBrands')
    ])

    // Restore từ URL
    const query = route.query
    filters.value = {
      search: query.search || '',
      categories: query.categories ? query.categories.split(',').map(Number) : null,
      brands: query.brands ? query.brands.split(',').map(Number) : null,
      promotion: query.promotion === 'true',
      sortBy: query.sort_by || 'latest'
    }
    currentPage.value = query.page ? Number(query.page) : 1
    
    await loadProducts()
  } catch (error) {
    console.error('Error initializing page:', error)
  }
})

// Watch URL changes
watch(
  () => route.query,
  (newQuery) => {
    filters.value = {
      search: newQuery.search || '', // Không cần decode vì browser tự động decode
      categories: newQuery.categories && newQuery.categories !== '' 
        ? newQuery.categories.split(',').map(Number) 
        : null,
      brands: newQuery.brands && newQuery.brands !== ''
        ? newQuery.brands.split(',').map(Number)
        : null,
      sortBy: newQuery.sort_by || 'latest'
    }
    
    if (newQuery.search !== route.query.search) {
      currentPage.value = 1
    }
    
    if (!route.query.search) {
      loadProducts()
    }
  },
  { immediate: true, deep: true }
)

// Add new ref for mobile filter dialog
const showFilterDialog = ref(false)

// Add method to handle mobile filter apply
const applyFiltersAndClose = () => {
  applyFilters()
  showFilterDialog.value = false
}
</script>

<style scoped>
.promotion-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4081;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.v-card {
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

/* New styles for product card */
.v-img {
  transition: transform 0.3s ease;
  background-color: #f5f5f5;
}

.v-card:hover .v-img {
  transform: scale(1.05);
}

.v-card-text {
  padding: 16px;
}

.product-brand {
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-name {
  font-weight: 500;
  line-height: 1.4;
  margin: 8px 0;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
}

.original-price {
  color: #999;
  margin-left: 8px;
  font-size: 0.9rem;
  text-decoration: line-through;
}

.color-chips {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.color-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
  background-color: #f5f5f5;
}

/* Responsive styles */
.product-col {
  padding: 8px;
}

@media (max-width: 600px) {
  .v-card-text {
    padding: 12px;
  }

  .product-name {
    font-size: 0.9rem;
    height: 36px;
  }

  .product-price {
    font-size: 1rem;
  }

  .original-price {
    font-size: 0.8rem;
  }

  .color-chip {
    font-size: 0.7rem !important;
    height: 20px !important;
  }

  .v-img {
    height: 180px !important;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .v-img {
    height: 220px !important;
  }
}

/* Sort select responsive */
.sort-select {
  min-width: 150px;
}

@media (min-width: 960px) {
  .sort-select {
    min-width: 200px;
  }
}

/* Card hover effect only on desktop */
@media (min-width: 1024px) {
  .v-card:hover {
    transform: translateY(-4px);
  }

  .v-card:hover .v-img {
    transform: scale(1.05);
  }
}

/* Disable hover effects on touch devices */
@media (hover: none) {
  .v-card:hover {
    transform: none;
  }

  .v-card:hover .v-img {
    transform: none;
  }
}
</style>