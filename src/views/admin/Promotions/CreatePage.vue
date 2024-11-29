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
          Thêm khuyến mãi mới
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

                    <!-- Thời gian bắt đầu -->
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

                    <!-- Thời gian kết thúc -->
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
                      ></v-chip>
                    </template>
                  </v-select>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Thêm vào sau phần chọn sản phẩm -->
            <v-col cols="12" md="12">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4 pb-0">
                  Bảng tính giá sau khuyến mãi
                </v-card-title>

                <v-card-text class="px-4">
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th class="text-right">Hình ảnh</th>
                        <th class="text-right">Giá gốc</th>
                        <th class="text-right">Giá KM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="product in selectedProducts" :key="product.id">
                        <td>{{ product.name }}</td>
                        <td class="text-right">
                          <v-img
                            :src="product.image_url"
                            width="50"
                            height="50"
                          ></v-img>
                        </td>
                        <td class="text-right">{{ formatCurrency(product.price) }}</td>
                        <td class="text-right text-success">
                          {{ formatCurrency(calculateDiscountedPrice(product.price)) }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>

                  <div v-if="!selectedProducts.length" class="text-center py-4 text-grey">
                    Chưa có sản phẩm được chọn
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
            Tạo khuyến mãi
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
import { useRouter } from 'vue-router'

// Store & Router
const store = useStore()
const router = useRouter()

// Refs
const form = ref(null)

// Data
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
const availableProducts = computed(() => store.getters['promotions/productsWithoutPromotion'])

const selectedProducts = computed(() => {
  return availableProducts.value.filter(p => promotion.value.product_ids.includes(p.id))
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

    await store.dispatch('promotions/createPromotion', formData)
    
    showMessage('Tạo khuyến mãi thành công')
    router.push({ name: 'admin-promotions' })

  } catch (error) {
    console.error('Create error:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi tạo khuyến mãi',
      'error'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle Hooks
onMounted(async () => {
  try {
    await store.dispatch('promotions/fetchProductsWithoutPromotion')
  } catch (error) {
    console.error('Error loading products:', error)
    showMessage('Có lỗi khi tải danh sách sản phẩm', 'error')
  }
})
</script>
