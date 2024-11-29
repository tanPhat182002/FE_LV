<template>
  <div class="social-callback-container">
    <v-card class="mx-auto pa-6" max-width="400">
      <div class="text-center">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <div class="text-h6 mb-4">
          {{ loading ? 'Đang xử lý đăng nhập...' : 'Chuyển hướng...' }}
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'SocialCallbackPage',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    const loading = ref(true)
    const error = ref('')

    const handleCallback = async () => {
      try {
        if (route.query.error) {
          throw new Error(route.query.error_description || 'Đăng nhập bị từ chối')
        }

        const provider = route.path.includes('google') ? 'google' : 'facebook'
        const code = route.query.code
        
        if (!code) {
          throw new Error('Không tìm thấy mã xác thực')
        }

        const response = await store.dispatch(`user/handle${provider.charAt(0).toUpperCase() + provider.slice(1)}Callback`, code)
        
        if (!response?.user) {
          throw new Error('Không nhận được thông tin người dùng')
        }
        
        router.push({ 
          name: 'home',
          query: { 
            message: `Đăng nhập bằng ${provider === 'google' ? 'Google' : 'Facebook'} thành công` 
          }
        })
      } catch (err) {
        console.error('Social callback error:', err)
        error.value = err.response?.data?.message || err.message || 'Đăng nhập thất bại'
        
        setTimeout(() => {
          router.push({ 
            name: 'login',
            query: { error: error.value }
          })
        }, 3000)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      handleCallback()
    })

    return {
      loading,
      error
    }
  }
}
</script>

<style scoped>
.social-callback-container {
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

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-card {
    width: 100%;
    margin: 1rem;
  }
}
</style>
