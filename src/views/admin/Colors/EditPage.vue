<!-- views/admin/Colors/EditPage.vue -->
<template>
  <v-card>
    <v-toolbar
      flat
      color="transparent"
    >
      <v-toolbar-title class="text-h6">
        Chỉnh sửa màu sắc
      </v-toolbar-title>
    </v-toolbar>

    <v-divider></v-divider>

    <v-form @submit.prevent="handleSubmit" ref="form">
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="formData.name"
              label="Tên màu sắc"
              :rules="nameRules"
              variant="outlined"
              density="comfortable"
              required
              :error-messages="errors.name"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <!-- Preview image -->
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
                
                <template v-slot:error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon
                      icon="mdi-image-off"
                      color="grey-darken-2"
                      size="48"
                    ></v-icon>
                  </div>
                </template>
              </v-img>
            </div>

            <!-- Input file -->
            <v-file-input
              v-model="formData.code"
              label="Hình ảnh màu sắc"
              accept="image/*"
              :rules="imageRules"
              variant="outlined"
              density="comfortable"
              prepend-icon="mdi-camera"
              :error-messages="errors.code"
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

    <!-- Snackbar thông báo -->
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
        ></v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  code: null
})

// UI states
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const isLoading = computed(() => store.getters['colors/isLoading'])
const error = computed(() => store.getters['colors/error'])
const currentImage = computed(() => store.getters['colors/color']?.code)

// Validation rules
const nameRules = [
  v => !!v || 'Tên màu sắc không được để trống',
  v => (v && v.length <= 255) || 'Tên màu sắc không được vượt quá 255 ký tự'
]



// Methods
const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

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

const fetchColor = async () => {
  try {
    await store.dispatch('colors/fetchColor', route.params.id)
    const color = store.getters['colors/color']
    if (color) {
      formData.value.name = color.name
    }
  } catch (error) {
    console.error('Fetch failed:', error)
    showMessage('Không thể tải thông tin màu sắc', 'error')
    router.push({ name: 'admin-colors' })
  }
}

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return
  
  try {
    errors.value = {}
    
    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.value.name)
    
    if (formData.value.code) {
      formDataToSend.append('code', formData.value.code)
    }

    await store.dispatch('colors/updateColor', {
      id: route.params.id,
      data: formDataToSend
    })

    showMessage('Cập nhật màu sắc thành công')
    
    router.push({ 
      name: 'admin-colors',
      query: { refresh: Date.now() }
    })
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      showMessage(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật màu sắc',
        'error'
      )
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
  fetchColor()
})
</script>

<style scoped>
.rounded {
  border-radius: 8px;
}
</style>