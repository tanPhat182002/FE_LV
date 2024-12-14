// store/modules/homeStore.js
import homeApi from '@/api/modules/home.api'

const homeStore = {
  namespaced: true,

  state: () => ({
    // Products
    products: [],
    productsLoading: false,
    productsError: null,
    productsPagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 12,
      total: 0
    },

    // Flash Sale
    flashSale: {
      isActive: false,
      info: null,
      products: [],
      loading: false,
      error: null
    },

    // Product Detail
    currentProduct: null,
    productDetailLoading: false,
    productDetailError: null,

    // All products
    allProducts: [],
    allProductsLoading: false,
    allProductsError: null,
    allProductsPagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 12,
      total: 0
    }
  }),

  getters: {
    // Products getters
    products: state => state.products,
    productsLoading: state => state.productsLoading,
    productsError: state => state.productsError,
    productsPagination: state => state.productsPagination,

    // Flash sale getters
    flashSaleIsActive: state => state.flashSale.isActive,
    flashSaleInfo: state => state.flashSale.info,
    flashSaleProducts: state => state.flashSale.products,
    flashSaleLoading: state => state.flashSale.loading,
    flashSaleError: state => state.flashSale.error,
    
    hasActiveFlashSale: state => 
      state.flashSale.isActive && state.flashSale.products.length > 0,

    flashSaleRemainingTime: state => {
      if (!state.flashSale.info?.end_time) return null
      
      const endTime = new Date(state.flashSale.info.end_time)
      const now = new Date()
      const diff = endTime - now
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 }
      }
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      }
    },

    // Product detail getters  
    currentProduct: state => state.currentProduct,
    productDetailLoading: state => state.productDetailLoading,
    productDetailError: state => state.productDetailError,

    // All products getters
    allProducts: state => state.allProducts,
    allProductsLoading: state => state.allProductsLoading,
    allProductsError: state => state.allProductsError,
    allProductsPagination: state => state.allProductsPagination
  },

  mutations: {
    // Products mutations
    SET_PRODUCTS(state, products) {
      state.products = products
    },
    SET_PRODUCTS_LOADING(state, status) {
      state.productsLoading = status
    },
    SET_PRODUCTS_ERROR(state, error) {
      state.productsError = error
    },
    SET_PRODUCTS_PAGINATION(state, pagination) {
      state.productsPagination = {
        currentPage: pagination.current_page || 1,
        lastPage: pagination.last_page || 1,
        perPage: pagination.per_page || 12,
        total: pagination.total || 0
      }
    },

    // Flash sale mutations
    SET_FLASH_SALE_DATA(state, data) {
      state.flashSale.isActive = data.is_active
      state.flashSale.info = data.flash_sale
      state.flashSale.products = data.products
    },
    SET_FLASH_SALE_LOADING(state, status) {
      state.flashSale.loading = status
    },
    SET_FLASH_SALE_ERROR(state, error) {
      state.flashSale.error = error
    },

    // Product detail mutations
    SET_CURRENT_PRODUCT(state, product) {
      state.currentProduct = product
    },
    SET_PRODUCT_DETAIL_LOADING(state, status) {
      state.productDetailLoading = status  
    },
    SET_PRODUCT_DETAIL_ERROR(state, error) {
      state.productDetailError = error
    },

    // All products mutations
    SET_ALL_PRODUCTS(state, products) {
      state.allProducts = products
    },
    SET_ALL_PRODUCTS_LOADING(state, status) {
      state.allProductsLoading = status
    },
    SET_ALL_PRODUCTS_ERROR(state, error) {
      state.allProductsError = error
    },
    SET_ALL_PRODUCTS_PAGINATION(state, pagination) {
      state.allProductsPagination = pagination
    }
  },

  actions: {
    // Fetch featured/new products
    async fetchProducts({ commit }, params = {}) {
      try {
        commit('SET_PRODUCTS_LOADING', true)
        commit('SET_PRODUCTS_ERROR', null)

        const response = await homeApi.getProducts(params)
        
        if (!response?.data?.success) {
          throw new Error('Failed to fetch products')
        }

        // Format products
        const formattedProducts = response.data.data.map(product => ({
          id: product.id,
          name: product.name,
          price: {
            original: product.price.original,
            final: product.price.final,
            hasDiscount: product.price.original !== product.price.final
          },
          mainImage: product.main_image,
          promotion: product.promotion
        }))
        
        commit('SET_PRODUCTS', formattedProducts)
        
        // Set pagination
        if (response.data.pagination) {
          commit('SET_PRODUCTS_PAGINATION', response.data.pagination)
        }

        return formattedProducts

      } catch (error) {
        console.error('Error fetching products:', error)
        const message = error.response?.data?.message || 'Có lỗi khi tải sản phẩm'
        commit('SET_PRODUCTS_ERROR', message)
        throw error
      } finally {
        commit('SET_PRODUCTS_LOADING', false)
      }
    },

    // Fetch flash sale data
    async fetchFlashSale({ commit }) {
      try {
        commit('SET_FLASH_SALE_LOADING', true)
        commit('SET_FLASH_SALE_ERROR', null)

        const response = await homeApi.getFlashSale()
        
        if (!response?.data?.success) {
          throw new Error('Failed to fetch flash sale data')
        }

        const flashSaleData = response.data.data
        const formattedData = {
          is_active: flashSaleData.is_active,
          flash_sale: flashSaleData.flash_sale,
          products: flashSaleData.products.map(product => ({
            id: product.id,
            name: product.name,
            price: {
              original: product.price.original,
              final: product.price.final,
              hasDiscount: product.price.original !== product.price.final,
              discount: product.price.discount
            },
            mainImage: product.main_image,
            soldInfo: product.sold_info ? {
              totalStock: product.sold_info.total_stock,
              soldCount: product.sold_info.sold_count,
              soldPercentage: product.sold_info.sold_percentage,
              remaining: product.sold_info.remaining
            } : null
          }))
        }
        
        commit('SET_FLASH_SALE_DATA', formattedData)
        return formattedData

      } catch (error) {
        console.error('Error fetching flash sale:', error)
        const message = error.response?.data?.message || 'Có lỗi khi tải flash sale'
        commit('SET_FLASH_SALE_ERROR', message)
        throw error
      } finally {
        commit('SET_FLASH_SALE_LOADING', false)
      }
    },

    // Fetch product detail
    async fetchProductDetail({ commit }, productId) {
      try {
        commit('SET_PRODUCT_DETAIL_LOADING', true)
        commit('SET_PRODUCT_DETAIL_ERROR', null)

        const response = await homeApi.getProductDetail(productId)

        if (!response?.data?.success) {
          throw new Error('Failed to fetch product detail')
        }

        const productData = response.data.data
        const formattedProduct = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          category: productData.category,
          price: {
            original: productData.price.original,
            final: productData.price.final,
            hasDiscount: productData.price.original !== productData.price.final,
            raw: productData.price.raw
          },
          promotion: productData.promotion ? {
            name: productData.promotion.name,
            discount: productData.promotion.discount,
            endDate: productData.promotion.end_date
          } : null,
          images: {
            main: productData.images.main,
            gallery: productData.images.gallery
          },
          variants: {
            byColor: productData.variants.by_color,
            totalStock: productData.variants.total_stock
          },
          ratings: {
            average: productData.ratings.average,
            total: productData.ratings.total,
            distribution: productData.ratings.distribution,
            latest: productData.ratings.latest
          }
        }

        commit('SET_CURRENT_PRODUCT', formattedProduct)
        return formattedProduct

      } catch (error) {
        console.error('Error fetching product detail:', error)
        const message = error.response?.data?.message || 'Có lỗi khi tải thông tin sản phẩm'
        commit('SET_PRODUCT_DETAIL_ERROR', message)
        throw error
      } finally {
        commit('SET_PRODUCT_DETAIL_LOADING', false)
      }
    },

    // Clear current product
    clearCurrentProduct({ commit }) {
      commit('SET_CURRENT_PRODUCT', null)
    },

    // Fetch all products
    async fetchAllProducts({ commit }, params) {
      try {
        commit('SET_ALL_PRODUCTS_LOADING', true)
        commit('SET_ALL_PRODUCTS_ERROR', null)

        const response = await homeApi.getAllProducts_Filter(params)

        if (!response?.data?.success) {
          throw new Error('Failed to fetch filtered products')
        }

        commit('SET_ALL_PRODUCTS', response.data.data)
        commit('SET_ALL_PRODUCTS_PAGINATION', response.data.pagination)

        return response.data.data

      } catch (error) {
        console.error('Error fetching filtered products:', error)
        const message = error.response?.data?.message || 'Có lỗi khi tải sản phẩm'
        commit('SET_ALL_PRODUCTS_ERROR', message)
        throw error
      } finally {
        commit('SET_ALL_PRODUCTS_LOADING', false)
      }
    }
  }
}

export default homeStore