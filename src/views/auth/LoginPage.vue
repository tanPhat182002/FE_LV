<template>
  <v-container fluid class="fill-height bg-grey-lighten-4">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
          <!-- Header -->
          <div class="text-center mb-4">
            <h2 class="text-h4 font-weight-bold mb-2">
              Đăng nhập vào tài khoản
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              Hoặc
              <v-btn
                variant="text"
                color="primary"
                :to="{ name: 'register' }"
                class="px-1"
              >
                đăng ký tài khoản mới
              </v-btn>
            </p>
          </div>

          <!-- Form -->
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              variant="outlined"
              required
              :rules="[rules.required, rules.email]"
            ></v-text-field>

            <v-text-field
              v-model="formData.password"
              label="Mật khẩu"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              required
              :rules="[rules.required]"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>

            <div class="d-flex justify-space-between align-center mb-6">
              <v-checkbox
                v-model="formData.remember"
                label="Ghi nhớ đăng nhập"
                hide-details
              ></v-checkbox>

              <v-btn
                variant="text"
                color="primary"
                :to="{ name: 'forgot-password' }"
                density="comfortable"
              >
                Quên mật khẩu?
              </v-btn>
            </div>

            <v-btn
              type="submit"
              color="primary"
              block
              :loading="isLoading"
              class="mb-4"
            >
              {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </v-btn>
          </v-form>

          <!-- Social Login -->
          <v-divider class="mb-4">
            <span class="text-medium-emphasis">Hoặc đăng nhập với</span>
          </v-divider>

          <v-row>
            <v-col cols="6">
              <v-btn
                block
                variant="outlined"
                @click="handleGoogleLogin"
                prepend-image="@/assets/images/google.svg"
              >
                Google
              </v-btn>
            </v-col>
            
            <v-col cols="6">
              <v-btn
                block
                variant="outlined"
                @click="handleFacebookLogin"
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
const showPassword = ref(false)

const formData = ref({
  email: '',
  password: '',
  remember: false
})

const rules = {
  required: v => !!v || 'Trường này là bắt buộc',
  email: v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
}

const isLoading = computed(() => store.getters['user/isLoading'])
const error = computed(() => store.getters['user/error'])

const handleLogin = async () => {
  try {
    await store.dispatch('user/login', formData.value)
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Login error:', error)
  }
}

const handleGoogleLogin = async () => {
  try {
    const url = await store.dispatch('user/getGoogleSignInUrl')
    window.location.href = url
  } catch (error) {
    console.error('Google login error:', error)
  }
}

const handleFacebookLogin = async () => {
  try {
    const url = await store.dispatch('user/getFacebookSignInUrl')
    window.location.href = url
  } catch (error) {
    console.error('Facebook login error:', error)
  }
}
</script>