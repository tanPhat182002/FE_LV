<template>
  <v-card elevation="1">
    <v-card-item>
      <v-card-title class="text-h6">
        <v-icon icon="mdi-star" class="me-2"></v-icon>
        Sản phẩm nổi bật
      </v-card-title>
    </v-card-item>

    <v-card-text class="pa-4">
      <v-row>
        <v-col
          v-for="product in products"
          :key="product.id"
          cols="6" 
          sm="4"
          md="3"
          class="d-flex"
        >
          <ProductCard 
            :product="product"
            class="flex-grow-1" 
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions v-if="hasMorePages" class="py-4 justify-center">
      <v-pagination
        v-model="currentPage"
        :length="pagination.lastPage"
        :total-visible="$vuetify.display.smAndDown ? 3 : 7"
        @update:model-value="handlePageChange"
      ></v-pagination>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import ProductCard from './ProductCard.vue'

const store = useStore()
const currentPage = ref(1)

// Computed
const products = computed(() => store.state.home.products)
const pagination = computed(() => store.state.home.productsPagination)
const hasMorePages = computed(() => pagination.value.lastPage > 1)

// Methods  
const handlePageChange = async (page) => {
  try {
    await store.dispatch('home/fetchProducts', { page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Error changing page:', error)
  }
}
</script>

<style scoped>
.v-row {
  margin: -8px;
}

.v-col {
  padding: 8px;
}

@media (max-width: 600px) {
  .v-row {
    margin: -4px;
  }
  
  .v-col {
    padding: 4px;
  }
}
</style>