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
      currentPage: 1,
      totalPages: 1, 
      totalItems: 0,
      itemsPerPage: 10,
      lastPage: 1,
      from: null,
      to: null
    },
    filters: {
      search: '',
      brand_id: null,
      category_id: null,
      sortBy: 'created_at',
      sortDesc: true
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
    totalProducts: state => state.pagination.totalItems,
    
    // Get current page items count  
    currentPageItems: state => state.pagination.to - state.pagination.from + 1,
    
    // Check if is first page
    isFirstPage: state => state.pagination.currentPage === 1,
    
    // Check if is last page
    isLastPage: state => state.pagination.currentPage === state.pagination.lastPage,
  },

  mutations: {
    // Set products list
    SET_PRODUCTS(state, products) {
      state.products = products
    },

    // Set single product
    SET_PRODUCT(state, product) {
      state.product = product  
    },

    // Set loading state
    SET_LOADING(state, status) {
      state.isLoading = status
    },

    // Set error
    SET_ERROR(state, error) {
      state.error = error
    },

    // Set pagination data
    SET_PAGINATION(state, data) {
      state.pagination = {
        currentPage: data.current_page || 1,
        totalPages: data.last_page || 1,
        totalItems: data.total || 0,
        itemsPerPage: data.per_page || 10,
        lastPage: data.last_page || 1,
        from: data.from || 0,
        to: data.to || 0
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

        commit('SET_PRODUCTS', response.data.data)
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
        commit('SET_PRODUCT', response.data)
        
        return response.data

      } catch (error) {
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
        commit('UPDATE_PAGINATION_PAGE', page)
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
      commit('UPDATE_PAGINATION_PAGE', 1)
      await dispatch('fetchProducts')
    },

    // Reset filters
    async resetFilters({ commit, dispatch }) {
      commit('RESET_FILTERS')
      commit('UPDATE_PAGINATION_PAGE', 1)
      await dispatch('fetchProducts')
    }
  }
}

export default productsStore