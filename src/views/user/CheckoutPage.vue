<template>
  <v-container :class="containerClass">
    <v-row :class="rowSpacing">
      <!-- Shipping Information -->
      <v-col cols="12" md="8" :class="colSpacing">
        <v-card class="mb-4">
          <v-card-title :class="['bg-grey-lighten-4', titleClass]">
            Thông tin giao hàng
          </v-card-title>

          <v-card-text :class="contentPadding">
            <v-form ref="form">
              <v-row :class="formRowSpacing">
                <!-- Name -->
                <v-col cols="12" :class="formColSpacing">
                  <v-text-field
                    v-model="orderInfo.name"
                    label="Họ và tên"
                    variant="outlined"
                    :density="inputDensity"
                    :rules="[rules.required]"
                  />
                </v-col>

                <!-- Phone & Email -->
                <v-col cols="12" md="6" :class="formColSpacing">
                  <v-text-field
                    v-model="orderInfo.phone"
                    label="Số điện thoại"
                    variant="outlined"
                    :density="inputDensity"
                    :rules="[rules.required, rules.phone]"
                  />
                </v-col>

                <v-col cols="12" md="6" :class="formColSpacing">
                  <v-text-field
                    v-model="orderInfo.email"
                    label="Email"
                    variant="outlined"
                    :density="inputDensity"
                    :rules="[rules.required, rules.email]"
                  />
                </v-col>

                <!-- Address -->
                <v-col cols="12" :class="formColSpacing">
                  <div class="address-search-container">
                    <v-text-field
                      v-model="orderInfo.address"
                      label="Địa chỉ giao hàng"
                      variant="outlined"
                      :density="inputDensity"
                      :rules="[rules.required]"
                      @input="handleAddressInput"
                      @click:append-inner="clearAddress"
                      append-inner-icon="mdi-close"
                      placeholder="Nhập địa chỉ của bạn"
                      ref="addressInput"
                      class="address-input"
                      hide-details
                    />
                    
                    <div v-if="showAddressResults" class="address-results">
                      <div
                        v-for="place in addressResults"
                        :key="place.place_id"
                        class="address-result-item"
                        @click="selectAddress(place)"
                      >
                        <div class="main-text">
                          <v-icon color="primary" size="20" class="mr-2">mdi-map-marker</v-icon>
                          {{ place.structured_formatting.main_text }}
                        </div>
                        <div class="secondary-text">
                          {{ place.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Order Items -->
        <v-card>
          <v-card-title :class="['bg-grey-lighten-4', titleClass]">
            Sản phẩm đặt mua
          </v-card-title>

          <v-card-text class="pa-0">
            <v-list :lines="listLines">
              <template v-for="(item, index) in selectedItems" :key="item.id">
                <v-list-item>
                  <template #prepend>
                    <v-img
                      :src="item.image"
                      :width="imageSize"
                      :height="imageSize"
                      cover
                      class="rounded ma-2"
                    />
                  </template>

                  <v-list-item-title :class="itemTitleClass">
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="mb-1">
                    <div class="d-flex align-center flex-wrap gap-2">
                      <v-chip :size="chipSize" class="mr-2">
                        Màu: {{ item.color }}
                      </v-chip>
                      <v-chip :size="chipSize">
                        Size: {{ item.size }}
                      </v-chip>
                    </div>
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="d-flex flex-column align-end">
                      <span :class="['text-error font-weight-bold mb-1', priceClass]">
                        {{ formatPrice(item.price) }}
                      </span>
                      <span class="text-grey">
                        Số lượng: {{ item.quantity }}
                      </span>
                    </div>
                  </template>
                </v-list-item>

                <v-divider v-if="index < selectedItems.length - 1" />
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Order Summary -->
      <v-col cols="12" md="4" :class="colSpacing">
        <v-card>
          <v-card-title :class="['bg-grey-lighten-4', titleClass]">
            Tóm tắt đơn hàng
          </v-card-title>

          <v-card-text :class="contentPadding">
            <!-- Subtotal -->
            <div class="d-flex justify-space-between mb-2">
              <span>Tạm tính</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>

            <!-- Discount Code -->
            <v-text-field
              v-model="discountCode"
              label="Mã giảm giá"
              variant="outlined"
              density="comfortable"
              hide-details
              class="my-2"
              :append-inner-icon="discountCode ? 'mdi-close' : ''"
              :append-icon="!isApplyingDiscount ? 'mdi-check' : 'mdi-loading mdi-spin'"
              @click:append-inner="clearDiscount"
              @click:append="applyDiscount"
              @keyup.enter="applyDiscount"
            />

            <!-- Discount Amount -->
            <div v-if="discount > 0" class="d-flex justify-space-between mb-2 mt-4">
              <span>Giảm giá</span>
              <span class="text-error">-{{ formatPrice(discount) }}</span>
            </div>

            <v-divider class="my-4" />

            <!-- Total -->
            <div class="d-flex justify-space-between text-subtitle-1 font-weight-bold">
              <span>Tổng tiền</span>
              <span class="text-error">{{ formatPrice(total) }}</span>
            </div>

            <!-- Payment Methods -->
            <v-radio-group v-model="orderInfo.payment_method" class="mt-4">
              <template #label>
                <div class="text-subtitle-2 mb-2">Phương thức thanh toán</div>
              </template>
              
              <v-radio value="cod" label="Thanh toán khi nhận hàng" />
              <v-radio value="vnpay" label="Thanh toán qua VNPAY" />
             
              <v-radio value="momo" label="Ví MoMo" />
            </v-radio-group>

            <!-- Place Order Button -->
            <v-btn
              block
              color="error"
              size="large"
              class="mt-6"
              :loading="isProcessing"
              @click="placeOrder"
            >
              Đặt hàng
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="2000"
      location="top right"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useCart } from '@/composable/useCart'
import { useDisplay } from 'vuetify'

const router = useRouter()
const store = useStore()
const { removeMultipleItems } = useCart()
const display = useDisplay()

// Form ref
const form = ref(null)

// Reactive State
const selectedItems = ref([])
const discountCode = ref('')
const discount = ref(0)
const discountCodeId = ref(null)
const isApplyingDiscount = ref(false)
const isProcessing = ref(false)

const orderInfo = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  payment_method: 'cod'
})

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Thêm các biến cho tìm kiếm địa chỉ
const addressResults = ref([])
const showAddressResults = ref(false)
const addressSearchTimeout = ref(null)
const API_KEY = 'fz6Wo5XE0CVjom5qYXfbJ2t0BDw6efT46nGiDj5U'

// Validation Rules
const rules = {
  required: v => !!v || 'Trường này là bắt buộc',
  email: v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
  phone: v => /^[0-9]{10}$/.test(v) || 'Số điện thoại không hợp lệ'
}

// Computed
const subtotal = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const total = computed(() => {
  return subtotal.value - discount.value
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const clearDiscount = () => {
  discountCode.value = ''
  discount.value = 0
  discountCodeId.value = null
}

const applyDiscount = async () => {
  if (!discountCode.value || isApplyingDiscount.value) return

  try {
    isApplyingDiscount.value = true
    
    const response = await store.dispatch('discounts/applyDiscount', {
      code: discountCode.value,
      total_amount: subtotal.value
    })
    
    console.log('Discount Response:', response) // Debug log
    
    if (response.success && response.data) {
      discount.value = response.data.discount_amount || 0
      discountCodeId.value = response.data.discount_code_id// Đảm bảo response trả về id của discount code
      
      console.log('Discount State:', {
        code: discountCode.value,
        id: discountCodeId.value,
        amount: discount.value
      }) // Debug log để kiểm tra giá trị
      
      showMessage('Áp dụng mã giảm giá thành công')
    }
  } catch (error) {
    console.error('Discount Error:', error) // Log lỗi chi tiết
    showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi áp dụng mã giảm giá', 'error')
    clearDiscount()
  } finally {
    isApplyingDiscount.value = false
  }
}

const placeOrder = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) {
    showMessage('Vui lòng điền đầy đủ thông tin', 'error')
    return
  }

  try {
    isProcessing.value = true

    const orderData = {
      user_id: store.getters['user/currentUser'].id,
      name: orderInfo.value.name,
      email: orderInfo.value.email,
      phone: orderInfo.value.phone,
      address: orderInfo.value.address,
      payment_method: orderInfo.value.payment_method,
      items: selectedItems.value.map(item => ({
        product_variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: subtotal.value,
      total_amount: total.value,
      discount_amount: discount.value || 0
    }

    // Kiểm tra và log discount code id
    console.log('Current Discount State:', {
      code: discountCode.value,
      id: discountCodeId.value,
      amount: discount.value
    })

    if (discountCodeId.value) {
      orderData.discount_code_id = discountCodeId.value
      console.log('Adding discount_code_id to order:', discountCodeId.value)
    }

    console.log('Final Order Data:', orderData)

    const response = await store.dispatch('order/createOrder', orderData)
    
    if (response.success) {
      // Remove purchased items from cart
      const purchasedItemIds = selectedItems.value.map(item => item.id)
      await removeMultipleItems(purchasedItemIds)
      
      if (['vnpay', 'momo'].includes(orderInfo.value.payment_method)) {
        // Lưu order ID vào localStorage để xử lý sau khi thanh toán
        localStorage.setItem('pending_order_id', response.order.id)
        
      
        
        // Thêm timeout ngắn để đảm bảo localStorage được set
        setTimeout(() => {
          // Chuyển hướng đến trang thanh toán
          window.location.replace(response.payment_url)
        }, 100)
        return
      }
      
      showMessage('Đặt hàng thành công')
      router.push('/orders')
    }
  } catch (error) {
    console.error('Order creation error:', error)
    showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng', 'error')
  } finally {
    isProcessing.value = false
  }
}

// Xử lý input địa chỉ
const handleAddressInput = async () => {
  if (addressSearchTimeout.value) {
    clearTimeout(addressSearchTimeout.value)
  }

  const value = orderInfo.value.address
  
  if (!value || !value.trim()) {
    showAddressResults.value = false
    return
  }

  addressSearchTimeout.value = setTimeout(async () => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/place/autocomplete?api_key=${API_KEY}&input=${encodeURIComponent(value)}`
      )
      const data = await response.json()
      
      if (data.status === 'OK') {
        addressResults.value = data.predictions
        showAddressResults.value = true
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }, 300)
}

// Chọn địa chỉ từ kết quả
const selectAddress = (place) => {
  orderInfo.value.address = place.description
  showAddressResults.value = false
}

// Clear địa chỉ
const clearAddress = () => {
  orderInfo.value.address = ''
  showAddressResults.value = false
}

onMounted(() => {
  // Check if user is logged in
  const isAuthenticated = store.getters['user/isAuthenticated']
  if (!isAuthenticated) {
    router.push({
      name: 'login',
      query: { redirect: '/checkout' }
    })
    return
  }

  // Check for items in localStorage
  const savedItems = localStorage.getItem('checkoutItems')
  if (!savedItems) {
    router.push('/cart')
    return
  }
  
  selectedItems.value = JSON.parse(savedItems)
  
  // Get logged in user info
  const currentUser = store.getters['user/currentUser']
  if (currentUser) {
    orderInfo.value = {
      ...orderInfo.value,
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      address: currentUser.address || ''
    }
  }
  
  // Clear saved items after loading
  localStorage.removeItem('checkoutItems')

  // Thêm event listener để đóng kết quả khi click ra ngoài
  document.addEventListener('click', (e) => {
    const addressContainer = document.querySelector('.address-search-container')
    if (addressContainer && !addressContainer.contains(e.target)) {
      showAddressResults.value = false
    }
  })
})

// Responsive computed properties
const containerClass = computed(() => ({
  'px-4': display.mdAndUp.value,
  'px-2': display.sm.value,
  'px-0': display.xs.value
}))

const rowSpacing = computed(() => ({
  'mx-n4': display.mdAndUp.value,
  'mx-n3': display.sm.value,
  'mx-n2': display.xs.value
}))

const colSpacing = computed(() => ({
  'pa-4': display.mdAndUp.value,
  'pa-3': display.sm.value,
  'pa-2': display.xs.value
}))

const titleClass = computed(() => ({
  'text-h5 px-6 py-4': display.mdAndUp.value,
  'text-h6 px-4 py-3': display.sm.value,
  'text-subtitle-1 px-3 py-2': display.xs.value
}))

const contentPadding = computed(() => ({
  'pa-6': display.mdAndUp.value,
  'pa-4': display.sm.value,
  'pa-3': display.xs.value
}))

const formRowSpacing = computed(() => ({
  'mx-n4': display.mdAndUp.value,
  'mx-n3': display.sm.value,
  'mx-n2': display.xs.value
}))

const formColSpacing = computed(() => ({
  'pa-4': display.mdAndUp.value,
  'pa-3': display.sm.value,
  'pa-2': display.xs.value
}))

const inputDensity = computed(() => 
  display.mdAndUp.value ? 'comfortable' : 'compact'
)

const listLines = computed(() =>
  display.mdAndUp.value ? 'three' : 'two'
)

const imageSize = computed(() => 
  display.mdAndUp.value ? 80 : 60
)

const chipSize = computed(() =>
  display.mdAndUp.value ? 'small' : 'x-small'
)

const itemTitleClass = computed(() => ({
  'text-subtitle-1': display.mdAndUp.value,
  'text-subtitle-2': display.sm.value,
  'text-body-2': display.xs.value,
  'font-weight-bold mb-1': true
}))

const priceClass = computed(() => ({
  'text-h6': display.mdAndUp.value,
  'text-subtitle-1': display.sm.value,
  'text-subtitle-2': display.xs.value
}))
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

@media (max-width: 959px) {
  .v-card {
    border-radius: 8px;
  }
}

@media (max-width: 599px) {
  .v-card {
    border-radius: 4px;
  }
  
  .gap-2 {
    gap: 8px;
  }
}

.address-search-container {
  position: relative;
  width: 100%;
}

/* Style cho input địa chỉ */
.address-input :deep(.v-field__input) {
  font-size: 18px !important;
  padding: 20px 24px !important;
  min-height: 64px !important;
}

/* Style cho dropdown kết quả */
.address-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 500px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  margin-top: 8px;
  width: 100%;
}

/* Style cho từng item kết quả */
.address-result-item {
  padding: 24px 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.address-result-item:last-child {
  border-bottom: none;
}

.address-result-item:hover {
  background-color: #f5f5f5;
}

/* Style cho text trong kết quả */
.main-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  line-height: 1.6;
}

.secondary-text {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  padding-left: 36px;
}

.location-icon {
  min-width: 28px;
  margin-right: 12px;
  font-size: 24px !important;
}

/* Custom scrollbar */
.address-results::-webkit-scrollbar {
  width: 8px;
}

.address-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.address-results::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.address-results::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

/* Responsive styles */
@media (max-width: 600px) {
  .address-input :deep(.v-field__input) {
    font-size: 16px !important;
    padding: 16px 20px !important;
    min-height: 60px !important;
  }
  
  .address-result-item {
    padding: 20px 24px;
    min-height: 90px;
  }
  
  .main-text {
    font-size: 16px;
  }
  
  .secondary-text {
    font-size: 14px;
    padding-left: 32px;
  }
}
</style>
