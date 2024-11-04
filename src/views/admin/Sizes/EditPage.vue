<!-- views/admin/Sizes/EditPage.vue -->
<template>
  <v-card>
    <v-toolbar
      flat
      color="transparent"
    >
      <v-toolbar-title class="text-h6">
        Chỉnh sửa kích thước
      </v-toolbar-title>
    </v-toolbar>

    <v-divider></v-divider>

    <v-form @submit.prevent="handleSubmit" ref="form">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.name"
              label="Tên kích thước"
              :rules="nameRules"
              variant="outlined"
              density="comfortable"
              required
              :error-messages="errors.name"
              hide-details="auto"
              class="mb-3"
              placeholder="Ví dụ: S, M, L, XL,..."
            ></v-text-field>
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
          :disabled="isLoading || !formValid"
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const router = useRouter()
const route = useRoute()
const form = ref(null)

// Form data
const formData = ref({
  name: ''
})

// Form validation
const formValid = computed(() => {
  return formData.value.name.length > 0
})

// UI states
const errors = ref({})
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Validation rules
const nameRules = [
  v => !!v || 'Vui lòng nhập tên kích thước',
  v => (v && v.length <= 50) || 'Tên kích thước không được vượt quá 50 ký tự',
  v => /^[a-zA-Z0-9\s]+$/.test(v) || 'Tên kích thước chỉ chứa chữ cái và số'
]

// Computed
const isLoading = computed(() => store.getters['sizes/isLoading'])
const error = computed(() => store.getters['sizes/error'])

// Methods
const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const fetchSize = async () => {
  try {
    await store.dispatch('sizes/fetchSize', route.params.id)
    const size = store.getters['sizes/size']
    
    if (size) {
      formData.value.name = size.name
    } else {
      showMessage('Không tìm thấy kích thước', 'error')
      router.push({ name: 'admin-sizes' })
    }
  } catch (error) {
    console.error('Fetch failed:', error)
    showMessage('Không thể tải thông tin kích thước', 'error')
    router.push({ name: 'admin-sizes' })
  }
}

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return

  try {
    errors.value = {}

    await store.dispatch('sizes/updateSize', {
      id: route.params.id,
      data: {
        name: formData.value.name.trim()
      }
    })

    showMessage('Cập nhật kích thước thành công')
    
    router.push({ 
      name: 'admin-sizes',
      query: { refresh: Date.now() }
    })
  } catch (error) {
    console.error('Update failed:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      showMessage(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật kích thước',
        'error'
      )
    }
  }
}

// Lifecycle
onMounted(() => {
  fetchSize()
})
</script>

<style scoped>
.v-col {
  max-width: 500px;
}
</style>