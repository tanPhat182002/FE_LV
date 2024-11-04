<template>
    <v-app>
      <AdminHeader @toggle-drawer="drawer = !drawer" />
      
      <AdminSidebar v-model="drawer" />
      
      <v-main>
        <v-container fluid class="pa-6">
          <v-fade-transition mode="out-in">
            <router-view></router-view>
          </v-fade-transition>
        </v-container>
      </v-main>
  
      <!-- Floating Action Button -->
      <v-btn
        color="primary"
        class="ma-2"
        fixed
        bottom
        right
        fab
        @click="scrollToTop"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>
    </v-app>
  </template>
  
  <script>
  import AdminHeader from '@/Layout/Admin/AdminHeader.vue'
  import AdminSidebar from '@/Layout/Admin/AdminSidebar.vue'
  
  export default {
    name: 'AdminLayout',
    components: {
      AdminHeader,
      AdminSidebar
    },
    data() {
      return {
        drawer: true,
      }
    },
    methods: {
      scrollToTop() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .v-main {
    background-color: #f5f5f5;
  }
  </style>