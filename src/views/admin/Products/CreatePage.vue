<template>
  <v-container fluid class="pa-0">
    <v-card>
      <!-- Header -->
      <v-toolbar color="transparent" flat>
        <v-tooltip location="bottom" text="Quay lại trang danh sách">
          <template v-slot:activator="{ props }">
            <v-btn
              :to="{ name: 'admin-products' }"
              icon="mdi-arrow-left"
              variant="text"
              v-bind="props"
            ></v-btn>
          </template>
        </v-tooltip>
        
        <v-toolbar-title class="text-h6 ml-2">
          Thêm sản phẩm mới
        </v-toolbar-title>
      </v-toolbar>

      <v-divider></v-divider>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text>
          <v-row>
            <!-- Cột trái - Thông tin cơ bản -->
            <v-col cols="12" md="8">
              <div class="d-flex flex-column gap-6">
                <!-- Thông tin cơ bản -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4 pb-0">
                    Thông tin sản phẩm
                  </v-card-title>
                  
                  <v-card-text class="px-4">
                    <v-row>
                      <!-- Tên sản phẩm -->
                      <v-col cols="12">
                        <v-text-field
                          v-model="product.name"
                          label="Tên sản phẩm"
                          placeholder="Nhập tên sản phẩm"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          :rules="[rules.required]"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>

                      <!-- Giá bán -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="product.price"
                          type="number"
                          min="0"
                          label="Giá bán"
                          placeholder="Nhập giá bán"
                          variant="outlined"
                          density="comfortable"
                          prefix="₫"
                          :rules="[rules.required, rules.minValue(0)]"
                          hide-details="auto"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>

                      <!-- Danh mục -->
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="product.category_id"
                          :items="categories"
                          item-title="name"
                          item-value="id"
                          label="Danh mục"
                          placeholder="Chọn danh mục"
                          variant="outlined"
                          density="comfortable"
                          :rules="[rules.required]"
                          hide-details="auto"
                          class="mb-3"
                        ></v-select>
                      </v-col>

                      <!-- Thương hiệu -->
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="product.brand_id"
                          :items="brands"
                          item-title="name"
                          item-value="id"
                          label="Thương hiệu"
                          placeholder="Chọn thương hiệu"
                          variant="outlined"
                          density="comfortable"
                          :rules="[rules.required]"
                          hide-details="auto"
                          class="mb-3"
                        ></v-select>
                      </v-col>

                      <!-- Trạng thái -->
                      <v-col cols="12" md="6">
                        <v-switch
                          v-model="product.is_active"
                          color="success"
                          label="Cho phép bán"
                          hide-details
                          class="mb-3"
                        ></v-switch>
                      </v-col>

                      <!-- Mô tả -->
                      <v-col cols="12">
                        <v-textarea
                          v-model="product.description"
                          label="Mô tả sản phẩm"
                          placeholder="Nhập mô tả chi tiết sản phẩm"
                          variant="outlined"
                          :rules="[rules.required]"
                          rows="4"
                          auto-grow
                          hide-details="auto"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Biến thể -->
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center px-4 pt-4 pb-0">
                    <span class="text-subtitle-1 font-weight-bold">Biến thể sản phẩm</span>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="variantDialog" max-width="500">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          color="primary"
                          prepend-icon="mdi-plus"
                          size="small"
                          v-bind="props"
                        >
                          Tạo nhanh
                        </v-btn>
                      </template>

                      <v-card>
                        <v-card-title class="text-subtitle-1">
                          Tạo nhanh biến thể
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <!-- Chọn màu -->
                            <v-col cols="12">
                              <v-combobox
                                v-model="selectedColors"
                                :items="colors"
                                item-title="name"
                                item-value="id"
                                label="Chọn màu sắc"
                                multiple
                                chips
                                closable-chips
                                variant="outlined"
                              >
                                <template v-slot:chip="{ props, item }">
                                  <v-chip
                                    v-bind="props"
                                    :prepend-avatar="item.raw?.code"
                                  >
                                    {{ item.title }}
                                  </v-chip>
                                </template>
                              </v-combobox>
                            </v-col>

                            <!-- Chọn size -->
                            <v-col cols="12">
                              <v-combobox
                                v-model="selectedSizes"
                                :items="sizes"
                                item-title="name"
                                item-value="id"
                                label="Chọn kích cỡ"
                                multiple
                                chips
                                closable-chips
                                variant="outlined"
                              >
                                <template v-slot:chip="{ props, item }">
                                  <v-chip v-bind="props">
                                    {{ item.title }}
                                  </v-chip>
                                </template>
                              </v-combobox>
                            </v-col>

                            <!-- Số lượng mặc định -->
                            <v-col cols="12">
                              <v-text-field
                                v-model="defaultQuantity"
                                type="number"
                                min="0"
                                label="Số lượng mặc định"
                                variant="outlined"
                                density="comfortable"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            color="primary"
                            @click="generateVariants"
                            :disabled="!canGenerateVariants"
                          >
                            Tạo {{ totalNewVariants }} biến thể
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-card-title>
                  
                  <v-card-text class="px-4">
                    <!-- Bảng biến thể -->
                    <div v-if="product.variants.length" class="variants-table">
                      <div class="variants-header">
                        <div class="variant-cell">Màu sắc</div>
                        <div class="variant-cell">Kích cỡ</div>
                        <div class="variant-cell">Số lượng</div>
                        <div class="variant-cell" style="width: 50px"></div>
                      </div>

                      <div
                        v-for="(variant, index) in product.variants"
                        :key="index"
                        class="variants-row"
                      >
                        <!-- Màu sắc -->
                        <div class="variant-cell">
                          <v-select
                            v-model="variant.color_id"
                            :items="colors"
                            item-title="name"
                            item-value="id"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :rules="[rules.required]"
                          >
                            <template v-slot:prepend>
                              <div 
                                class="color-preview"
                                :style="{
                                  backgroundColor: getColorCode(variant.color_id)
                                }"
                              ></div>
                            </template>
                          </v-select>
                        </div>

                        <!-- Kích cỡ -->
                        <div class="variant-cell">
                          <v-select
                            v-model="variant.size_id"
                            :items="sizes"
                            item-title="name"
                            item-value="id"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :rules="[rules.required]"
                          ></v-select>
                        </div>

                        <!-- Số lượng -->
                        <div class="variant-cell">
                          <v-text-field
                            v-model="variant.stock_quantity"
                            type="number"
                            min="0"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :rules="[rules.required, rules.minValue(0)]"
                          ></v-text-field>
                        </div>

                        <!-- Xóa -->
                        <div class="variant-cell">
                          <v-btn
                            icon="mdi-delete"
                            color="error"
                            variant="text"
                            density="comfortable"
                            @click="removeVariant(index)"
                          ></v-btn>
                        </div>
                      </div>
                    </div>

                    <!-- Empty state -->
                    <div v-else class="text-center py-8">
                      <v-icon
                        icon="mdi-format-list-text"
                        size="40"
                        color="grey-darken-1"
                        class="mb-2"
                      ></v-icon>
                      <div class="text-grey-darken-1">
                        Chưa có biến thể. Click vào "Tạo nhanh" để thêm biến thể
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-col>

            <!-- Cột phải - Hình ảnh -->
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4 pb-0">
                  Hình ảnh sản phẩm
                </v-card-title>

                <v-card-text class="px-4">
                  <!-- Image Grid -->
                  <div class="image-grid">
                    <div
                      v-for="index in 5"
                      :key="index"
                      class="image-slot"
                      :class="{ 'is-primary': index === 1 }"
                    >
                      <!-- Has Image -->
                      <template v-if="imagePreviewUrls[index - 1]">
                        <v-img
                          :src="imagePreviewUrls[index - 1]"
                          aspect-ratio="1"
                          cover
                          class="rounded"
                        >
                          <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                              <v-progress-circular
                                indeterminate
                                color="primary"
                              ></v-progress-circular>
                            </div>
                          </template>
                        </v-img>
                        <div class="image-actions">
                          <v-btn
                            icon="mdi-delete"
                            color="error"
                            variant="flat"
                            size="small"
                            @click="removeImage(index - 1)"
                          ></v-btn>
                        </div>
                      </template>

                      <!-- Empty Slot -->
                      <template v-else>
                        <v-btn
                          color="primary"
                          variant="outlined"
                          block
                          height="100%"
                          class="upload-btn"
                          prepend-icon="mdi-camera"
                          @click="triggerImageUpload(index - 1)"
                        >
                          <span v-if="index === 1">Ảnh chính</span>
                          <span v-else>Thêm ảnh</span>
                        </v-btn>
                      </template>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    style="display: none"
                    @change="handleImageSelect"
                  >

                  <div class="text-caption text-grey mt-2">
                    * Ô đầu tiên sẽ là ảnh chính của sản phẩm<br>
                    * Định dạng: .jpg, .jpeg, .png, .webp<br>
                    * Kích thước tối đa: 2MB/ảnh
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
            :to="{ name: 'admin-products' }"
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
            Tạo sản phẩm
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
const fileInput = ref(null)
const currentImageIndex = ref(null)

// Data
const isSubmitting = ref(false)
const variantDialog = ref(false)
const imagePreviewUrls = ref([])
const selectedColors = ref([])
const selectedSizes = ref([])
const defaultQuantity = ref(1)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const product = ref({
  name: '',
  description: '',
  price: null,
  brand_id: null,
  category_id: null,
  is_active: true,
  variants: [],
  images: []
})

// Validation Rules
const rules = {
  required: v => !!v || 'Trường này là bắt buộc',
  minValue: min => v => v >= min || `Giá trị tối thiểu là ${min}`,
  maxFileSize: size => v => !v || v.size <= size || `Kích thước tối đa ${size / 1024 / 1024}MB`,
  imageType: v => !v || ['image/jpeg', 'image/png', 'image/webp'].includes(v.type) || 'Định dạng không hỗ trợ'
}

// Computed
const brands = computed(() => store.state.brands.brands)
const categories = computed(() => store.state.categories.categories)
const colors = computed(() => store.state.colors.colors)
const sizes = computed(() => store.state.sizes.sizes)

const totalNewVariants = computed(() => {
  return selectedColors.value.length * selectedSizes.value.length
})

const canGenerateVariants = computed(() => {
  return selectedColors.value.length > 0 && 
         selectedSizes.value.length > 0 && 
         defaultQuantity.value > 0
})

// Methods
const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const getColorCode = (colorId) => {
  const color = colors.value.find(c => c.id === colorId)
  return color ? color.code : ''
}

// Image Methods
const triggerImageUpload = (index) => {
  currentImageIndex.value = index
  fileInput.value.click()
}

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file
  if (!rules.imageType(file)) {
    showMessage('Định dạng file không hỗ trợ', 'error')
    return
  }
  if (!rules.maxFileSize(2 * 1024 * 1024)(file)) {
    showMessage('Kích thước file quá lớn', 'error')
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviewUrls.value[currentImageIndex.value] = e.target.result
    product.value.images[currentImageIndex.value] = file
  }
  reader.readAsDataURL(file)

  // Reset file input
  event.target.value = ''
}

const removeImage = (index) => {
  imagePreviewUrls.value[index] = null
  product.value.images[index] = null

  // Remove null values
  imagePreviewUrls.value = imagePreviewUrls.value.filter(url => url)
  product.value.images = product.value.images.filter(img => img)
}

// Variant Methods
const generateVariants = () => {
  // Create variants for each color-size combination
  selectedColors.value.forEach(color => {
    selectedSizes.value.forEach(size => {
      const exists = product.value.variants.some(v => 
        v.color_id === color.id && v.size_id === size.id
      )

      if (!exists) {
        product.value.variants.push({
          color_id: color.id,
          size_id: size.id,
          stock_quantity: defaultQuantity.value
        })
      }
    })
  })

  variantDialog.value = false
  selectedColors.value = []
  selectedSizes.value = []
  defaultQuantity.value = 1
}

const removeVariant = (index) => {
  product.value.variants.splice(index, 1)
}

// Validation
const validateForm = async () => {
  const { valid } = await form.value.validate()
  if (!valid) {
    showMessage('Vui lòng điền đầy đủ thông tin', 'error')
    return false
  }

  if (!product.value.images.filter(img => img).length) {
    showMessage('Vui lòng thêm ít nhất một hình ảnh', 'error')
    return false
  }

  if (!product.value.variants.length) {
    showMessage('Vui lòng thêm ít nhất một biến thể', 'error')
    return false
  }

  // Check duplicate variants
  const variantMap = new Set()
  for (const variant of product.value.variants) {
    const key = `${variant.color_id}-${variant.size_id}`
    if (variantMap.has(key)) {
      showMessage('Không thể có biến thể trùng lặp (màu sắc và kích cỡ)', 'error')
      return false
    }
    variantMap.add(key)
  }

  return true
}

// Submit
const handleSubmit = async () => {
  if (!await validateForm()) return

  try {
    isSubmitting.value = true

    const formData = {
      ...product.value,
      price: +product.value.price,
      images: product.value.images.filter(img => img),
      variants: product.value.variants.map(variant => ({
        ...variant,
        stock_quantity: +variant.stock_quantity
      }))
    }

    await store.dispatch('products/createProduct', formData)
    
    showMessage('Tạo sản phẩm thành công')
    router.push({
      name: 'admin-products',
    //   params: { id: response.data.id }
    })

  } catch (error) {
    console.error('Create error:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm',
      'error'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle Hooks
onMounted(async () => {
  try {
    await Promise.all([
      store.dispatch('brands/fetchBrands'),
      store.dispatch('categories/fetchCategories'),
      store.dispatch('colors/fetchColors'),
      store.dispatch('sizes/fetchSizes')
    ])
  } catch (error) {
    console.error('Error loading data:', error)
    showMessage('Có lỗi khi tải dữ liệu', 'error')
  }
})
</script>

<style scoped>
.gap-6 {
  gap: 24px;
}

/* Image Grid */
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.image-grid > :first-child {
  grid-column: 1 / -1;
}

.image-slot {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.is-primary {
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
}

.upload-btn {
  border-style: dashed;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Variants Table */
.variants-table {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  overflow: hidden;
}

.variants-header {
  display: flex;
  background-color: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 12px;
  font-weight: 600;
}

.variants-row {
  display: flex;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 12px;
}

.variants-row:last-child {
  border-bottom: none;
}

.variant-cell {
  flex: 1;
  padding: 0 8px;
  display: flex;
  align-items: center;
}

.variant-cell:first-child {
  padding-left: 0;
}

.variant-cell:last-child {
  padding-right: 0;
  flex: 0 0 50px;
  justify-content: center;
}

/* Color Preview */
.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-right: 8px;
}

/* Responsive */
@media (max-width: 600px) {
  .variants-table {
    overflow-x: auto;
  }

  .variants-row,
  .variants-header {
    min-width: 600px;
  }
}
</style>