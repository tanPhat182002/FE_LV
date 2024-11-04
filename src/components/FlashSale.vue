<!-- components/FlashSale.vue -->
<template>
  <v-card v-if="hasActiveFlashSale" class="mb-4" elevation="1">
    <!-- Flash Sale Header -->
    <v-card-item class="bg-error">
      <template v-slot:prepend>
        <v-icon color="white" icon="mdi-flash" class="me-2"></v-icon>
      </template>
      
      <v-card-title class="text-white">
        Flash Sale
      </v-card-title>
      
      <v-spacer></v-spacer>
      
      <!-- Countdown Timer -->
      <CountdownTimer 
        v-if="flashSaleEndTime"
        :end-time="flashSaleEndTime"
        @timeout="handleTimeout"
      />
    </v-card-item>

    <!-- Flash Sale Products -->
    <v-card-text class="pa-4">
      <v-row>
        <v-col
          v-for="product in flashSaleProducts"
          :key="product.id"
          cols="12"
          sm="6"
          md="3"
          class="d-flex"
        >
          <v-card
            :to="`/products/${product.id}`"
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
                <div class="text-error text-h6 font-weight-bold">
                  {{ product.price.final }}
                </div>
                <div
                  v-if="product.price.hasDiscount"
                  class="text-grey text-decoration-line-through ms-2"
                >
                  {{ product.price.original }}
                </div>
              </div>

              <!-- Sales Progress -->
              <template v-if="product.soldInfo">
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
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import CountdownTimer from './home/CountdownTimer.vue'

const store = useStore()

// Computed
const hasActiveFlashSale = computed(() => store.getters['home/hasActiveFlashSale'])
const flashSaleProducts = computed(() => store.getters['home/flashSaleProducts'])
const flashSaleEndTime = computed(() => store.getters['home/flashSaleEndTime'])

// Methods
const handleTimeout = async () => {
  await store.dispatch('home/fetchFlashSale')
}
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.rounded {
  border-radius: 8px !important;
}

.v-card-text {
  padding: 16px !important;
}
</style>