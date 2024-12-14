<template>
  <v-container fluid fill-height class="login-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center text-h5 py-4">
            Đăng nhập Admin
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="formData.email"
                :rules="emailRules"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>

              <v-text-field
                v-model="formData.password"
                :rules="passwordRules"
                label="Mật khẩu"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn
              color="primary"
              block
              @click="handleLogin"
              :loading="loading"
            >
              Đăng nhập
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for showing messages -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import adminApi from '@/api/modules/admin.api'

export default {
  name: 'LoginAdminPage',
  
  data() {
    return {
      formData: {
        email: '',
        password: ''
      },
      loading: false,
      showPassword: false,
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      },
      emailRules: [
        v => !!v || 'Email là bắt buộc',
        v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
      ],
      passwordRules: [
        v => !!v || 'Mật khẩu là bắt buộc',
        v => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự'
      ]
    }
  },

  methods: {
    async handleLogin() {
      try {
        // Validate form
        const isValid = await this.$refs.form.validate()
        if (!isValid) return

        this.loading = true
        
        const response = await adminApi.loginAdmin(this.formData)
        
        // Lưu token vào localStorage hoặc Vuex store
        localStorage.setItem('admin_token', response.data.access_token)
        
        // Show success message
        this.showSnackbar('Đăng nhập thành công', 'success')
        
        // Redirect to admin dashboard
        this.$router.push('/admin/dashboard')
        
      } catch (error) {
        console.error('Login error:', error)
        this.showSnackbar(
          error.response?.data?.message || 'Đăng nhập thất bại',
          'error'
        )
      } finally {
        this.loading = false
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    }
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(to right, #141e30, #243b55);
  min-height: 100vh;
}
</style>