<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header -->
      <v-toolbar color="transparent" flat>
        <v-tooltip location="bottom" text="Quay lại trang danh sách">
          <template v-slot:activator="{ props }">
            <v-btn
              :to="{ name: 'admin-promotions' }"
              icon="mdi-arrow-left"
              variant="text"
              v-bind="props"
            ></v-btn>
          </template>
        </v-tooltip>
        
        <v-toolbar-title class="text-h6 ml-2">
          Chỉnh sửa khuyến mãi
        </v-toolbar-title>
      </v-toolbar>

      <v-divider></v-divider>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text>
          <v-row>
            <!-- Cột trái - Thông tin khuyến mãi -->
            <v-col cols="12" md="8">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4 pb-0">
                  Thông tin khuyến mãi
                </v-card-title>
                
                <v-card-text class="px-4">
                  <v-row>
                    <!-- Tên khuyến mãi -->
                    <v-col cols="12">
                      <v-text-field
                        v-model="promotion.name"
                        label="Tên khuyến mãi"
                        placeholder="Nhập tên khuyến mãi"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>

                    <!-- Loại giảm giá -->
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="promotion.discount_type"
                        :items="discountTypes"
                        label="Loại giảm giá"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-select>
                    </v-col>

                    <!-- Giá trị giảm -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="promotion.discount_value"
                        type="number"
                        :min="0"
                        :max="promotion.discount_type === 'percentage' ? 100 : null"
                        label="Giá trị giảm"
                        :prefix="promotion.discount_type === 'fixed' ? '₫' : ''"
                        :suffix="promotion.discount_type === 'percentage' ? '%' : ''"
                        variant="outlined"
                        density="comfortable"
                        :rules="[
                          rules.required,
                          rules.minValue(0),
                          ...(promotion.discount_type === 'percentage' ? [rules.maxValue(100)] : [])
                        ]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>

                    <!-- Thời gian -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="promotion.start_date"
                        type="datetime-local"
                        label="Thời gian bắt đầu"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="promotion.end_date"
                        type="datetime-local"
                        label="Thời gian kết thúc"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required, rules.endDateAfterStart]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>

                    <!-- Trạng thái -->
                    <v-col cols="12">
                      <v-switch
                        v-model="promotion.is_active"
                        color="success"
                        label="Kích hoạt khuyến mãi"
                        hide-details
                        class="mb-3"
                      ></v-switch>
                    </v-col>

                    <!-- Mô tả -->
                    <v-col cols="12">
                      <v-textarea
                        v-model="promotion.description"
                        label="Mô tả khuyến mãi"
                        placeholder="Nhập mô tả chi tiết khuyến mãi"
                        variant="outlined"
                        rows="4"
                        auto-grow
                        :rules="[rules.required]"
                        hide-details="auto"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Cột phải - Sản phẩm áp dụng -->
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4 pb-0">
                  Sản phẩm áp dụng
                </v-card-title>

                <v-card-text class="px-4">
                  <v-select
                    v-model="promotion.product_ids"
                    :items="availableProducts"
                    item-title="name"
                    item-value="id"
                    label="Chọn sản phẩm"
                    multiple
                    chips
                    closable-chips
                    variant="outlined"
                    :rules="[rules.required]"
                  >
                    <template v-slot:chip="{ props, item }">
                      <v-chip
                        v-bind="props"
                        :text="item.raw.name"
                        :color="currentPromotionProducts.includes(item.raw.id) ? 'light-green-lighten-4' : undefined"
                      ></v-chip>
                    </template>

                    <template v-slot:item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        :title="item?.raw?.name"
                        :subtitle="`Giá: ${formatCurrency(item?.raw?.price?.original || 0)}`"
                        :disabled="currentPromotionProducts.includes(item.raw.id)"
                        :color="currentPromotionProducts.includes(item.raw.id) ? 'light-green-lighten-4' : undefined"
                      >
                      </v-list-item>
                    </template>
                  </v-select>
                </v-card-text>

                <v-card-text class="px-4" v-if="selectedProducts.length > 0">
                  <v-table density="compact">
                    <thead>
                      <tr class="bg-grey-lighten-4">
                        <th>Sản phẩm</th>
                        <th class="text-right">Giá gốc</th>
                        <th class="text-right">Giá KM</th>
                        <th class="text-center" style="width: 100px">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="product in selectedProducts" 
                        :key="product.id"
                        class="hover-row bg-green-lighten-5" 
                      >
                        <td class="font-weight-medium">{{ product.name }}</td>
                        <td class="text-right text-grey-darken-1">
                          {{ formatCurrency(Number(product.price?.original || product.price || 0)) }}
                        </td>
                        <td class="text-right text-green-darken-1 font-weight-medium">
                          {{ formatCurrency(Number(product.price?.final || calculateDiscountedPrice(Number(product.price || 0)))) }}
                        </td>
                        <td class="text-center">
                          <v-btn
                            density="compact"
                            icon="mdi-close"
                            variant="text"
                            color="error"
                            size="small"
                            :loading="removingProductId === product.id"
                            @click="handleRemoveProduct(product)"
                          ></v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>

                <v-card-text v-else class="text-center text-grey">
                  Chưa có sản phẩm được chọn
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Bảng tính giá -->
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4 pb-0">
                  Bảng tính giá sau khuyến mãi
                </v-card-title>

                <v-card-text class="px-4">
                  <v-table density="compact">
                    <thead>
                      <tr class="bg-grey-lighten-4">
                        <th>Sản phẩm</th>
                        <th class="text-right">Giá gốc</th>
                        <th class="text-right">Giá KM</th>
                        <th class="text-center" style="width: 100px">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="product in newSelectedProducts" 
                        :key="product.id"
                        class="hover-row bg-blue-lighten-5"
                      >
                        <td class="font-weight-medium">{{ product.name }}</td>
                        <td class="text-right text-grey-darken-1">
                          {{ formatCurrency(Number(product.price?.original || product.price || 0)) }}
                        </td>
                        <td class="text-right text-blue-darken-1 font-weight-medium">
                          {{ formatCurrency(Number(product.price?.final || calculateDiscountedPrice(Number(product.price || 0)))) }}
                        </td>
                        <td class="text-center">
                          <v-btn
                            density="compact"
                            icon="mdi-close"
                            variant="text"
                            color="error"
                            size="small"
                            @click="removeNewProduct(product.id)"
                          ></v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>

                  <div v-if="!newSelectedProducts.length" class="text-center py-4 text-grey">
                    Chưa có sản phẩm mới được chọn
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Actions -->
        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="outlined"
            :to="{ name: 'admin-promotions' }"
            :disabled="isSubmitting"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            :loading="isSubmitting"
            class="ml-2"
          >
            Cập nhật
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>

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
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const router = useRouter()
const route = useRoute()

// Refs
const form = ref(null)
const isSubmitting = ref(false)

const discountTypes = [
  { title: 'Giảm theo phần trăm', value: 'percentage' },
  { title: 'Giảm theo số tiền', value: 'fixed' }
]

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const promotion = ref({
  name: '',
  description: '',
  discount_type: 'percentage',
  discount_value: null,
  start_date: '',
  end_date: '',
  is_active: true,
  product_ids: []
})

// Thêm ref mới
const removingProductId = ref(null)

// Validation Rules
const rules = {
  required: v => !!v || 'Trường này là bắt buộc',
  minValue: min => v => v >= min || `Giá trị tối thiểu là ${min}`,
  maxValue: max => v => v <= max || `Giá trị tối đa là ${max}`,
  endDateAfterStart: v => {
    if (!v || !promotion.value.start_date) return true
    return new Date(v) > new Date(promotion.value.start_date) || 'Thời gian kết thúc phải sau thời gian bắt đầu'
  }
}

// Computed
const availableProducts = computed(() => {
  const products = store.getters['promotions/productsWithoutPromotion'] || []
  // Thêm các sản phẩm hiện tại của promotion vào danh sách available
  const currentProducts = store.getters['promotions/promotion']?.products || []
  return [...products, ...currentProducts]
})

const selectedProducts = computed(() => {
  return availableProducts.value.filter(p => promotion.value.product_ids.includes(p.id))
})

const currentPromotionProducts = computed(() => {
  return store.getters['promotions/promotion']?.products?.map(p => p.id) || []
})

const newSelectedProducts = computed(() => {
  return selectedProducts.value.filter(p => !currentPromotionProducts.value.includes(p.id))
})

// Methods
const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const calculateDiscountedPrice = (originalPrice) => {
  if (!promotion.value.discount_value) return originalPrice
  
  if (promotion.value.discount_type === 'percentage') {
    const discountAmount = (originalPrice * promotion.value.discount_value) / 100
    return originalPrice - discountAmount
  } else {
    return Math.max(0, originalPrice - promotion.value.discount_value)
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const formatDateTimeForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
}

// Thêm method xử lý xóa sản phẩm
const handleRemoveProduct = async (product) => {
  try {
    removingProductId.value = product.id
    
    await store.dispatch('promotions/removeProductFromPromotion', {
      promotionId: route.params.id,
      productId: product.id
    })

    showMessage('Gỡ sản phẩm thành công')
    
    // Cập nhật lại danh sách product_ids
    promotion.value.product_ids = promotion.value.product_ids
      .filter(id => id !== product.id)

    // Refresh lại danh sách sản phẩm available
    await store.dispatch('promotions/fetchProductsWithoutPromotion')

  } catch (error) {
    console.error('Remove product error:', error)
    showMessage(error.message, 'error')
  } finally {
    removingProductId.value = null
  }
}

// Thêm method xóa sản phẩm mới
const removeNewProduct = (productId) => {
  promotion.value.product_ids = promotion.value.product_ids
    .filter(id => id !== productId)
}

// Submit
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) {
    showMessage('Vui lòng điền đầy đủ thông tin', 'error')
    return
  }

  try {
    isSubmitting.value = true

    const formData = {
      ...promotion.value,
      discount_value: +promotion.value.discount_value
    }

    await store.dispatch('promotions/updatePromotion', {
      id: route.params.id,
      data: formData
    })
    
    showMessage('Cập nhật khuyến mãi thành công')
    router.push({ name: 'admin-promotions' })

  } catch (error) {
    console.error('Update error:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khuyến mãi',
      'error'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Load data
onMounted(async () => {
  try {
    // Fetch promotion data
    await store.dispatch('promotions/fetchPromotion', route.params.id)
    await store.dispatch('promotions/fetchProductsWithoutPromotion')
    
    const promotionData = store.getters['promotions/promotion']

    if (!promotionData) {
      throw new Error('Không thể ti dữ liệu khuyến mãi')
    }

    // Format dates for datetime-local input
    promotion.value = {
      name: promotionData.name || '',
      description: promotionData.description || '',
      discount_type: promotionData.discount_type || 'percentage',
      discount_value: Number(promotionData.discount_value) || 0,
      start_date: formatDateTimeForInput(promotionData.start_date),
      end_date: formatDateTimeForInput(promotionData.end_date),
      is_active: promotionData.is_active ?? true,
      product_ids: promotionData.products?.map(p => p.id) || []
    }

  } catch (error) {
    console.error('Error loading promotion:', error)
    showMessage('Có lỗi khi tải thông tin khuyến mãi', 'error')
  }
})
</script>

<style scoped>
.rounded-lg {
  border-radius: 8px;
}

.hover-row:hover {
  background-color: rgb(var(--v-theme-grey-lighten-4)) !important;
}

/* Thêm border mỏng cho bảng */
:deep(.v-table) {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Style cho header */
:deep(.v-table thead tr) {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Style cho các ô */
:deep(.v-table td) {
  padding: 8px 16px !important;
}
</style>
