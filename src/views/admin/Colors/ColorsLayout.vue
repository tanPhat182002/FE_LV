<!-- views/admin/Colors/ColorsLayout.vue -->
<template>
  <v-layout>
    <v-main>
      <v-container fluid class="pa-6">
        <!-- Breadcrumbs -->
        <v-card flat class="mb-4">
          <v-card-text class="pa-2">
            <v-breadcrumbs :items="breadcrumbs">
              <template v-slot:divider>
                <v-icon icon="mdi-chevron-right" color="grey"></v-icon>
              </template>
              <template v-slot:title="{ item }">
                <v-btn
                  :disabled="item.disabled"
                  variant="text"
                  :to="item.href"
                  class="text-none"
                  :class="{ 'current-page': item.disabled }"
                  density="comfortable"
                >
                  {{ item.title }}
                </v-btn>
              </template>
            </v-breadcrumbs>
          </v-card-text>
        </v-card>

        <!-- Main Content -->
        <v-card flat class="pa-4">
          <router-view></router-view>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const items = [
    {
      title: 'Màu sắc',
      disabled: false,
      href: '/admin/colors'
    }
  ]

  if (route.name === 'admin-colors-create') {
    items.push({
      title: 'Thêm mới',
      disabled: true,
      href: route.path
    })
  } else if (route.name === 'admin-colors-edit') {
    items.push({
      title: 'Chỉnh sửa', 
      disabled: true,
      href: route.path
    })
  }

  return items
})
</script>

<style scoped>
.v-main {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.v-container {
  max-width: 1400px;
  margin: 0 auto;
}

.v-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
}

.current-page {
  font-weight: 700 !important;
  color: black !important;
  cursor: default;
}
</style>