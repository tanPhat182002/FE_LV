<template>
  <v-container>
    <!-- Breadcrumbs -->
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
      </v-col>
    </v-row>

    <v-row>
      <!-- Filters Sidebar -->
      <v-col cols="12" md="3">
        <v-card class="mb-4">
          <v-card-title class="text-subtitle-1">Bộ lọc tìm kiếm</v-card-title>
          
          <!-- Search -->
          <v-card-text>
            <v-text-field
              v-model="filters.search"
              label="Tìm kiếm sản phẩm"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              @update:model-value="debouncedSearch"
            ></v-text-field>
          </v-card-text>

          <!-- Price Range -->
          <v-card-text>
            <div class="text-subtitle-2 mb-2">Khoảng giá</div>
            <v-range-slider
              v-model="priceRange"
              :min="0"
              :max="10000000"
              :step="100000"
              thumb-label="always"
              density="compact"
              @update:model-value="updatePriceFilter"
            >
              <template v-slot:thumb-label="{ modelValue }">
                {{ formatPrice(modelValue) }}
              </template>
            </v-range-slider>
          </v-card-text>

          <!-- Promotion Filter -->
          <v-card-text>
            <v-switch
              v-model="filters.hasPromotion"
              label="Đang giảm giá"
              color="primary"
              hide-details
              @change="applyFilters"
            ></v-switch>
          </v-card-text>

          <!-- Rating Filter -->
          <v-card-text>
            <div class="text-subtitle-2 mb-2">Đánh giá</div>
            <v-btn-toggle
              v-model="filters.rating"
              mandatory
              @change="applyFilters"
            >
              <v-btn
                v-for="rating in [0,3,4,5]"
                :key="rating"
                :value="rating"
                :ripple="false"
                variant="text"
                density="compact"
              >
                {{ rating ? `${rating}★+` : 'Tất cả' }}
              </v-btn>
            </v-btn-toggle>
          </v-card-text>

          <!-- Reset Filters -->
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
      </v-col>

      <!-- Products Grid -->
      <v-col cols="12" md="9">
        <!-- Sort Options -->
        <v-row class="mb-4" align="center">
          <v-col cols="auto">
            <div class="text-subtitle-1">
              {{ pagination.total }} sản phẩm
            </div>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-select
              v-model="filters.sortBy"
              :items="sortOptions"
              label="Sắp xếp"
              density="compact"
              variant="outlined"
              hide-details
              style="min-width: 200px"
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
        </v-row>

        <!-- Products Grid -->
        <v-row>
          <template v-if="products.length > 0">
            <v-col
              v-for="product in products"
              :key="product.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="h-100"
                :to="{ name: 'product-detail', params: { id: product.id }}"
              >
                <!-- Ảnh sản phẩm -->
                <v-img
                  :src="product.main_image"
                  height="200"
                  cover
                  class="bg-grey-lighten-2"
                >
                  <!-- Badge khuyến mãi -->
                  <div 
                    v-if="product.promotion" 
                    class="promotion-badge"
                  >
                    {{ product.promotion.discount.display }}
                  </div>
                </v-img>

                <v-card-text>
                  <!-- Tên thương hiệu -->
                  <div class="text-caption text-grey mb-1">
                    {{ product.brand.name }}
                  </div>

                  <!-- Tên sản phẩm -->
                  <div 
                    class="text-subtitle-2 text-truncate mb-2"
                    :title="product.name"
                  >
                    {{ product.name }}
                  </div>

                  <!-- Giá -->
                  <div class="d-flex align-center">
                    <span class="text-primary font-weight-bold">
                      {{ product.price.final }}
                    </span>
                    <span 
                      v-if="product.promotion"
                      class="text-grey-darken-1 text-decoration-line-through ms-2 text-caption"
                    >
                      {{ product.price.original }}
                    </span>
                  </div>

                  <!-- Đánh giá -->
                  <div class="d-flex align-center mt-2">
                    <v-rating
                      :model-value="product.rating.average"
                      color="warning"
                      density="compact"
                      size="small"
                      readonly
                    ></v-rating>
                    <span class="text-caption text-grey ms-2">
                      ({{ product.rating.total }})
                    </span>
                  </div>

                  <!-- Variants -->
                  <div class="mt-2">
                    <div class="d-flex align-center gap-1">
                      <v-chip
                        v-for="color in product.variants.colors"
                        :key="color.id"
                        size="x-small"
                        class="me-1"
                      >
                        {{ color.name }}
                      </v-chip>
                    </div>
                    <div class="d-flex align-center gap-1 mt-1">
                      <v-chip
                        v-for="size in product.variants.sizes"
                        :key="size.id"
                        size="x-small"
                        variant="outlined"
                        class="me-1"
                      >
                        {{ size.name }}
                      </v-chip>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </template>

          <!-- No Products Message -->
          <v-col v-else-if="!loading" cols="12">
            <v-card class="text-center pa-4">
              <v-icon
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              >
                mdi-package-variant
              </v-icon>
              <div class="text-h6 text-grey-darken-1">
                Không tìm thấy sản phẩm nào
              </div>
              <div class="text-body-2 text-grey">
                Vui lòng thử lại với bộ lọc khác
              </div>
              <v-btn
                color="primary"
                class="mt-4"
                @click="resetFilters"
              >
                Xóa bộ lọc
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading Skeleton -->
        <v-row v-if="loading">
          <v-col
            v-for="n in 8"
            :key="n"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-skeleton-loader
              type="card"
              height="350"
            ></v-skeleton-loader>
          </v-col>
        </v-row>

        <!-- Pagination -->
        <v-row v-if="products.length > 0" class="mt-4">
          <v-col cols="12" class="d-flex justify-center">
            <v-pagination
              v-model="currentPage"
              :length="pagination.lastPage"
              :total-visible="7"
              :disabled="loading"
              @update:model-value="changePage"
            ></v-pagination>
          </v-col>
        </v-row>

        <!-- Loading State -->
        <v-overlay
          :model-value="loading"
          class="align-center justify-center"
        >
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
          ></v-progress-circular>
        </v-overlay>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import debounce from 'lodash/debounce'

const store = useStore()
const route = useRoute()
const router = useRouter()

// Computed Properties
const products = computed(() => store.getters['home/allProducts'])
const loading = computed(() => store.getters['home/allProductsLoading'])
const pagination = computed(() => store.getters['home/allProductsPagination'])
const currentFilters = computed(() => store.getters['home/currentFilters'])

// Local State
const currentPage = ref(1)
const priceRange = ref([0, 10000000])
const filters = ref({
  search: '',
  category: null,
  brand: null,
  priceMin: null,
  priceMax: null,
  color: null,
  size: null,
  hasPromotion: false,
  rating: 0,
  sortBy: 'latest'
})

// Constants
const breadcrumbs = [
  { title: 'Trang chủ', to: '/' },
  { title: 'Tất cả sản phẩm', disabled: true }
]

const sortOptions = [
  { title: 'Mới nhất', value: 'latest' },
  { title: 'Giá tăng dần', value: 'price_asc' },
  { title: 'Giá giảm dần', value: 'price_desc' },
  { title: 'Tên A-Z', value: 'name_asc' },
  { title: 'Tên Z-A', value: 'name_desc' },
  { title: 'Đánh giá cao nhất', value: 'rating' }
]

// Methods
const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const updateURL = (newFilters) => {
  const query = {
    ...route.query,
    page: currentPage.value > 1 ? currentPage.value : undefined,
    search: newFilters.search || undefined,
    category: newFilters.category || undefined,
    brand: newFilters.brand || undefined,
    price_min: newFilters.priceMin || undefined,
    price_max: newFilters.priceMax || undefined,
    color: newFilters.color || undefined,
    size: newFilters.size || undefined,
    promotion: newFilters.hasPromotion || undefined,
    rating: newFilters.rating > 0 ? newFilters.rating : undefined,
    sort: newFilters.sortBy !== 'latest' ? newFilters.sortBy : undefined
  }

  // Lọc bỏ các params undefined
  const cleanQuery = Object.fromEntries(
    // eslint-disable-next-line no-unused-vars
    Object.entries(query).filter(([_, value]) => value !== undefined)
  )

  // Cập nhật URL mà không reload trang
  router.replace({ query: cleanQuery })
}

const loadProducts = async (params = {}) => {
  try {
    const page = Math.max(1, currentPage.value)
    await store.dispatch('home/fetchAllProducts', {
      ...filters.value,
      ...params,
      page,
      per_page: pagination.value.perPage
    })
    updateURL(filters.value)
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

const updatePriceFilter = () => {
  filters.value.priceMin = priceRange.value[0]
  filters.value.priceMax = priceRange.value[1]
  applyFilters()
}

const changePage = async (page) => {
  if (page < 1) {
    currentPage.value = 1
  } else if (page > pagination.value.lastPage) {
    currentPage.value = pagination.value.lastPage
  } else {
    currentPage.value = page
  }
  
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  
  await loadProducts()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    category: null,
    brand: null,
    priceMin: null,
    priceMax: null,
    color: null,
    size: null,
    hasPromotion: false,
    rating: 0,
    sortBy: 'latest'
  }
  priceRange.value = [0, 10000000]
  currentPage.value = 1
  loadProducts()
}

// Khôi phục filters từ URL khi component được mount
onMounted(() => {
  const query = route.query
  
  filters.value = {
    search: query.search || '',
    category: query.category || null,
    brand: query.brand || null,
    priceMin: query.price_min ? Number(query.price_min) : null,
    priceMax: query.price_max ? Number(query.price_max) : null,
    color: query.color || null,
    size: query.size || null,
    hasPromotion: query.promotion === 'true',
    rating: query.rating ? Number(query.rating) : 0,
    sortBy: query.sort || 'latest'
  }

  if (query.price_min && query.price_max) {
    priceRange.value = [Number(query.price_min), Number(query.price_max)]
  }

  currentPage.value = query.page ? Number(query.page) : 1
  
  loadProducts()
})

// Watch route changes
watch(() => route.query, (newQuery) => {
  if (!Object.keys(newQuery).length) {
    resetFilters()
  }
}, { deep: true })

// Watch pagination changes
watch(() => pagination.value, (newPagination) => {
  if (currentPage.value > newPagination.lastPage) {
    currentPage.value = newPagination.lastPage || 1
  }
}, { deep: true })

// Watch filter changes from external sources
watch(() => currentFilters.value, (newFilters) => {
  filters.value = { ...newFilters }
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.promotion-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ff4081;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style>