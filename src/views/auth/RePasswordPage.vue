<template>
  <div class="repassword-container">
    <v-card class="mx-auto pa-6" max-width="400">
      <v-card-title class="text-center text-h5 mb-4">
        Đặt lại mật khẩu
      </v-card-title>

      <v-form ref="form" v-model="valid" @submit.prevent="handleRePassword">
        <v-text-field
          v-model="formData.email"
          :rules="emailRules"
          label="Email"
          required
          variant="outlined"
        />

        <v-text-field
          v-model="formData.password"
          :rules="passwordRules"
          label="Mật khẩu mới"
          :type="showPassword ? 'text' : 'password'"
          required
          variant="outlined"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-model="formData.confirmPassword"
          :rules="confirmPasswordRules"
          label="Xác nhận mật khẩu"
          :type="showConfirmPassword ? 'text' : 'password'"
          required
          variant="outlined"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        />

        <v-btn
          block
          color="primary"
          size="large"
          type="submit"
          :loading="loading"
          class="mt-4"
        >
          Đặt lại mật khẩu
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'RePasswordPage',
  setup() {
    const store = useStore()
    const router = useRouter()
    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const formData = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const emailRules = [
      v => !!v || 'Email là bắt buộc',
      v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
    ]

    const passwordRules = [
      v => !!v || 'Mật khẩu là bắt buộc',
      v => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự'
    ]

    const confirmPasswordRules = [
      v => !!v || 'Xác nhận mật khẩu là bắt buộc',
      v => v === formData.value.password || 'Mật khẩu không khớp'
    ]

    const handleRePassword = async () => {
      const { valid } = await form.value.validate()
      if (!valid) return

      try {
        loading.value = true
        await store.dispatch('user/resetPassword', {
          email: formData.value.email,
          password: formData.value.password
        })
        router.push('/login')
      } catch (error) {
        console.error('Lỗi đặt lại mật khẩu:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      valid,
      loading,
      formData,
      emailRules,
      passwordRules,
      confirmPasswordRules,
      showPassword,
      showConfirmPassword,
      handleRePassword
    }
  }
}
</script>

<style scoped>
.repassword-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>