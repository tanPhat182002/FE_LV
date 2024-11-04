<!-- views/admin/Categories/EditPage.vue -->
<template>
    <v-card>
      <v-toolbar
        flat
        color="transparent"
      >
        <v-toolbar-title class="text-h6">
          Chỉnh sửa danh mục
        </v-toolbar-title>
      </v-toolbar>
  
      <v-divider></v-divider>
  
      <v-form @submit.prevent="handleSubmit" ref="form">
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Tên danh mục"
                :rules="nameRules"
                variant="outlined"
                density="comfortable"
                required
                :error-messages="errors.name"
              ></v-text-field>
            </v-col>
  
            <v-col cols="12">
              <!-- Preview ảnh hiện tại -->
              <div v-if="currentImage || imagePreview" class="mb-3">
                <v-img
                  :src="imagePreview || currentImage"
                  width="200"
                  height="200"
                  cover
                  class="bg-grey-lighten-2 rounded"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular
                        indeterminate
                        color="grey-lighten-4"
                      ></v-progress-circular>
                    </div>
                  </template>
                </v-img>
              </div>
  
              <!-- Input file -->
              <v-file-input
                v-model="formData.image"
                label="Hình ảnh danh mục"
                accept="image/*"
                :rules="imageRules"
                variant="outlined"
                density="comfortable"
                prepend-icon="mdi-camera"
                :error-messages="errors.image"
                @update:model-value="handleImageChange"
                show-size
                truncate-length="25"
              >
                <template v-slot:selection="{ fileNames }">
                  <template v-for="fileName in fileNames" :key="fileName">
                    <v-chip
                      size="small"
                      label
                      color="primary"
                      class="me-2"
                    >
                      {{ fileName }}
                    </v-chip>
                  </template>
                </template>
              </v-file-input>
            </v-col>
          </v-row>
  
          <!-- Error alert -->
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
  
        <v-divider></v-divider>
  
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="tonal"
            @click="$router.back()"
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
    </v-card>
  </template>
  
  <script setup>
  import { ref, computed, onMounted ,onUnmounted} from 'vue'
  import { useStore } from 'vuex'
  import { useRoute, useRouter } from 'vue-router'
  
  const store = useStore()
  const route = useRoute()
  const router = useRouter()
  
  // Refs
  const form = ref(null)
  const imagePreview = ref(null)
  const errors = ref({})
  
  // Form data
  const formData = ref({
    name: '',
    image: null
  })
  
  // Computed
  const isLoading = computed(() => store.getters['categories/isLoading'])
  const error = computed(() => store.getters['categories/error'])
  const currentImage = computed(() => store.getters['categories/category']?.image)
  
  // Validation rules
  const nameRules = [
    v => !!v || 'Tên danh mục không được để trống',
    v => (v && v.length <= 50) || 'Tên danh mục không được vượt quá 50 ký tự'
  ]
  
// //   const imageRules = [
//     value => {
//       if (!value) return true // Optional
//       return value.size < 20000000 || 'Kích thước hình ảnh phải nhỏ hơn 2MB'
//     }
//   ]
  
  // Methods
  const handleImageChange = (file) => {
    if (file && file instanceof File) {
      // Kiểm tra và xử lý URL cũ
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value)
      }
      // Tạo URL mới
      imagePreview.value = URL.createObjectURL(file)
    } else {
      imagePreview.value = null
    }
  }
  
  const fetchCategory = async () => {
    try {
      await store.dispatch('categories/fetchCategory', route.params.id)
      const category = store.getters['categories/category']
      if (category) {
        formData.value.name = category.name
      }
    } catch (error) {
      console.error('Fetch failed:', error)
      router.push({ name: 'admin-categories' })
    }
  }
  
  const handleSubmit = async () => {
    const { valid } = await form.value.validate()
    
    if (!valid) return
    
    try {
      errors.value = {}
      await store.dispatch('categories/updateCategory', {
        id: route.params.id,
        data: formData.value
      })
      router.push({ 
        name: 'admin-categories',
        query: { refresh: Date.now() }
      })
    } catch (error) {
      if (error.response?.data?.errors) {
        errors.value = error.response.data.errors
      }
    }
  }
  
  // Cleanup URL khi component bị hủy
  onUnmounted(() => {
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value)
    }
  })
  
  // Lifecycle
  onMounted(() => {
    fetchCategory()
  })
  </script>