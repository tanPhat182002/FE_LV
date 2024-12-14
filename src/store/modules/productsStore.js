// src/store/modules/productsStore.js

import productsApi from '@/api/modules/products.api'

const productsStore = {
  namespaced: true,
  
  state: () => ({
    products: [], // Danh sách sản phẩm
    product: null, // Chi tiết sản phẩm
    isLoading: false, // Trạng thái loading
    error: null, // Lỗi nếu có
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      from: 0,
      to: 0
    },
    filters: {
      search: '',
      brand_id: null,
      category_id: null,
      is_active: null
    }
  }),

  getters: {
    // Get list products
    products: state => state.products,
    
    // Get single product
    product: state => state.product,
    
    // Get loading state
    isLoading: state => state.isLoading,
    
    // Get error if exists
    error: state => state.error,
    
    // Get pagination
    pagination: state => state.pagination,
    
    // Get filters
    filters: state => state.filters,

    // Check if has products
    hasProducts: state => state.products.length > 0,
    
    // Get total products
    totalProducts: state => state.pagination.total,
    
    // Get current page items count  
    currentPageItems: state => state.pagination.per_page,
    
    // Check if is first page
    isFirstPage: state => state.pagination.current_page === 1,
    
    // Check if is last page
    isLastPage: state => state.pagination.current_page === state.pagination.last_page,
  },

  mutations: {
    // Set products list
    SET_PRODUCTS(state, response) {
      if (response.success) {
        state.products = response.data.data
        state.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to
        }
      }
    },

    // Set single product
    SET_PRODUCT(state, product) {
      state.product = product  
    },

    // Set loading state
    SET_LOADING(state, loading) {
      state.isLoading = loading
    },

    // Set error
    SET_ERROR(state, error) {
      state.error = error
    },

    // Set pagination data
    SET_PAGINATION(state, pagination) {
      state.pagination = {
        current_page: pagination.current_page,
        last_page: pagination.last_page,
        per_page: pagination.per_page,
        total: pagination.total,
        from: pagination.from,
        to: pagination.to
      }
    },

    // Update current page
    UPDATE_PAGINATION_PAGE(state, page) {
      state.pagination.currentPage = page
    },

    // Set filters
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    },

    // Reset filters
    RESET_FILTERS(state) {
      state.filters = {
        search: '',
        brand_id: null,
        category_id: null,
        sortBy: 'created_at',
        sortDesc: true
      }
    },

    // Clear error
    CLEAR_ERROR(state) {
      state.error = null
    },

    SET_CURRENT_PAGE(state, page) {
      state.pagination.current_page = page
    }
  },

  actions: {
    // Fetch products list
    async fetchProducts({ commit, state }) {
      try {
        console.log('Fetching products...')
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const params = {
          page: state.pagination.currentPage,
          per_page: state.pagination.itemsPerPage,
          search: state.filters.search,
          brand_id: state.filters.brand_id,
          category_id: state.filters.category_id,
          sort_by: state.filters.sortBy,
          sort_desc: state.filters.sortDesc
        }

        console.log('Request params:', params)
        const response = await productsApi.getAll(params)
        console.log('Response:', response)

        commit('SET_PRODUCTS', response.data)
        commit('SET_PAGINATION', response.data)

      } catch (error) {
        console.error('Error:', error)
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Fetch single product
    async fetchProduct({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const response = await productsApi.getOne(id)
        console.log('API Response:', response) // Debug response

        if (!response.data) {
          throw new Error('Không có dữ liệu sản phẩm')
        }

        // Đảm bảo dữ liệu được format đúng trước khi commit
        const productData = {
          ...response.data,
          variants: response.data.variants || [],
          images: response.data.images || [],
          is_active: response.data.is_active ?? true
        }

        commit('SET_PRODUCT', productData)
        return productData

      } catch (error) {
        console.error('Fetch product error:', error)
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Update page
    async setCurrentPage({ commit, dispatch }, page) {
      try {
        commit('SET_CURRENT_PAGE', page)
        await dispatch('fetchProducts')
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi chuyển trang'
        commit('SET_ERROR', message)
        throw error
      }
    },

    // Create product
    async createProduct({ commit, dispatch }, formData) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await productsApi.create(formData)
        await dispatch('fetchProducts')
        
        return response.data

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo mới'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Update product
    async updateProduct({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await productsApi.update(id, data)
        await dispatch('fetchProducts')

        return response.data
        
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Delete product
    async deleteProduct({ commit, dispatch, state }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        await productsApi.delete(id)

        // Check if delete last item of page
        const isLastItem = state.products.length === 1
        const notFirstPage = state.pagination.currentPage > 1

        if (isLastItem && notFirstPage) {
          // Go to previous page
          await dispatch('setCurrentPage', state.pagination.currentPage - 1)
        } else {
          await dispatch('fetchProducts')
        }

        return true

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Update filters
    async updateFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters)
      commit('SET_CURRENT_PAGE', 1)
      await dispatch('fetchProducts')
    },

    // Reset filters
    async resetFilters({ commit, dispatch }) {
      commit('RESET_FILTERS')
      commit('SET_CURRENT_PAGE', 1)
      await dispatch('fetchProducts')
    },
    async deleteImage({ commit }, { productId, imageId }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
    
        await productsApi.deleteImage(productId, imageId)
        return true
    
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa ảnh'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Delete product variant  
    async deleteVariant({ commit }, { productId, variantId }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
    
        await productsApi.deleteVariant(productId, variantId) 
        return true
    
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa biến thể'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

export default productsStore