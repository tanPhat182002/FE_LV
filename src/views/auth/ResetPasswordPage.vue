<template>
  <div class="reset-password-container">
    <v-card class="mx-auto pa-6" max-width="400">
      <v-card-title class="text-center text-h5 mb-4">
        Đặt lại mật khẩu
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

      <v-form ref="form" v-model="valid" @submit.prevent="handleResetPassword">
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Mật khẩu mới"
          :type="showPassword ? 'text' : 'password'"
          required
          variant="outlined"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          :disabled="loading"
          @input="clearError"
        />

        <v-text-field
          v-model="confirmPassword"
          :rules="confirmPasswordRules"
          label="Xác nhận mật khẩu"
          :type="showConfirmPassword ? 'text' : 'password'"
          required
          variant="outlined"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
          :disabled="loading"
          @input="clearError"
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
          {{ loading ? 'Đang xử lý...' : 'Xác nhận' }}
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'ResetPasswordPage',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    // Kiểm tra params
    const email = route.params.email
    const otp = route.params.otp
    console.log('Email:', email)
    console.log('OTP:', otp)

    if (!email || !otp) {
      router.push({ name: 'forgot-password' })
      return
    }

    // Refs
    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const password = ref('')
    const confirmPassword = ref('')

    // Validation rules
    const passwordRules = [
      v => !!v || 'Mật khẩu là bắt buộc',
      v => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
      v => /[A-Z]/.test(v) || 'Mật khẩu phải chứa ít nhất 1 chữ hoa',
      v => /[a-z]/.test(v) || 'Mật khẩu phải chứa ít nhất 1 chữ thường',
      v => /[0-9]/.test(v) || 'Mật khẩu phải chứa ít nhất 1 số'
    ]

    const confirmPasswordRules = [
      v => !!v || 'Xác nhận mật khẩu là bắt buộc',
      v => v === password.value || 'Mật khẩu không khớp'
    ]

    // Methods
    const clearError = () => {
      error.value = ''
    }

    const handleResetPassword = async () => {
      try {
        const formValid = await form.value?.validate()
        if (!formValid) return

        loading.value = true
        clearError()

        const payload = {
          email,
          otp,
          password: password.value
        }
        console.log('Reset password payload:', payload)

        await store.dispatch('user/resetPassword', payload)

        router.push({ 
          name: 'login',
          query: { 
            message: 'Đặt lại mật khẩu thành công' 
          }
        })
      } catch (err) {
        console.error('Reset password error:', err.response?.data)
        error.value = err.response?.data?.message || 'Đặt lại mật khẩu thất bại'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      valid,
      loading,
      error,
      password,
      confirmPassword,
      passwordRules,
      confirmPasswordRules,
      showPassword,
      showConfirmPassword,
      handleResetPassword,
      clearError
    }
  }
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f5f5f5;
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
