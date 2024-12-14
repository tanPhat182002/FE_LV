<template>
    <v-app-bar app color="primary" elevation="4">
      <v-app-bar-nav-icon @click="$emit('toggle-drawer')" color="white"></v-app-bar-nav-icon>
      
      <v-toolbar-title class="text-white font-weight-bold">
        Admin Dashboard
      </v-toolbar-title>
  
      <v-spacer></v-spacer>
  
      <v-btn icon class="mr-2">
        <v-icon color="white">mdi-bell</v-icon>
        <v-badge color="error" content="2" dot></v-badge>
      </v-btn>
  
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="text-white">
            Admin
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="handleProfile">
            <v-list-item-title>
              <v-icon left>mdi-account</v-icon>
              Profile
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLogout">
            <v-list-item-title>
              <v-icon left>mdi-logout</v-icon>
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Snackbar for showing messages -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="3000"
      >
        {{ snackbar.message }}
      </v-snackbar>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    name: 'AdminHeader',

    data() {
      return {
        snackbar: {
          show: false,
          message: '',
          color: 'success'
        }
      }
    },

    methods: {
      handleProfile() {
        this.$router.push('/admin/profile')
      },

      handleLogout() {
        // Xóa token từ localStorage
        localStorage.removeItem('admin_token')
        
        // Hiển thị thông báo thành công
        this.showSnackbar('Đăng xuất thành công')
        
        // Chuyển về trang đăng nhập
        this.$router.push('/admin/login')
      },

      showSnackbar(message, color = 'success') {
        this.snackbar.message = message
        this.snackbar.color = color
        this.snackbar.show = true
      }
    }
  }
  </script>