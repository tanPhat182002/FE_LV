<template>
  <v-app-bar app flat class="px-3">
    <!-- Logo -->
    <v-img
      src="/logo.png"
      max-height="40"
      max-width="40"
      class="cursor-pointer"
      @click="router.push('/')"
    />

    <v-spacer />

    <!-- Desktop Menu -->
    <div class="d-none d-md-flex">
      <v-btn
        v-for="item in menuItems"
        :key="item.title"
        :to="item.route"
        variant="text"
        class="mx-2"
      >
        <v-icon start>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
    </div>

    <v-spacer />

    <!-- Cart Button -->
    <v-btn prepend-icon="mdi-cart" class="mr-4" to="/cart">
      Giỏ hàng
      <v-badge
        v-if="cartCount > 0"
        color="error"
        :content="cartCount"
        offset-x="-12"
        offset-y="8"
      />
    </v-btn>

    <!-- User Menu -->
    <template v-if="isAuthenticated">
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            prepend-icon="mdi-account"
          >
            {{ user?.name || 'Tài khoản' }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item to="/profile">
            <v-list-item-title>
              <v-icon start>mdi-account-circle</v-icon>
              Thông tin cá nhân
            </v-list-item-title>
          </v-list-item>
          
          <v-list-item to="/orders">
            <v-list-item-title>
              <v-icon start>mdi-package-variant</v-icon>
              Đơn hàng của tôi
            </v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="handleLogout">
            <v-list-item-title class="text-error">
              <v-icon start color="error">mdi-logout</v-icon>
              Đăng xuất
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- Login Button -->
    <v-btn
      v-else
      prepend-icon="mdi-account"
      color="primary"
      to="/login"
    >
      Đăng nhập
    </v-btn>

    <!-- Mobile Menu Button -->
    <v-app-bar-nav-icon
      class="d-md-none ml-4"
      @click="drawer = true"
    />

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          :prepend-icon="item.icon"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Mobile User Menu -->
      <v-list v-if="isAuthenticated">
        <v-list-item to="/profile" prepend-icon="mdi-account-circle">
          <v-list-item-title>Thông tin cá nhân</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/orders" prepend-icon="mdi-package-variant">
          <v-list-item-title>Đơn hàng của tôi</v-list-item-title>
        </v-list-item>

        <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
          <v-list-item-title class="text-error">Đăng xuất</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Add Login Button for Mobile when not authenticated -->
      <v-list v-else>
        <v-list-item to="/login" prepend-icon="mdi-account">
          <v-list-item-title>Đăng nhập</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useCart } from '@/composable/useCart'

const router = useRouter()
const store = useStore()
const { cartCount } = useCart()

// State
const drawer = ref(false)

// Computed properties để lấy thông tin user từ store
const isAuthenticated = computed(() => store.getters['user/isAuthenticated'])
const user = computed(() => store.getters['user/currentUser'])

// Menu Items
const menuItems = [
  { title: 'Trang chủ', icon: 'mdi-home', route: '/' },
  { title: 'Sản phẩm', icon: 'mdi-package', route: '/products' },
  { title: 'Giới thiệu', icon: 'mdi-information', route: '/about' },
  { title: 'Liên hệ', icon: 'mdi-phone', route: '/contact' }
]

// Logout handler
const handleLogout = async () => {
  try {
    await store.dispatch('user/logout')
    // Xóa token và thông tin người dùng khỏi localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Chuyển hướng về trang chủ thay vì login
    router.push({
      name: 'home',
      query: { 
        message: 'Đăng xuất thành công' 
      }
    })
  } catch (error) {
    console.error('Logout error:', error)
    // Nếu lỗi Unauthenticated, vẫn xóa dữ liệu local và chuyển hướng
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push({
        name: 'home',
        query: { 
          message: 'Phiên đăng nhập đã hết hạn' 
        }
      })
    }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

:deep(.v-badge__badge) {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
}
</style>