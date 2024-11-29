<template>
  <v-card>
    <!-- Main Form -->
    <v-form @submit.prevent="handleSubmit" ref="form">
      <v-card-text>
        <!-- Loading Overlay -->
        <v-overlay v-model="formLoading" class="align-center justify-center">
          <v-progress-circular color="primary" indeterminate size="64" />
        </v-overlay>

        <!-- Basic Info -->
        <v-card class="mb-4">
          <v-card-title>Thông tin cơ bản</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Tên sản phẩm"
                  :rules="rules.name"
                  :error-messages="errors.name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.price"
                  label="Giá"
                  type="number"
                  :rules="rules.price"
                  :error-messages="errors.price"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.brand_id"
                  :items="brands"
                  item-title="name"
                  item-value="id"
                  label="Thương hiệu"
                  :loading="brandsLoading"
                  :rules="rules.brand_id"
                  :error-messages="errors.brand_id"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.category_id"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Danh mục"
                  :loading="categoriesLoading"
                  :rules="rules.category_id"
                  :error-messages="errors.category_id"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Mô tả"
                  :rules="rules.description"
                  :error-messages="errors.description"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="formData.is_active"
                  label="Kích hoạt"
                  color="primary"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Variants -->
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            Biến thể
            <v-spacer />
            <v-btn
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
              @click="addVariant"
            >
              Thêm biến thể
            </v-btn>
          </v-card-title>
          <v-card-text>
            <!-- Thông báo lỗi chung cho variants -->
            <v-alert
              v-if="errors.general"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="errors.general = null"
            >
              {{ errors.general }}
            </v-alert>

            <v-row v-for="(variant, index) in formData.variants" :key="index">
              <v-col v-if="errors[`variants.${index}.message`]" cols="12">
                <v-alert
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="mb-2"
                  closable
                  @click:close="delete errors[`variants.${index}.message`]"
                >
                  {{ errors[`variants.${index}.message`] }}
                </v-alert>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-select
                  v-model="variant.color_id"
                  :items="colors"
                  item-title="name"
                  item-value="id"
                  label="Màu sắc"
                  :loading="colorsLoading"
                  :error-messages="errors[`variants.${index}.color_id`]"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="variant.size_id"
                  :items="sizes"
                  item-title="name"
                  item-value="id"
                  label="Kích cỡ"
                  :loading="sizesLoading"
                  :error-messages="errors[`variants.${index}.size_id`]"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="variant.stock_quantity"
                  label="Số lượng"
                  type="number"
                  :error-messages="errors[`variants.${index}.stock_quantity`]"
                />
              </v-col>
              <v-col cols="12" md="2" class="d-flex align-center">
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  variant="text"
                  @click="confirmDeleteVariant(index)"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Images -->
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            Hình ảnh
            <v-spacer />
            <v-btn
              color="primary"
              size="small"
              prepend-icon="mdi-image-plus"
              @click="$refs.fileInput.click()"
              :disabled="!canAddMoreImages"
            >
              Thêm ảnh ({{ totalImages }}/5)
            </v-btn>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              class="d-none"
              @change="handleImagesChange"
            >
          </v-card-title>
          <v-card-text>
            <v-row>
              <!-- Current Images -->
              <v-col
                v-for="(image, index) in currentImages"
                :key="image.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card>
                  <v-img
                    :src="image.url"
                    aspect-ratio="1"
                    cover
                  />
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      color="error"
                      icon="mdi-delete"
                      variant="text"
                      :loading="image.isDeleting"
                      @click="confirmDeleteImage(index)"
                    />
                  </v-card-actions>
                </v-card>
              </v-col>

              <!-- New Images -->
              <v-col
                v-for="(image, index) in formData.images"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card>
                  <v-img
                    :src="getImageUrl(image)"
                    aspect-ratio="1"
                    cover
                  />
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      color="error"
                      icon="mdi-delete"
                      variant="text"
                      @click="formData.images.splice(index, 1)"
                    />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
          closable
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <!-- Action Buttons -->
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="tonal"
          @click="confirmCancel"
          :disabled="isLoading"
        >
          Hủy
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="isLoading"
          :disabled="isLoading"
          class="ml-2"
        >
          Cập nhật
        </v-btn>
      </v-card-actions>
    </v-form>

    <!-- Dialogs -->
    <v-dialog v-model="imageDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Xác nhận xóa ảnh</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa ảnh này không?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="imageDeleteDialog = false"
            :disabled="isLoading"
          >
            Hủy
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="handleDeleteImage"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="variantDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Xác nhận xóa biến thể</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa biến thể này không?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="variantDeleteDialog = false"
            :disabled="isLoading"
          >
            Hủy
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="handleDeleteVariant"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cancelDialog" max-width="500px">
      <v-card>
        <v-card-title>Xác nhận hủy chỉnh sửa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn hủy? Mọi thay đổi sẽ không được lưu.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="cancelDialog = false"
            :disabled="isLoading"
          >
            Không
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="handleCancel"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Đồng ý
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const store = useStore()
const route = useRoute()
const router = useRouter()

// Form refs and state
const form = ref(null)
const fileInput = ref(null)
const formLoading = ref(false)
const currentImages = ref([])
const selectedImageIndex = ref(null)
const selectedVariantIndex = ref(null)

// Dialog states
const imageDeleteDialog = ref(false)
const variantDeleteDialog = ref(false)
const cancelDialog = ref(false)

// Form data
const formData = ref({
  name: '',
  description: '',
  price: null,
  brand_id: null,
  category_id: null,
  is_active: true,
  variants: [],
  images: []
})

// Validation rules
const rules = {
  name: [
    v => !!v || 'Vui lòng nhập tên sản phẩm',
    v => v?.length >= 3 || 'Tên sản phẩm phải có ít nhất 3 ký tự'
  ],
  price: [
    v => !!v || 'Vui lòng nhập giá',
    v => v > 0 || 'Giá phải lớn hơn 0',
    v => Number.isInteger(Number(v)) || 'Giá phải là số nguyên'
  ],
  brand_id: [v => !!v || 'Vui lòng chọn thương hiệu'],
  category_id: [v => !!v || 'Vui lòng chọn danh mục'],
  description: [
    v => !!v || 'Vui lòng nhập mô tả',
    v => v?.length >= 10 || 'Mô tả phải có ít nhất 10 ký tự'
  ]
}

// Store getters
const isLoading = computed(() => store.getters['products/isLoading'])
const error = computed(() => store.getters['products/error'])
const brands = computed(() => store.getters['brands/brands'])
const categories = computed(() => store.getters['categories/categories'])
const colors = computed(() => store.getters['colors/colors'])
const sizes = computed(() => store.getters['sizes/sizes'])

// Loading states
const brandsLoading = computed(() => store.getters['brands/isLoading'])
const categoriesLoading = computed(() => store.getters['categories/isLoading'])
const colorsLoading = computed(() => store.getters['colors/isLoading'])
const sizesLoading = computed(() => store.getters['sizes/isLoading'])

// Form errors
const errors = ref({})

// Methods
const fetchReferenceData = async () => {
  try {
    await Promise.all([
      store.dispatch('brands/fetchBrands'),
      store.dispatch('categories/fetchCategories'),
      store.dispatch('colors/fetchColors'),
      store.dispatch('sizes/fetchSizes')
    ])
  } catch (error) {
    console.error('Error fetching reference data:', error)
  }
}

const handleSubmit = async () => {
  if (!form.value.validate()) {
    console.error('Form validation failed')
    return
  }

  // Kiểm tra trùng lặp variant
  const duplicateVariants = formData.value.variants.some((variant, index) => 
    checkDuplicateVariant(variant.color_id, variant.size_id, index)
  )

  if (duplicateVariants) {
    errors.value.general = 'Tồn tại biến thể trùng lặp. Vui lòng kiểm tra lại.'
    return
  }

  try {
    // Log để debug
    console.log('Form data before submit:', formData.value)

    // Kiểm tra dữ liệu trước khi submit
    if (!formData.value.name || !formData.value.description || 
        !formData.value.price || !formData.value.brand_id || 
        !formData.value.category_id) {
      throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc')
    }

    const formDataToSubmit = new FormData()
    
    // Append basic info với kiểm tra và chuyển đổi kiểu dữ liệu
    formDataToSubmit.append('name', String(formData.value.name).trim())
    formDataToSubmit.append('description', String(formData.value.description).trim())
    formDataToSubmit.append('price', Number(formData.value.price))
    formDataToSubmit.append('brand_id', Number(formData.value.brand_id))
    formDataToSubmit.append('category_id', Number(formData.value.category_id))
    formDataToSubmit.append('is_active', formData.value.is_active ? '1' : '0')

    // Append variants nếu có
    if (formData.value.variants?.length > 0) {
      formData.value.variants.forEach((variant, index) => {
        if (variant.color_id && variant.size_id) {
          formDataToSubmit.append(`variants[${index}][id]`, variant.id || '')
          formDataToSubmit.append(`variants[${index}][color_id]`, Number(variant.color_id))
          formDataToSubmit.append(`variants[${index}][size_id]`, Number(variant.size_id))
          formDataToSubmit.append(`variants[${index}][stock_quantity]`, Number(variant.stock_quantity || 0))
        }
      })
    }

    // Append images nếu có
    if (formData.value.images?.length > 0) {
      formData.value.images.forEach(image => {
        if (image instanceof File) {
          formDataToSubmit.append('images[]', image)
        }
      })
    }

    // Log để debug
    console.log('FormData before sending:', Object.fromEntries(formDataToSubmit))

    await store.dispatch('products/updateProduct', {
      id: route.params.id,
      data: formDataToSubmit
    })

    router.push({ name: 'admin-products' })
  } catch (error) {
    console.error('Submit error:', error)
    errors.value = error.response?.data?.errors || {
      general: error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm'
    }
  }
}

const addVariant = () => {
  formData.value.variants.push({
    color_id: null,
    size_id: null,
    stock_quantity: 0
  })
}

// Cập nhật watchVariant để kiểm tra khi người dùng chọn
const watchVariant = (variant, index) => {
  watch(
    [() => variant.color_id, () => variant.size_id],
    ([newColorId, newSizeId], [oldColorId, oldSizeId]) => {
      // Chỉ kiểm tra khi cả hai giá trị đều được chọn mới
      if (newColorId && newSizeId) {
        const isDuplicate = checkDuplicateVariant(newColorId, newSizeId, index)
        if (isDuplicate) {
          // Hiển thị cảnh báo
          errors.value[`variants.${index}.message`] = 'Biến thể này đã tồn tại!'
          // Reset về giá trị cũ
          variant.color_id = oldColorId
          variant.size_id = oldSizeId
        } else {
          delete errors.value[`variants.${index}.message`]
        }
      }
    }
  )
}

// Khởi tạo watch cho mỗi variant khi thêm mới
onMounted(() => {
  formData.value.variants.forEach((variant, index) => {
    watchVariant(variant, index)
  })
})

// Thêm watch cho variants array để tự động thêm watch cho variant mới
watch(
  () => formData.value.variants.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      // Có variant mới được thêm vào
      watchVariant(
        formData.value.variants[newLength - 1], 
        newLength - 1
      )
    }
  }
)

// Thêm computed property để kiểm tra số lượng ảnh
const totalImages = computed(() => {
  return currentImages.value.length + formData.value.images.length
})

const canAddMoreImages = computed(() => {
  return totalImages.value < 5
})

// Cập nhật method handleImagesChange
const handleImagesChange = (event) => {
  if (!event.target.files) return
  
  const files = Array.from(event.target.files)
  const remainingSlots = 5 - totalImages.value
  
  if (remainingSlots <= 0) {
    alert('Chỉ được phép tải lên tối đa 5 ảnh')
    event.target.value = ''
    return
  }

  const validFiles = files.slice(0, remainingSlots).filter(file => {
    const isValid = file.type.startsWith('image/')
    const isSizeValid = file.size <= 2 * 1024 * 1024 // 2MB
    return isValid && isSizeValid
  })

  formData.value.images = [...formData.value.images, ...validFiles]
  event.target.value = '' // Reset input
}

// Dialog handlers
const confirmDeleteImage = (index) => {
  selectedImageIndex.value = index
  imageDeleteDialog.value = true
}

const handleDeleteImage = async () => {
  const image = currentImages.value[selectedImageIndex.value]
  image.isDeleting = true

  try {
    await store.dispatch('products/deleteImage', {
      productId: route.params.id,
      imageId: image.id
    })
    currentImages.value.splice(selectedImageIndex.value, 1)
  } catch (error) {
    console.error('Error deleting image:', error)
  } finally {
    image.isDeleting = false
    imageDeleteDialog.value = false
  }
}

const confirmDeleteVariant = (index) => {
  selectedVariantIndex.value = index
  variantDeleteDialog.value = true
}

const handleDeleteVariant = async () => {
  const variant = formData.value.variants[selectedVariantIndex.value]

  if (variant.id) {
    try {
      await store.dispatch('products/deleteVariant', {
        productId: route.params.id,
        variantId: variant.id
      })
    } catch (error) {
      console.error('Error deleting variant:', error)
      return
    }
  }

  formData.value.variants.splice(selectedVariantIndex.value, 1)
  variantDeleteDialog.value = false
}

const confirmCancel = () => {
  cancelDialog.value = true
}

const handleCancel = () => {
  router.push({ name: 'admin-products' })
}

// Initialization
onMounted(async () => {
  formLoading.value = true
  try {
    await store.dispatch('products/fetchProduct', route.params.id)
    await fetchReferenceData()
    
    const product = store.getters['products/product']
    console.log('Raw product data:', product)

    if (!product?.data) {
      throw new Error('Không thể tải dữ liệu sản phẩm')
    }

    const productData = product.data

    // Cập nhật formData
    formData.value = {
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || 0,
      brand_id: productData.brand_id || null,
      category_id: productData.category_id || null,
      is_active: productData.is_active ?? true,
      variants: productData.variants?.map(v => ({
        id: v.id,
        color_id: v.color_id,
        size_id: v.size_id,
        stock_quantity: v.stock_quantity
      })) || [],
      images: []
    }

    // Cập nhật currentImages với full_url
    currentImages.value = productData.images?.map(img => ({
      id: img.id,
      url: img.full_url, // Sử dụng full_url thay vì url
      isDeleting: false
    })) || []

    console.log('Current images after setup:', currentImages.value)

  } catch (error) {
    console.error('Error loading product:', error)
  } finally {
    formLoading.value = false
  }
})

// Add this computed function
const getImageUrl = (image) => {
  if (!image) return ''
  try {
    return URL.createObjectURL(image)
  } catch (e) {
    console.error('Error creating object URL:', e)
    return ''
  }
}

// Thêm computed property để kiểm tra trùng variant
const checkDuplicateVariant = (colorId, sizeId, currentIndex = -1) => {
  return formData.value.variants.some((variant, index) => {
    // Bỏ qua variant hiện tại khi đang sửa
    if (index === currentIndex) return false
    return variant.color_id === colorId && variant.size_id === sizeId
  })
}
</script>

<style scoped>
.rounded-lg {
  border-radius: 8px;
}
</style>
