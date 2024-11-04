<template>
    <v-navigation-drawer
      v-model="drawer"
      app
      class="primary lighten-3"
      @update:modelValue="$emit('update:modelValue', $event)"
    >
      <v-list-item class="my-4">
        <v-list-item-avatar size="40">
          <v-img src="/logo.png" alt="Logo"></v-img>
        </v-list-item-avatar>
        <v-list-item-title class="text-h6 white--text">
          Admin Panel
        </v-list-item-title>
      </v-list-item>
  
      <v-divider></v-divider>
  
      <v-list nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          :prepend-icon="item.icon"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title class="white--text">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script>
  export default {
    name: 'AdminSidebar',
    props: {
      modelValue: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      drawer: {
        get() {
          return this.modelValue
        },
        set(value) {
          this.$emit('update:modelValue', value)
        }
      },
      menuItems() {
        return [
          { title: 'Dashboard', icon: 'mdi-view-dashboard', route: '/admin/dashboard' },
          { title: 'Quản Lý Danh mục', icon: 'mdi-package', route: '/admin/categories' }, // Sửa route thành /admin/categories
          { title: 'Quản Lý Thương Hiệu', icon: 'mdi-package', route: '/admin/brands' },
          { title: 'Quản lý Sản Phẩm', icon: 'mdi-package', route: '/admin/products' },
          { title: 'Quản lý Màu Sắc', icon: 'mdi-package', route: '/admin/colors' },
          { title: 'Quản lý Kích Thước', icon: 'mdi-package', route: '/admin/sizes' }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .v-list-item--active {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  .v-list-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
    transition: background-color 0.3s ease;
  }
  </style>