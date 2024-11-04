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
          <v-list-item @click="() => {}">
            <v-list-item-title>
              <v-icon left>mdi-account</v-icon>
              Profile
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="() => {}">
            <v-list-item-title>
              <v-icon left>mdi-logout</v-icon>
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    name: 'AdminHeader',
  }
  </script>