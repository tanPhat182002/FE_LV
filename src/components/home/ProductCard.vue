<template>
  <v-card
    :to="{ name: 'product-detail', params: { id: product.id }}"
    width="100%"
    elevation="0"
    class="border rounded"
  >
    <!-- Product Image -->
    <v-img
      :src="product.mainImage"
      :alt="product.name"
      height="200"
      cover
      class="bg-grey-lighten-3"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular
            indeterminate
            color="grey-lighten-2"
          ></v-progress-circular>
        </div>
      </template>
      
      <template v-slot:error>
        <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
          <v-icon icon="mdi-image-off" color="grey"></v-icon>
        </div>
      </template>
    </v-img>

    <v-card-text>
      <!-- Product Name -->
      <div class="text-subtitle-1 font-weight-bold text-truncate mb-2">
        {{ product.name }}
      </div>

      <!-- Product Price -->
      <div class="d-flex align-center mb-2">
        <div 
          :class="{ 'text-error': isFlashSale || product.price.hasDiscount }"
          class="text-h6 font-weight-bold"
        >
          {{ product.price.final }}
        </div>
        <div
          v-if="product.price.hasDiscount"
          class="text-grey text-decoration-line-through ms-2"
        >
          {{ product.price.original }}
        </div>
      </div>

      <!-- Sales Progress (Flash Sale Only) -->
      <template v-if="isFlashSale && product.soldInfo">
        <v-progress-linear
          :model-value="product.soldInfo.soldPercentage"
          color="error"
          height="8"
          rounded
        >
          <template v-slot:default="{ value }">
            <div class="text-caption">
              Đã bán {{ Math.round(value) }}%
            </div>
          </template>
        </v-progress-linear>

        <div class="d-flex justify-space-between mt-1">
          <span class="text-caption">
            Đã bán: {{ product.soldInfo.soldCount }}
          </span>
          <span class="text-caption">
            Còn lại: {{ product.soldInfo.remaining }}
          </span>
        </div>
      </template>
    </v-card-text>

    <!-- Hover Effect -->
    <div class="card-overlay">
      <v-btn
        color="primary"
        variant="elevated"
        class="mx-2"
      >
        Xem chi tiết
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'

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
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.rounded {
  border-radius: 8px !important;
}

/* Hover Effect */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.v-card:hover .card-overlay {
  opacity: 1;
}
</style>