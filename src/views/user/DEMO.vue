<template>
    <div class="product-table-container">
        <!-- Loading and Error States -->
        <div v-if="loading" class="loading-state">
            <span class="loading-text">Đang tải dữ liệu...</span>
        </div>
        
        <div v-else-if="error" class="error-state">
            <p class="error-message">{{ error }}</p>
            <button @click="fetchProducts" class="retry-button">
                Thử lại
            </button>
        </div>

        <template v-else>
            <!-- Filter Section -->
            <div class="filters-section">
                <div class="filter-group" ref="filterRef">
                    <input
                        type="text"
                        v-model="idFilter"
                        placeholder="Lọc theo ID..."
                        class="filter-input"
                        @input="handleFilter"
                    />
                </div>
            </div>

            <!-- Table -->
            <table class="product-table">
                <thead>
                    <tr>
                        <th>
                            ID
                            <span 
                                class="sort-icon" 
                                @click="toggleSort"
                                :title="sortDirection === 'none' ? 'Click để sắp xếp' : 
                                        sortDirection === 'asc' ? 'Đang sắp xếp tăng dần' : 'Đang sắp xếp giảm dần'"
                            >
                                {{ sortIcon }}
                            </span>
                        </th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in sortedAndFilteredProducts" 
                        :key="product.id"
                        class="product-row"
                    >
                        <td>{{ product.id }}</td>
                        <td>{{ product.name }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- No Results Message -->
            <div v-if="sortedAndFilteredProducts.length === 0" class="no-data">
                Không tìm thấy sản phẩm nào
            </div>
        </template>
    </div>
</template>

<script setup>
import { onMounted, ref,  computed } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

// State
const products = ref([])
const loading = ref(false)
const error = ref(null)
const idFilter = ref('')
const sortDirection = ref('none') // 'none', 'asc', 'desc'

// Computed Properties
const filteredProducts = computed(() => {
    if (!idFilter.value.trim()) return products.value
    
    const filterValue = idFilter.value.toString().trim().toLowerCase()
    return products.value.filter(product => 
        product.id.toString().toLowerCase().includes(filterValue)
    )
})

const sortedAndFilteredProducts = computed(() => {
    if (sortDirection.value === 'none') return filteredProducts.value
    
    return [...filteredProducts.value].sort((a, b) => {
        if (sortDirection.value === 'asc') {
            return a.id - b.id
        }
        return b.id - a.id
    })
})

const sortIcon = computed(() => {
    switch (sortDirection.value) {
        case 'none': return '↕️'
        case 'asc': return '↑'
        case 'desc': return '↓'
        default: return '↕️'
    }
})

// Methods
const handleFilter = () => {
    // Filtering is handled automatically through computed properties
}

const toggleSort = () => {
    sortDirection.value = sortDirection.value === 'none' ? 'asc' : 
                         sortDirection.value === 'asc' ? 'desc' : 'none'
}

async function fetchProducts() {
    try {
        loading.value = true
        error.value = null
        
        const response = await axios.get(`${API_URL}/products`)
        products.value = response.data.data || response.data
    } catch (err) {
        console.error('Error fetching products:', err)
        error.value = 'Không thể tải dữ liệu sản phẩm: ' + 
            (err.response?.data?.message || err.message)
    } finally {
        loading.value = false
    }
}

// Lifecycle Hooks
onMounted(() => {
    fetchProducts()
})
</script>

