<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header -->
      <v-toolbar color="transparent" flat>
        <v-tooltip location="bottom" text="Quay lại trang danh sách">
          <template v-slot:activator="{ props }">
            <v-btn
              :to="{ name: 'admin-discounts' }"
              icon="mdi-arrow-left"
              variant="text"
              v-bind="props"
            ></v-btn>
          </template>
        </v-tooltip>
        
        <v-toolbar-title class="text-h6 ml-2">
          Chỉnh sửa mã giảm giá
        </v-toolbar-title>
      </v-toolbar>

      <v-divider></v-divider>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text>
          <v-row>
            <!-- Thông tin mã giảm giá -->
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4 pb-0">
                  Thông tin mã giảm giá
                </v-card-title>
                
                <v-card-text class="px-4">
                  <v-row>
                    <!-- Mã giảm giá -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="discount.code"
                        label="Mã giảm giá"
                        placeholder="Nhập mã giảm giá"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        hide-details="auto"
                        class="mb-3"
                        disabled
                      ></v-text-field>
                    </v-col>

                    <!-- Loại giảm giá -->
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="discount.discount_type"
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
                        v-model="discount.discount_value"
                        type="number"
                        :min="0"
                        :max="discount.discount_type === 'percentage' ? 100 : null"
                        label="Giá trị giảm"
                        :prefix="discount.discount_type === 'fixed' ? '₫' : ''"
                        :suffix="discount.discount_type === 'percentage' ? '%' : ''"
                        variant="outlined"
                        density="comfortable"
                        :rules="[
                          rules.required,
                          rules.minValue(0),
                          ...(discount.discount_type === 'percentage' ? [rules.maxValue(100)] : [])
                        ]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>

                    <!-- Giá trị đơn hàng tối thiểu -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="discount.min_order_value"
                        type="number"
                        :min="0"
                        label="Giá trị đơn hàng tối thiểu"
                        prefix="₫"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required, rules.minValue(0)]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>

                    <!-- Số lượt sử dụng tối đa -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="discount.usage_limit"
                        type="number"
                        :min="1"
                        label="Số lượt sử dụng tối đa"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required, rules.minValue(1)]"
                        hide-details="auto"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>

                    <!-- Thời gian bắt đầu -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="discount.start_date"
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
                        v-model="discount.end_date"
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
                        v-model="discount.is_active"
                        color="success"
                        label="Kích hoạt mã giảm giá"
                        hide-details
                        class="mb-3"
                      ></v-switch>
                    </v-col>
                  </v-row>
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
            :to="{ name: 'admin-discounts' }"
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
import { ref, onMounted } from 'vue'
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

const discount = ref({
  code: '',
  discount_type: 'percentage',
  discount_value: null,
  min_order_value: null,
  usage_limit: null,
  start_date: '',
  end_date: '',
  is_active: true
})

// Validation Rules
const rules = {
  required: v => !!v || 'Trường này là bắt buộc',
  minValue: min => v => v >= min || `Giá trị tối thiểu là ${min}`,
  maxValue: max => v => v <= max || `Giá trị tối đa là ${max}`,
  endDateAfterStart: v => {
    if (!v || !discount.value.start_date) return true
    return new Date(v) > new Date(discount.value.start_date) || 'Thời gian kết thúc phải sau thời gian bắt đầu'
  }
}

// Methods
const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const formatDateTimeForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
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
      ...discount.value,
      discount_value: +discount.value.discount_value,
      min_order_value: +discount.value.min_order_value,
      usage_limit: +discount.value.usage_limit
    }

    await store.dispatch('discounts/updateDiscount', {
      id: route.params.id,
      data: formData
    })
    
    showMessage('Cập nhật mã giảm giá thành công')
    router.push({ name: 'admin-discounts' })

  } catch (error) {
    console.error('Update error:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật mã giảm giá',
      'error'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Load data
onMounted(async () => {
  try {
    // Fetch discount data
    await store.dispatch('discounts/fetchDiscount', route.params.id)
    
    const discountData = store.getters['discounts/discount']

    if (!discountData) {
      throw new Error('Không thể tải dữ liệu mã giảm giá')
    }

    // Format dates for datetime-local input
    discount.value = {
      code: discountData.code || '',
      discount_type: discountData.discount_type || 'percentage',
      discount_value: Number(discountData.discount_value) || 0,
      min_order_value: Number(discountData.min_order_value) || 0,
      usage_limit: Number(discountData.usage_limit) || 1,
      start_date: formatDateTimeForInput(discountData.start_date),
      end_date: formatDateTimeForInput(discountData.end_date),
      is_active: discountData.is_active ?? true
    }

  } catch (error) {
    console.error('Error loading discount:', error)
    showMessage('Có lỗi khi tải thông tin mã giảm giá', 'error')
  }
})
</script>
