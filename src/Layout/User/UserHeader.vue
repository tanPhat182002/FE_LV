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
      Cart
      <v-badge
        v-if="cartCount > 0"
        color="error"
        :content="cartCount"
        offset-x="-12"
        offset-y="8"
      />
    </v-btn>

    <!-- Login Button -->
    <v-btn prepend-icon="mdi-account" color="primary">
      Login
    </v-btn>

    <!-- Mobile Menu Button -->
    <v-app-bar-nav-icon
      class="d-md-none"
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
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composable/useCart'

const router = useRouter()
const { cartCount } = useCart()

// State
const drawer = ref(false)

// Menu Items
const menuItems = [
  { title: 'Home', icon: 'mdi-home', route: '/' },
  { title: 'Products', icon: 'mdi-package', route: '/products' },
  { title: 'About', icon: 'mdi-information', route: '/about' },
  { title: 'Contact', icon: 'mdi-phone', route: '/contact' }
]
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