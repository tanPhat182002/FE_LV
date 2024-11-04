<!-- views/admin/Colors/CreatePage.vue -->
<template>
  <v-card>
    <v-card-title class="text-h6 px-4 py-3">
      Thêm màu sắc mới
    </v-card-title>

    <v-divider></v-divider>

    <v-form ref="form" @submit.prevent="handleSubmit">
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="formData.name"
              label="Tên màu sắc"
              variant="outlined"
              density="comfortable"
              :rules="rules.name"
              required
              :error-messages="errors.name"
              hide-details="auto"
              class="mb-3"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <!-- Preview image -->
            <div v-if="imagePreview" class="mb-3 d-flex justify-center">
              <v-img
                :src="imagePreview"
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

            <!-- File input -->
            <v-file-input
              v-model="formData.code"
              accept="image/*"
              label="Hình ảnh màu sắc"
              variant="outlined"
              density="comfortable"
              :rules="rules.code"
              prepend-icon="mdi-camera"
              :error-messages="errors.code"
              @update:model-value="handleImageChange"
              show-size
              truncate-length="25"
              class="mb-2"
              hide-details="auto"
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
          Tạo màu sắc
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
import { ref, computed, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const form = ref(null)

// Form data
const formData = ref({
  name: '',
  code: null
})

// Preview
const imagePreview = ref(null)

// UI states
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const errors = ref({})

// Validation rules
const rules = {
  name: [
    v => !!v || 'Vui lòng nhập tên màu sắc',
    v => (v && v.length <= 255) || 'Tên không được vượt quá 255 ký tự'
  ],
  code: [
    v => !!v || 'Vui lòng chọn hình ảnh màu sắc',
    // v => {
    //   if (!v) return true // Optional validation
    //   return v.size < 2000000 || 'Kích thước hình ảnh phải nhỏ hơn 2MB'
    // }
  ]
}

// Computed
const isLoading = computed(() => store.getters['colors/isLoading'])
const error = computed(() => store.getters['colors/error'])

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
    // Cleanup old preview
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value)
    }
    // Create new preview
    imagePreview.value = URL.createObjectURL(file)
  } else {
    imagePreview.value = null
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

    await store.dispatch('colors/createColor', formDataToSend)
    showMessage('Tạo màu sắc thành công')
    
    router.push({ 
      name: 'admin-colors',
      query: { refresh: Date.now() }
    })
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      showMessage(
        error.response?.data?.message || 'Có lỗi xảy ra khi tạo màu sắc', 
        'error'
      )
    }
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})
</script>

<style scoped>
.rounded {
  border-radius: 8px;
}
</style>