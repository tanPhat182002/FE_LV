<template>
  <v-card
    :to="{ name: 'product-detail', params: { id: product.id }}"
    width="100%"
    elevation="0"
    class="border rounded product-card"
  >
    <!-- Product Image Container -->
    <div class="image-container">
      <v-img
        :src="product.mainImage"
        :alt="product.name"
        class="product-image"
        :aspect-ratio="1"
        :cover="false"
        :contain="true"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="grey-lighten-2"></v-progress-circular>
          </div>
        </template>
        
        <template v-slot:error>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
            <v-icon icon="mdi-image-off" color="grey"></v-icon>
          </div>
        </template>
      </v-img>
    </div>

    <v-card-text :class="textPadding">
      <!-- Product Name -->
      <div 
        :class="['font-weight-bold text-truncate mb-2', nameTextClass]"
      >
        {{ product.name }}
      </div>

      <!-- Product Price -->
      <div class="d-flex align-center">
        <div 
          :class="[
            'font-weight-bold',
            priceTextClass,
            { 'text-error': isFlashSale || product.price.hasDiscount }
          ]"
        >
          {{ product.price.final }}
        </div>
        <div
          v-if="product.price.hasDiscount"
          :class="['text-grey text-decoration-line-through ms-2', originalPriceClass]"
        >
          {{ product.price.original }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useDisplay } from 'vuetify'

const display = useDisplay()

defineProps({
  product: {
    type: Object,
    required: true
  },
  isFlashSale: {
    type: Boolean,
    default: false
  }
})

// Responsive classes
const nameTextClass = computed(() => 
  display.xs.value ? 'text-subtitle-2' : 'text-subtitle-1'
)

const priceTextClass = computed(() => 
  display.xs.value ? 'text-subtitle-1' : 'text-h6'
)

const originalPriceClass = computed(() => 
  display.xs.value ? 'text-body-2' : 'text-body-1'
)

const textPadding = computed(() => 
  display.xs.value ? 'pa-2' : 'pa-4'
)
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.rounded {
  border-radius: 8px !important;
}

.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  background: #f5f5f5;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 8px;
}

@media (max-width: 600px) {
  .product-image {
    padding: 4px;
  }
}

/* Responsive styles */
@media (min-width: 960px) {
  .product-card:hover {
    transform: translateY(-4px);
  }
}
</style>