<template>
  <div class="profile-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8" lg="6">
          <v-card class="pa-6">
            <v-card-title class="text-center text-h5 mb-4">
              Thông tin tài khoản
            </v-card-title>

            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="clearError"
            >
              {{ error }}
            </v-alert>

            <v-alert
              v-if="success"
              type="success"
              variant="tonal"
              closable
              class="mb-4"
              @click:close="success = ''"
            >
              {{ success }}
            </v-alert>

            <v-form
              ref="form"
              v-model="valid"
              @submit.prevent="handleUpdateProfile"
              lazy-validation
            >
              <v-text-field
                v-model="profileData.name"
                :rules="nameRules"
                label="Họ và tên"
                variant="outlined"
                required
                :disabled="loading"
                @input="clearError"
              />

              <v-text-field
                v-model="profileData.email"
                :rules="emailRules"
                label="Email"
                variant="outlined"
                disabled
                hint="Email không thể thay đổi"
                persistent-hint
              />

              <v-text-field
                v-model="profileData.phone"
                :rules="phoneRules"
                label="Số điện thoại"
                variant="outlined"
                :disabled="loading"
                @input="clearError"
              />

              <div class="address-search-container">
                <v-text-field
                  v-model="profileData.address"
                  :rules="addressRules"
                  label="Địa chỉ"
                  variant="outlined"
                  :disabled="loading"
                  @input="handleAddressInput"
                  @click:append-inner="clearAddress"
                  append-inner-icon="mdi-close"
                  ref="addressInput"
                />
                
                <div v-show="showAddressResults" class="address-results">
                  <div
                    v-for="place in addressResults"
                    :key="place.place_id"
                    class="address-result-item"
                    @click="selectAddress(place)"
                  >
                    <div class="main-text">{{ place.structured_formatting.main_text }}</div>
                    <div class="secondary-text">{{ place.structured_formatting.secondary_text }}</div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-end mt-4 gap-2">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                  :disabled="!valid || loading"
                >
                  {{ loading ? 'Đang cập nhật...' : 'Cập nhật' }}
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'ProfilePage',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    // Form data
    const profileData = ref({
      name: '',
      email: '',
      phone: '',
      address: ''
    })

    // Validation rules
    const nameRules = [
      v => !!v || 'Họ và tên là bắt buộc',
      v => v.length <= 50 || 'Họ và tên không được vượt quá 50 ký tự'
    ]

    const emailRules = [
      v => !!v || 'Email là bắt buộc',
      v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
    ]

    const phoneRules = [
      v => !v || /^[0-9]{10}$/.test(v) || 'Số điện thoại không hợp lệ'
    ]

    const addressRules = [
      v => !v || v.length <= 255 || 'Địa chỉ không được vượt quá 255 ký tự'
    ]

    // Thêm các biến cho tìm kiếm địa chỉ
    const addressResults = ref([])
    const showAddressResults = ref(false)
    const addressSearchTimeout = ref(null)
    const API_KEY = 'fz6Wo5XE0CVjom5qYXfbJ2t0BDw6efT46nGiDj5U' // Thay bằng API key của bạn

    // Methods
    const clearError = () => {
      error.value = ''
    }

    const loadProfile = async () => {
      try {
        loading.value = true
        const response = await store.dispatch('user/getProfile')
        profileData.value = { 
          ...response?.data?.data || response?.data || response
        }
      } catch (err) {
        console.error('Load profile error:', err)
        error.value = err.response?.data?.message || 'Không thể tải thông tin người dùng'
        
        if (err.response?.status === 401) {
          router.push('/login')
        }
      } finally {
        loading.value = false
      }
    }

    const handleUpdateProfile = async () => {
      try {
        const formValid = await form.value?.validate()
        if (!formValid) return

        loading.value = true
        clearError()

        const updateData = {
          name: profileData.value.name,
          phone: profileData.value.phone,
          address: profileData.value.address
        }

        await store.dispatch('user/updateProfile', updateData)
        success.value = 'Cập nhật thông tin thành công'
      } catch (err) {
        error.value = err.response?.data?.message || 'Cập nhật thông tin thất bại'
      } finally {
        loading.value = false
      }
    }

    // Xử lý input địa chỉ
    const handleAddressInput = async () => {
      clearError()
      
      if (addressSearchTimeout.value) {
        clearTimeout(addressSearchTimeout.value)
      }

      const value = profileData.value.address
      
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
      profileData.value.address = place.description
      showAddressResults.value = false
    }

    // Clear địa chỉ
    const clearAddress = () => {
      profileData.value.address = ''
      showAddressResults.value = false
    }

    // Load profile data when component mounts
    onMounted(() => {
      loadProfile()
      
      document.addEventListener('click', (e) => {
        const addressContainer = document.querySelector('.address-search-container')
        if (addressContainer && !addressContainer.contains(e.target)) {
          showAddressResults.value = false
        }
      })
    })

    return {
      form,
      valid,
      loading,
      error,
      success,
      profileData,
      nameRules,
      emailRules,
      phoneRules,
      addressRules,
      handleUpdateProfile,
      clearError,
      addressResults,
      showAddressResults,
      handleAddressInput,
      selectAddress,
      clearAddress
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 2rem 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.v-alert {
  transition: all 0.3s ease;
}

.v-btn {
  transition: opacity 0.3s ease;
}

.v-btn:disabled {
  opacity: 0.7;
}

@media (max-width: 600px) {
  .profile-container {
    padding: 1rem 0;
  }
}

.address-search-container {
  position: relative;
  width: 100%;
}

.address-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.address-result-item {
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.address-result-item:hover {
  background-color: #f5f5f5;
}

.main-text {
  font-weight: 500;
  margin-bottom: 4px;
}

.secondary-text {
  font-size: 0.9em;
  color: rgba(0,0,0,0.6);
}
</style>
