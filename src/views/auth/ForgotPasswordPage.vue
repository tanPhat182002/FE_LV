<template>
    <div class="forgot-password-container">
      <v-card class="mx-auto pa-6" max-width="400">
        <v-card-title class="text-center text-h5 mb-4">
          Quên mật khẩu
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
          @submit.prevent="handleForgotPassword"
          lazy-validation
        >
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="Email"
            required
            variant="outlined"
            :error-messages="emailError"
            :disabled="loading"
            @input="clearErrors"
            @keyup.enter="handleForgotPassword"
          />
  
          <v-btn
            block
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
            :disabled="!valid || loading"
            class="mt-4"
          >
            {{ loading ? 'Đang gửi...' : 'Gửi mã xác thực' }}
          </v-btn>
  
          <div class="d-flex justify-center mt-4">
            <router-link 
              to="/login" 
              class="text-decoration-none"
              :class="{ 'disabled-link': loading }"
            >
              <v-icon icon="mdi-arrow-left" class="mr-1" />
              Quay lại đăng nhập
            </router-link>
          </div>
        </v-form>
      </v-card>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  
  export default {
    name: 'ForgotPasswordPage',
  
    setup() {
      const store = useStore()
      const router = useRouter()
      const { mobile } = useDisplay()
  
      // Refs
      const form = ref(null)
      const valid = ref(false)
      const loading = ref(false)
      const email = ref('')
      const error = ref('')
      const success = ref('')
      const emailError = ref('')
  
      // Validation rules
      const emailRules = [
        v => !!v || 'Email là bắt buộc',
        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
        v => v.length <= 100 || 'Email không được vượt quá 100 ký tự'
      ]
  
      // Computed properties
      const cardWidth = computed(() => mobile.value ? '90%' : '400px')
  
      // Methods
      const clearErrors = () => {
        error.value = ''
        emailError.value = ''
      }
  
      const clearError = () => {
        error.value = ''
      }
  
      const validateEmail = () => {
        const emailValue = email.value.trim()
        
        if (!emailValue) {
          emailError.value = 'Email là bắt buộc'
          return false
        }
        
        if (!/.+@.+\..+/.test(emailValue)) {
          emailError.value = 'Email không hợp lệ'
          return false
        }
        
        return true
      }
  
      const handleForgotPassword = async () => {
        try {
          clearErrors()
  
          const formValid = await form.value?.validate()
          if (!formValid || !validateEmail()) return
  
          loading.value = true
          
          await store.dispatch('user/forgotPassword', email.value)
          
          success.value = 'Mã xác thực đã được gửi đến email của bạn'
          
          // Delay navigation to show success message
          setTimeout(() => {
            router.push({ 
              name: 'verify-otp',
              params: { email: email.value }
            })
          }, 1500)
  
        } catch (err) {
          error.value = err.response?.data?.message || 'Có lỗi xảy ra khi gửi mã xác thực'
          
          if (err.response?.status === 404) {
            emailError.value = 'Email không tồn tại trong hệ thống'
          }
        } finally {
          loading.value = false
        }
      }
  
      return {
        // Template refs
        form,
        valid,
        loading,
        email,
        error,
        success,
        emailError,
        cardWidth,
        
        // Rules
        emailRules,
        
        // Methods
        handleForgotPassword,
        clearErrors,
        clearError
      }
    }
  }
  </script>
  
  <style scoped>
  .forgot-password-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
    background-color: #f5f5f5;
  }
  
  .disabled-link {
    opacity: 0.5;
    pointer-events: none;
  }
  
  /* Add transitions */
  .v-alert {
    transition: all 0.3s ease;
  }
  
  .v-btn {
    transition: opacity 0.3s ease;
  }
  
  .v-btn:disabled {
    opacity: 0.7;
  }
  
  /* Responsive adjustments */
  @media (max-width: 600px) {
    .v-card {
      width: 100%;
      margin: 1rem;
    }
  }
  </style>