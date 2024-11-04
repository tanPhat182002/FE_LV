<template>
  <v-container>
    <v-row>
      <!-- Cart Items Section -->
      <v-col cols="12" md="8">
        <v-card v-if="cartItems.length">
          <v-card-title class="text-h5 px-4 py-3 bg-grey-lighten-4">
            Giỏ hàng của bạn ({{ cartItems.length }} sản phẩm)
          </v-card-title>

          <v-card-text class="pa-0">
            <v-list lines="three">
              <template v-for="(item, index) in cartItems" :key="item.id">
                <v-list-item>
                  <template #prepend>
                    <v-checkbox
                      v-model="selectedItems"
                      :value="item.id"
                      hide-details
                      class="mt-0"
                    />
                    <v-img
                      :src="item.image"
                      width="100"
                      height="100"
                      cover
                      class="rounded ma-2"
                    />
                  </template>

                  <v-list-item-title class="text-subtitle-1 font-weight-bold mb-1">
                    {{ item.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="mb-1">
                    <div class="d-flex align-center">
                      <v-chip size="small" class="mr-2">
                        Màu: {{ item.color }}
                      </v-chip>
                      <v-chip size="small">
                        Size: {{ item.size }}
                      </v-chip>
                    </div>
                  </v-list-item-subtitle>

                  <v-list-item-subtitle>
                    <div class="d-flex align-center">
                      <span class="text-error font-weight-bold">{{ formatPrice(item.price) }}</span>
                      <template v-if="item.originalPrice > item.price">
                        <span class="text-decoration-line-through text-grey mx-2">
                          {{ formatPrice(item.originalPrice) }}
                        </span>
                        <v-chip color="error" size="x-small">
                          -{{ calculateDiscount(item.price, item.originalPrice) }}%
                        </v-chip>
                      </template>
                    </div>
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="d-flex flex-column align-end">
                      <!-- Quantity Control -->
                      <div class="d-flex align-center mb-2">
                        <v-btn
                          icon="mdi-minus"
                          variant="tonal"
                          size="x-small"
                          :disabled="item.quantity <= 1"
                          @click="decreaseQuantity(item)"
                        />
                        
                        <v-text-field
                          v-model="item.quantity"
                          type="number"
                          density="compact"
                          hide-details
                          class="quantity-input mx-2"
                          variant="outlined"
                          min="1"
                          :max="item.maxQuantity"
                          @update:model-value="value => handleQuantityChange(item, value)"
                          @blur="validateQuantity(item)"
                        />
                        
                        <v-btn
                          icon="mdi-plus"
                          variant="tonal"
                          size="x-small"
                          :disabled="item.quantity >= item.maxQuantity"
                          @click="increaseQuantity(item)"
                        />
                      </div>

                      <v-btn
                        color="error"
                        variant="text"
                        density="compact"
                        prepend-icon="mdi-delete"
                        @click="removeItem(item)"
                      >
                        Xóa
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>

                <v-divider v-if="index < cartItems.length - 1" />
              </template>
            </v-list>
          </v-card-text>

          <v-card-actions class="pa-4 bg-grey-lighten-4">
            <v-checkbox
              :model-value="isAllSelected"
              label="Chọn tất cả"
              hide-details
              @click="toggleSelectAll"
            />
            <v-spacer />
            <v-btn
              color="error"
              variant="text"
              :disabled="!selectedItems.length"
              prepend-icon="mdi-delete"
              @click="removeSelectedItems"
            >
              Xóa đã chọn
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card v-else class="text-center pa-8">
          <v-icon size="64" color="grey" class="mb-4">mdi-cart-outline</v-icon>
          <div class="text-h6 mb-4">Giỏ hàng trống</div>
          <v-btn color="primary" to="/">Tiếp tục mua sắm</v-btn>
        </v-card>
      </v-col>

      <!-- Order Summary Section -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-h6 px-4 py-3 bg-grey-lighten-4">
            Tóm tắt đơn hàng
          </v-card-title>

          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between mb-2">
              <span>Tạm tính</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>

            <div class="d-flex justify-space-between mb-2">
              <span>Giảm giá</span>
              <span class="text-error">-{{ formatPrice(discount) }}</span>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex justify-space-between text-subtitle-1 font-weight-bold">
              <span>Tổng tiền</span>
              <span class="text-error">{{ formatPrice(total) }}</span>
            </div>

            <v-btn
              block
              color="error"
              size="large"
              class="mt-6"
              :disabled="!selectedItems.length"
              @click="checkout"
            >
              Thanh toán
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          {{ confirmDialog.title }}
        </v-card-title>

        <v-card-text>
          {{ confirmDialog.message }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="confirmDialog.show = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="confirmDialog.onConfirm"
          >
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composable/useCart'

const router = useRouter()
const { cartItems, updateQuantity, removeFromCart, removeMultipleItems } = useCart()

// Reactive State
const selectedItems = ref([])
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null
})
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed Properties
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0)
})

const discount = computed(() => {
  return cartItems.value.reduce((sum, item) => 
    sum + ((item.originalPrice - item.price) * item.quantity), 0)
})

const total = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const isAllSelected = computed(() => {
  return cartItems.value.length > 0 && selectedItems.value.length === cartItems.value.length
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const calculateDiscount = (price, originalPrice) => {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const validateQuantity = (item) => {
  const numValue = parseInt(item.quantity)
  
  if (isNaN(numValue) || numValue < 1) {
    updateQuantity(item.id, 1)
    return
  }
  
  if (numValue > item.maxQuantity) {
    updateQuantity(item.id, item.maxQuantity)
    return
  }

  updateQuantity(item.id, numValue)
}

const handleQuantityChange = (item, value) => {
  const numValue = parseInt(value)
  if (isNaN(numValue)) return
  
  if (numValue < 1) {
    item.quantity = 1
    return
  }
  
  if (numValue > item.maxQuantity) {
    item.quantity = item.maxQuantity
    return
  }
  
  updateQuantity(item.id, numValue)
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    updateQuantity(item.id, item.quantity - 1)
  }
}

const increaseQuantity = (item) => {
  if (item.quantity < item.maxQuantity) {
    updateQuantity(item.id, item.quantity + 1)
  }
}

const removeItem = (item) => {
  confirmDialog.value = {
    show: true,
    title: 'Xóa sản phẩm',
    message: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
    onConfirm: () => {
      removeFromCart(item.id)
      selectedItems.value = selectedItems.value.filter(id => id !== item.id)
      showMessage('Đã xóa sản phẩm khỏi giỏ hàng')
      confirmDialog.value.show = false
    }
  }
}

const removeSelectedItems = () => {
  if (!selectedItems.value.length) return
  
  confirmDialog.value = {
    show: true,
    title: 'Xóa sản phẩm đã chọn',
    message: 'Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi giỏ hàng?',
    onConfirm: () => {
      removeMultipleItems(selectedItems.value)
      selectedItems.value = []
      showMessage('Đã xóa sản phẩm khỏi giỏ hàng')
      confirmDialog.value.show = false
    }
  }
}

const toggleSelectAll = () => {
  selectedItems.value = isAllSelected.value ? [] : cartItems.value.map(item => item.id)
}

const checkout = () => {
  if (!selectedItems.value.length) return
  
  const checkoutItems = cartItems.value
    .filter(item => selectedItems.value.includes(item.id))
  
  console.log('Checkout items:', checkoutItems)
  showMessage('Đặt hàng thành công')
  
  // Clear checked items
  removeMultipleItems(selectedItems.value)
  selectedItems.value = []
  
  router.push('/checkout/success')
}

// Watchers
watch(cartItems, () => {
  // Update selected items when cart changes
  selectedItems.value = selectedItems.value.filter(id => 
    cartItems.value.some(item => item.id === id)
  )
}, { deep: true })
</script>

<style scoped>
.quantity-input {
  width: 60px !important;
}

.quantity-input :deep(input) {
  text-align: center !important;
  padding: 0 !important;
}

/* Hide number input spinners */
.quantity-input :deep(input[type=number]) {
  -moz-appearance: textfield;
}

.quantity-input :deep(input[type=number]::-webkit-outer-spin-button),
.quantity-input :deep(input[type=number]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.v-list-item {
  padding: 16px;
}

@media (max-width: 600px) {
  .v-list-item {
    padding: 12px;
  }
  
  .v-list-item-title {
    font-size: 0.9rem !important;
  }
  
  .v-list-item__prepend {
    min-width: 100px !important;
  }

  .quantity-input {
    width: 50px !important;
  }
}
</style>