<template>
  <v-container>
    <!-- Loading State -->
    <v-overlay v-model="isLoading" class="align-center justify-center">
      <v-progress-circular size="64" color="primary" indeterminate />
    </v-overlay>

    <template v-if="product">
      <v-row>
        <!-- Image Gallery Section -->
        <v-col cols="12" md="6">
          <v-card class="bg-surface">
            <v-img
              :src="currentImage"
              cover
              height="400"
              class="bg-grey-lighten-2"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey" indeterminate />
                </div>
              </template>
            </v-img>

            <v-card-text>
              <v-slide-group show-arrows>
                <v-slide-group-item
                  v-for="image in product.images.gallery"
                  :key="image.id"
                >
                  <v-img
                    :src="image.url"
                    :class="{'border-primary': currentImage === image.url}"
                    class="ma-2 rounded cursor-pointer"
                    width="80"
                    height="80"
                    cover
                    @click="currentImage = image.url"
                  />
                </v-slide-group-item>
              </v-slide-group>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Product Info Section -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-item>
              <v-card-title class="text-h5 font-weight-bold">
                {{ product.name }}
              </v-card-title>
              <v-card-subtitle class="mt-2">
                <span class="text-medium-emphasis">Thương hiệu:</span>
                <span class="font-weight-medium ms-1">{{ product.brand.name }}</span>
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <!-- Price Display -->
              <div class="d-flex align-center mb-4">
                <div class="text-h4 font-weight-bold text-error me-4">
                  {{ finalPrice }}
                </div>
                <template v-if="hasDiscount">
                  <div class="text-h6 text-grey text-decoration-line-through me-2">
                    {{ originalPrice }}
                  </div>
                  <v-chip color="error" size="small">
                    {{ product.promotion?.discount?.display }}
                  </v-chip>
                </template>
              </div>

              <!-- Flash Sale Alert -->
              <v-alert
                v-if="product.promotion"
                color="error"
                icon="mdi-flash"
                title="Flash Sale"
                variant="tonal"
                class="mb-4"
              >
                <div>Kết thúc: {{ formatDate(product.promotion.endDate) }}</div>
              </v-alert>

              <!-- Color Selection -->
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-1 font-weight-bold">Màu sắc:</div>
                  <div v-if="selectedColorVariant" class="text-caption text-grey">
                    Còn {{ totalColorStock }} sản phẩm
                  </div>
                </div>

                <v-chip-group
                  v-model="selectedColorIndex"
                  mandatory
                  selected-class="selected-variant"
                >
                  <v-chip
                    v-for="variant in product.variants.byColor"
                    :key="variant.color.id"
                    :disabled="!hasAvailableSize(variant)"
                    variant="outlined"
                    filter
                  >
                    <template #prepend>
                      <v-avatar :image="variant.color.image_url" size="24" class="me-1" />
                    </template>
                    {{ variant.color.name }}
                    <template v-if="getColorStock(variant) <= 5">
                      <span class="text-error text-caption ms-1">
                        (Còn {{ getColorStock(variant) }})
                      </span>
                    </template>
                  </v-chip>
                </v-chip-group>
              </div>

              <!-- Size Selection -->
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-1 font-weight-bold">Kích thước:</div>
                  <div v-if="selectedVariant" class="text-caption text-grey">
                    Còn {{ selectedVariant.stock }} sản phẩm
                  </div>
                </div>

                <v-chip-group
                  v-model="selectedSizeIndex"
                  mandatory
                  selected-class="selected-variant"
                >
                  <v-chip
                    v-for="size in availableSizes"
                    :key="size.id"
                    :disabled="size.stock <= 0"
                    variant="outlined"
                    filter
                  >
                    {{ size.size.name }}
                    <template v-if="size.stock <= 5">
                      <span class="text-error text-caption ms-1">
                        (Còn {{ size.stock }})
                      </span>
                    </template>
                  </v-chip>
                </v-chip-group>
              </div>

              <!-- Quantity Selection -->
              <div class="mb-6">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-1 font-weight-bold">Số lượng:</div>
                  <div v-if="selectedVariant" class="text-caption text-grey">
                    Tối đa {{ maxQuantity }} sản phẩm
                  </div>
                </div>

                <div class="d-flex align-center">
                  <v-text-field
                    v-model="quantity"
                    density="compact"
                    type="number"
                    hide-details
                    variant="outlined"
                    class="quantity-input"
                    min="1"
                    :max="maxQuantity"
                    :error="!!quantityError"
                    :error-messages="quantityError"
                    @update:model-value="handleQuantityChange"
                  >
                    <template #prepend>
                      <v-btn
                        icon="mdi-minus"
                        size="small"
                        variant="text"
                        :disabled="quantity <= 1"
                        @click="decreaseQuantity"
                      />
                    </template>
                    <template #append>
                      <v-btn
                        icon="mdi-plus"
                        size="small"
                        variant="text"
                        :disabled="quantity >= maxQuantity"
                        @click="increaseQuantity"
                      />
                    </template>
                  </v-text-field>
                </div>
              </div>

              <!-- Add to Cart Button -->
              <v-btn
                block
                color="error"
                size="large"
                :loading="addingToCart"
                :disabled="!canAddToCart"
                @click="addToCart"
              >
                <template v-if="!selectedVariant">
                  Vui lòng chọn phân loại
                </template>
                <template v-else-if="selectedVariant.stock === 0">
                  Hết hàng
                </template>
                <template v-else>
                  Thêm vào giỏ hàng
                </template>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Product Details Tabs -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-tabs v-model="activeTab">
              <v-tab value="description">Mô tả sản phẩm</v-tab>
              <v-tab value="reviews">
                Đánh giá ({{ product.ratings.total }})
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <!-- Description Tab -->
              <v-window-item value="description">
                <v-card-text 
                  class="product-description"
                  v-html="formattedDescription"
                />
              </v-window-item>

              <!-- Reviews Tab -->
              <v-window-item value="reviews">
                <v-card-text>
                  <!-- Rating Summary -->
                  <v-row class="mb-6">
                    <v-col cols="12" sm="4">
                      <div class="text-center">
                        <div class="text-h3 font-weight-bold mb-2">
                          {{ product.ratings.average }}/5
                        </div>
                        <v-rating
                          :model-value="product.ratings.average"
                          color="warning"
                          half-increments
                          readonly
                        />
                        <div class="text-subtitle-1 text-grey mt-2">
                          {{ product.ratings.total }} đánh giá
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="12" sm="8">
                      <div
                        v-for="item in product.ratings.distribution"
                        :key="item.star"
                        class="d-flex align-center mb-2"
                      >
                        <span class="me-2">{{ item.star }} sao</span>
                        <v-progress-linear
                          :model-value="getDistributionPercentage(item.count)"
                          color="warning"
                          height="8"
                          class="flex-grow-1"
                        />
                        <span class="ms-2">{{ item.count }}</span>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Reviews List -->
                  <v-divider class="mb-4" />

                  <div v-if="product.ratings.latest.length">
                    <div
                      v-for="review in product.ratings.latest"
                      :key="review.id"
                      class="mb-4"
                    >
                      <div class="d-flex align-center mb-2">
                        <v-avatar color="grey-lighten-3" class="me-2">
                          <v-icon>mdi-account</v-icon>
                        </v-avatar>
                        <div>
                          <div class="font-weight-medium">
                            {{ review.user_name }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ review.created_at }}
                          </div>
                        </div>
                      </div>

                      <v-rating
                        :model-value="review.star"
                        color="warning"
                        density="compact"
                        readonly
                        class="mb-1"
                      />

                      <div>{{ review.comment || 'Không có nhận xét' }}</div>
                      <v-divider class="my-4" />
                    </div>
                  </div>
                  <div v-else class="text-center text-grey py-4">
                    Chưa có đánh giá nào
                  </div>
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      location="top right"
      :color="snackbar.color"
      :timeout="2000"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { CartService } from '@/services/cart.service'

const store = useStore()
const route = useRoute()

// Reactive State
const currentImage = ref('')
const selectedColorIndex = ref(0)
const selectedSizeIndex = ref(0)
const quantity = ref(1)
const quantityError = ref('')
const activeTab = ref('description')
const addingToCart = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed Properties
const product = computed(() => store.getters['home/currentProduct'])
const isLoading = computed(() => store.state.home.productDetailLoading)


const hasDiscount = computed(() => product.value?.price?.hasDiscount)
const finalPrice = computed(() => product.value?.price?.final)
const originalPrice = computed(() => product.value?.price?.original)

const selectedColorVariant = computed(() => {
  if (!product.value?.variants?.byColor || selectedColorIndex.value === undefined) return null
  return product.value.variants.byColor[selectedColorIndex.value]
})

const availableSizes = computed(() => {
  if (!selectedColorVariant.value?.sizes) return []
  return selectedColorVariant.value.sizes
})

const selectedVariant = computed(() => {
  if (!availableSizes.value.length || selectedSizeIndex.value === undefined) {
    return null
  }
  return availableSizes.value[selectedSizeIndex.value]
})

const maxQuantity = computed(() => selectedVariant.value?.stock || 0)

const totalColorStock = computed(() => {
  if (!selectedColorVariant.value?.sizes) return 0
  return selectedColorVariant.value.sizes.reduce((total, size) => total + size.stock, 0)
})

const canAddToCart = computed(() => 
  selectedVariant.value && 
  selectedVariant.value.stock > 0 &&
  quantity.value > 0 && 
  quantity.value <= maxQuantity.value &&
  !quantityError.value
)

const formattedDescription = computed(() => {
  if (!product.value?.description) return ''
  return product.value.description.replace(/\n/g, '<br>')
})

// Methods
const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
}

const getColorStock = (variant) => {
  return variant.sizes.reduce((total, size) => total + size.stock, 0)
}
// Methods (continued)
const hasAvailableSize = (variant) => {
  return getColorStock(variant) > 0
}

const validateQuantity = (value) => {
  const numValue = parseInt(value)
  
  if (isNaN(numValue)) {
    return 'Số lượng không hợp lệ'
  }
  
  if (numValue < 1) {
    return 'Số lượng phải lớn hơn 0'
  }
  
  if (numValue > maxQuantity.value) {
    return `Số lượng không được vượt quá ${maxQuantity.value}`
  }
  
  return ''
}

const handleQuantityChange = (value) => {
  const error = validateQuantity(value)
  quantityError.value = error
  
  if (error) {
    quantity.value = Math.max(1, Math.min(parseInt(value) || 1, maxQuantity.value))
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
    quantityError.value = ''
  }
}

const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
    quantityError.value = ''
  }
}

const getDistributionPercentage = (count) => {
  if (!product.value?.ratings.total) return 0
  return (count / product.value.ratings.total) * 100
}

const addToCart = async () => {
  if (!canAddToCart.value) return

  try {
    addingToCart.value = true
    
    // Prepare product data
    const productData = {
      productId: product.value.id,
      variantId: selectedVariant.value.id,
      name: product.value.name,
      image: currentImage.value,
      color: selectedColorVariant.value.color.name,
      size: selectedVariant.value.size.name,
      price: product.value.price.raw.final,
      originalPrice: product.value.price.raw.original,
      quantity: quantity.value,
      maxQuantity: selectedVariant.value.stock
    }
    
    // Add to cart using CartService
    CartService.addToCart(productData)
    
    showMessage('Thêm vào giỏ hàng thành công')
  } catch (error) {
    console.error('Error adding to cart:', error)
    showMessage('Có lỗi xảy ra khi thêm vào giỏ hàng', 'error')
  } finally {
    addingToCart.value = false
  }
}

// Watchers
watch(selectedColorIndex, () => {
  selectedSizeIndex.value = 0
  quantity.value = 1
  quantityError.value = ''
})

watch(selectedSizeIndex, () => {
  quantity.value = 1
  quantityError.value = ''
})

watch(() => product.value, (newProduct) => {
  if (newProduct?.images?.gallery?.[0]?.url) {
    currentImage.value = newProduct.images.gallery[0].url
  } else if (newProduct?.images?.main) {
    currentImage.value = newProduct.images.main
  }
}, { immediate: true })

// Lifecycle Hooks
onMounted(async () => {
  try {
    const productId = route.params.id
    if (!productId) {
      showMessage('Không tìm thấy sản phẩm', 'error')
      return
    }

    await store.dispatch('home/fetchProductDetail', productId)
    
    // Reset selections
    selectedColorIndex.value = 0
    selectedSizeIndex.value = 0
    quantity.value = 1

  } catch (error) {
    console.error('Error loading product:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin sản phẩm',
      'error'
    )
  }
})

onBeforeUnmount(() => {
  store.commit('home/clearCurrentProduct')
})
</script>

<style scoped>
.border-primary {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.selected-variant {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.quantity-input {
  max-width: 150px;
}

.product-description {
  line-height: 1.6;
  white-space: pre-line;
}

:deep(.v-rating .v-icon) {
  padding: 0.2rem;
}

.v-avatar {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.v-chip.selected-variant .v-avatar {
  border-color: white;
}

@media (max-width: 600px) {
  .v-card-title.text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h3 {
    font-size: 2rem !important;
  }

  .quantity-input {
    max-width: 120px;
  }
  
  .v-btn.v-btn--size-small {
    width: 24px;
    height: 24px;
  }
}
</style>