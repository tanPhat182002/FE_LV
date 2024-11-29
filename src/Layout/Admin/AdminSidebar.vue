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
        <template v-for="item in menuItems" :key="item.title">
          <v-list-group v-if="item.children">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="item.icon"
                rounded="lg"
              >
                <v-list-item-title class="white--text">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </template>

            <v-list-item
              v-for="child in item.children"
              :key="child.title"
              :to="child.route"
              :prepend-icon="child.icon"
              rounded="lg"
              class="ml-4"
            >
              <v-list-item-title class="white--text">{{ child.title }}</v-list-item-title>
            </v-list-item>
          </v-list-group><v-list-item
            v-else
            :to="item.route"
            :prepend-icon="item.icon"
            rounded="lg"
            class="mb-1"
          >
            <v-list-item-title class="white--text">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
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
          {
            title: 'Quản lý Catalog',
            icon: 'mdi-database',
            children: [
              { title: 'Danh mục', icon: 'mdi-folder-outline', route: '/admin/categories' },
              { title: 'Thương hiệu', icon: 'mdi-folder-outline', route: '/admin/brands' },
              { title: 'Sản phẩm', icon: 'mdi-package-variant', route: '/admin/products' },
              { title: 'Màu sắc', icon: 'mdi-palette', route: '/admin/colors' },
              { title: 'Kích thước', icon: 'mdi-ruler', route: '/admin/sizes' },
           
            ]
          },
          { title: 'Marketting', icon: 'mdi-package', 
            children: [
              { title: 'Khuyến mãi ', icon: 'mdi-tag', route: '/admin/promotions' },
              { title: 'Mã giảm giá', icon: 'mdi-ticket-percent', route: '/admin/coupons' },
            ]
           },
          
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