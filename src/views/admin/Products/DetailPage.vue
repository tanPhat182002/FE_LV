<template>
  <v-card>
    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>

    <!-- Header -->
    <v-card-title class="d-flex align-center">
      Chi tiết sản phẩm
      <v-spacer />
      <v-btn
        color="primary"
        :to="{ name: 'admin-products-edit', params: { id: route.params.id }}"
        prepend-icon="mdi-pencil"
      >
        Chỉnh sửa
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Basic Info -->
      <v-card class="mb-4">
        <v-card-title>Thông tin cơ bản</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-tag</v-icon>
                </template>
                <v-list-item-title>Tên sản phẩm</v-list-item-title>
                <v-list-item-subtitle>{{ product?.name || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-currency-usd</v-icon>
                </template>
                <v-list-item-title>Giá</v-list-item-title>
                <v-list-item-subtitle>{{ formatPrice(product?.price) }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-domain</v-icon>
                </template>
                <v-list-item-title>Thương hiệu</v-list-item-title>
                <v-list-item-subtitle>{{ product?.brand?.name || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-shape</v-icon>
                </template>
                <v-list-item-title>Danh mục</v-list-item-title>
                <v-list-item-subtitle>{{ product?.category?.name || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-text</v-icon>
                </template>
                <v-list-item-title>Mô tả</v-list-item-title>
                <v-list-item-subtitle>{{ product?.description || 'Không có mô tả' }}</v-list-item-subtitle>
              </v-list-item>
            </v-col>

            <v-col cols="12">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :color="product?.is_active ? 'success' : 'error'">
                    {{ product?.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>
                <v-list-item-title>Trạng thái</v-list-item-title>
                <v-list-item-subtitle>
                  {{ product?.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Variants -->
      <v-card class="mb-4">
        <v-card-title>Biến thể sản phẩm</v-card-title>
        <v-card-text>
          <v-table v-if="product?.variants?.length">
            <thead>
              <tr>
                <th>Màu sắc</th>
                <th>Kích cỡ</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="variant in product.variants" :key="variant.id">
                <td>
                  <v-chip :color="variant.color?.hex_code" size="small">
                    {{ variant.color?.name }}
                  </v-chip>
                </td>
                <td>{{ variant.size?.name }}</td>
                <td>{{ variant.stock_quantity }}</td>
                <td>
                  <v-chip
                    :color="variant.stock_quantity > 0 ? 'success' : 'error'"
                    size="small"
                  >
                    {{ variant.stock_quantity > 0 ? 'Còn hàng' : 'Hết hàng' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            class="mt-2"
          >
            Sản phẩm chưa có biến thể nào
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Images -->
      <v-card>
        <v-card-title>Hình ảnh sản phẩm</v-card-title>
        <v-card-text>
          <v-row v-if="product?.images?.length">
            <v-col
              v-for="image in product.images"
              :key="image.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-img
                :src="image.full_url"
                aspect-ratio="1"
                cover
                class="rounded-lg"
              />
            </v-col>
          </v-row>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            class="mt-2"
          >
            Sản phẩm chưa có hình ảnh nào
          </v-alert>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()

const loading = ref(false)
const product = ref(null)

// Format price with VND currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0)
}

// Fetch product data
const fetchProduct = async () => {
  loading.value = true
  try {
    await store.dispatch('products/fetchProduct', route.params.id)
    const response = store.getters['products/product']
    if (!response?.data) {
      throw new Error('Không thể tải dữ liệu sản phẩm')
    }
    product.value = response.data
  } catch (error) {
    console.error('Error loading product:', error)
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.rounded-lg {
  border-radius: 8px;
}
</style>