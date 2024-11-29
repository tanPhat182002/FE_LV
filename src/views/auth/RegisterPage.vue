<template>
  <v-container fluid class="fill-height bg-grey-lighten-4">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
          <!-- Header -->
          <div class="text-center mb-4">
            <h2 class="text-h4 font-weight-bold mb-2">
              Đăng ký tài khoản
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              Đã có tài khoản?
              <v-btn
                variant="text"
                color="primary"
                :to="{ name: 'login' }"
                class="px-1"
              >
                Đăng nhập ngay
              </v-btn>
            </p>
          </div>

          <!-- Form -->
          <v-form @submit.prevent="handleRegister" ref="form">
            <!-- Họ tên -->
            <v-text-field
              v-model="formData.name"
              label="Họ tên"
              variant="outlined"
              :rules="[rules.required]"
              required
            ></v-text-field>

            <!-- Email -->
            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              variant="outlined"
              :rules="[rules.required, rules.email]"
              required
            ></v-text-field>

            <!-- Mật khẩu -->
            <v-text-field
              v-model="formData.password"
              label="Mật khẩu"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              :rules="[rules.required, rules.password]"
              required
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>

            <!-- Xác nhận mật khẩu -->
            <v-text-field
              v-model="formData.password_confirmation"
              label="Xác nhận mật khẩu"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              :rules="[rules.required, rules.passwordMatch]"
              required
            ></v-text-field>

            <!-- Nút đăng ký -->
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="isLoading"
              class="mt-2"
            >
              {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký' }}
            </v-btn>
          </v-form>

          <!-- Social Register -->
          <v-divider class="my-4">
            <span class="text-medium-emphasis">Hoặc đăng ký với</span>
          </v-divider>

          <v-row>
            <v-col cols="6">
              <v-btn
                block
                variant="outlined"
                @click="handleGoogleRegister"
                prepend-image="@/assets/images/google.svg"
              >
                Google
              </v-btn>
            </v-col>
            
            <v-col cols="6">
              <v-btn
                block
                variant="outlined"
                @click="handleFacebookRegister"
                prepend-image="@/assets/images/facebook.svg"
              >
                Facebook
              </v-btn>
            </v-col>
          </v-row>

          <!-- Error Alert -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ error }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()
const form = ref(null)
const showPassword = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

// Validation rules
const rules = {
  required: v => !!v || 'Trường này là bắt buộc',
  email: v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
  password: v => v.length >= 8 || 'Mật khẩu phải có ít nhất 8 ký tự',
  passwordMatch: v => v === formData.value.password || 'Mật khẩu xác nhận không khớp'
}

// Store getters
const isLoading = computed(() => store.getters['user/isLoading'])
const error = computed(() => store.getters['user/error'])

// Methods
const handleRegister = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    // Đăng ký
    await store.dispatch('user/register', formData.value)
    
    // Tự động đăng nhập sau khi đăng ký
    await store.dispatch('user/login', {
      email: formData.value.email,
      password: formData.value.password
    })
    
    // Chuyển hướng về trang chủ
    router.push({ 
      name: 'home',
      query: { registered: 'success' }
    })
  } catch (error) {
    console.error('Register error:', error)
  }
}

const handleGoogleRegister = async () => {
  try {
    const url = await store.dispatch('user/getGoogleSignInUrl')
    window.location.href = url
  } catch (error) {
    console.error('Google register error:', error)
  }
}

const handleFacebookRegister = async () => {
  try {
    const url = await store.dispatch('user/getFacebookSignInUrl')
    window.location.href = url
  } catch (error) {
    console.error('Facebook register error:', error)
  }
}
</script>