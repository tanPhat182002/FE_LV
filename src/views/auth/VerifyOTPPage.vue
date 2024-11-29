<template>
  <div class="verify-otp-container">
    <v-card class="mx-auto pa-6" max-width="400">
      <v-card-title class="text-center text-h5 mb-4">
        Xác thực mã OTP
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

      <v-form ref="form" v-model="valid" @submit.prevent="handleVerifyOTP">
        <div class="text-center mb-4">
          Vui lòng nhập mã OTP đã được gửi đến email
          <span class="font-weight-medium">{{ email }}</span>
        </div>

        <div class="otp-input-container d-flex justify-center gap-2 mb-4">
          <v-text-field
            v-for="(digit, index) in otpDigits"
            :key="index"
            v-model="otpDigits[index]"
            variant="outlined"
            type="text"
            maxlength="1"
            class="otp-input"
            :disabled="loading"
            @input="handleOtpInput(index)"
            @keydown="handleKeyDown($event, index)"
            @paste="handlePaste"
            @focus="$event.target.select()"
          />
        </div>

        <div class="text-center mb-4">
          <span>Không nhận được mã? </span>
          <v-btn
            variant="text"
            :disabled="countdown > 0 || loading"
            @click="resendOTP"
            class="pa-0"
          >
            Gửi lại{{ countdown > 0 ? ` (${countdown}s)` : '' }}
          </v-btn>
        </div>

        <v-btn
          block
          color="primary"
          size="large"
          type="submit"
          :loading="loading"
          :disabled="!isOtpComplete || loading"
        >
          {{ loading ? 'Đang xác thực...' : 'Xác nhận' }}
        </v-btn>

        <div class="d-flex justify-center mt-4">
          <router-link 
            :to="{ name: 'forgot-password' }" 
            class="text-decoration-none"
            :class="{ 'disabled-link': loading }"
          >
            <v-icon icon="mdi-arrow-left" class="mr-1" />
            Quay lại
          </router-link>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'VerifyOTPPage',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    // Kiểm tra email từ route params
    const email = route.params.email
    if (!email) {
      router.push({ name: 'forgot-password' })
    }

    // Refs
    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)
    const error = ref('')
    const otpDigits = ref(['', '', '', '', '', ''])
    const countdown = ref(60) // Bắt đầu với 60s
    let countdownTimer = null

    // Computed
    const isOtpComplete = computed(() => {
      return otpDigits.value.every(digit => digit !== '' && /^\d+$/.test(digit))
    })

    // Methods
    const clearError = () => {
      error.value = ''
    }

    const startCountdown = () => {
      countdown.value = 60
      countdownTimer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--
        } else {
          clearInterval(countdownTimer)
        }
      }, 1000)
    }

    const handleOtpInput = (index) => {
      // Chỉ cho phép nhập số
      otpDigits.value[index] = otpDigits.value[index].replace(/\D/g, '')
      
      if (otpDigits.value[index] && index < 5) {
        const nextInput = document.querySelectorAll('.otp-input input')[index + 1]
        nextInput?.focus()
      }
    }

    const handleKeyDown = (event, index) => {
      if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        otpDigits.value[index - 1] = ''
        const prevInput = document.querySelectorAll('.otp-input input')[index - 1]
        prevInput?.focus()
      }
    }

    const handlePaste = (event) => {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')
      const digits = pastedData.slice(0, 6).split('')
      otpDigits.value = [...digits.map(d => d.replace(/\D/g, '')), ...Array(6)].slice(0, 6)
    }

    const handleVerifyOTP = async () => {
      if (!isOtpComplete.value) return

      try {
        loading.value = true
        clearError()
        
        const otp = otpDigits.value.join('')
        await store.dispatch('user/verifyOTP', { email, otp })
        
        router.push({ 
          name: 'reset-password',
          params: { 
            email: email,
            otp: otp
          }
        })
      } catch (err) {
        error.value = err.response?.data?.message || 'Xác thực OTP thất bại'
        otpDigits.value = ['', '', '', '', '', '']
        document.querySelectorAll('.otp-input input')[0]?.focus()
      } finally {
        loading.value = false
      }
    }

    const resendOTP = async () => {
      try {
        loading.value = true
        clearError()
        
        await store.dispatch('user/forgotPassword', email)
        startCountdown()
      } catch (err) {
        error.value = err.response?.data?.message || 'Gửi lại OTP thất bại'
      } finally {
        loading.value = false
      }
    }

    // Start initial countdown
    startCountdown()

    // Cleanup
    onBeforeUnmount(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    })

    return {
      form,
      valid,
      loading,
      error,
      email,
      otpDigits,
      countdown,
      isOtpComplete,
      handleOtpInput,
      handleKeyDown,
      handlePaste,
      handleVerifyOTP,
      resendOTP,
      clearError
    }
  }
}
</script>

<style scoped>
.verify-otp-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f5f5f5;
}

.otp-input {
  width: 50px;
}

:deep(.otp-input input) {
  text-align: center;
  font-size: 1.2em;
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
  
  .otp-input {
    width: 40px;
  }
}
</style>
