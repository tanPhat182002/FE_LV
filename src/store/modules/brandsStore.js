// store/modules/brandsStore.js

import brandsApi from '@/api/modules/brands.api'

const brandsStore = {
  namespaced: true,
  
  state: () => ({
    brands: [], 
    brand: null, 
    isLoading: false,
    error: null,
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
      sortBy: 'created_at',
      sortDesc: true
    }
  }),

  getters: {
    brands: state => state.brands,
    brand: state => state.brand,
    isLoading: state => state.isLoading,
    error: state => state.error,
    pagination: state => state.pagination,
    filters: state => state.filters,
    
    hasBrands: state => state.brands.length > 0,
    totalBrands: state => state.pagination.totalItems,
    currentPageItems: state => state.pagination.to - state.pagination.from + 1,
    isFirstPage: state => state.pagination.currentPage === 1,
    isLastPage: state => state.pagination.currentPage === state.pagination.lastPage
  },

  mutations: {
    SET_BRANDS(state, brands) {
      state.brands = brands
    },
    SET_BRAND(state, brand) {
      state.brand = brand
    },
    SET_LOADING(state, status) {
      state.isLoading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
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
    UPDATE_PAGINATION_PAGE(state, page) {
      state.pagination.currentPage = page
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    },
    RESET_FILTERS(state) {
      state.filters = {
        search: '',
        sortBy: 'created_at', 
        sortDesc: true
      }
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },

  actions: {
    async fetchBrands({ commit, state }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const params = {
          page: state.pagination.currentPage,
          per_page: state.pagination.itemsPerPage,
          search: state.filters.search,
          sort_by: state.filters.sortBy,
          sort_desc: state.filters.sortDesc
        }

        const response = await brandsApi.index(params)
        
        commit('SET_BRANDS', response.data.data)
        commit('SET_PAGINATION', response.data)

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false) 
      }
    },

    async fetchBrand({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await brandsApi.show(id)
        commit('SET_BRAND', response.data)
        
        return response.data

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async setCurrentPage({ commit, dispatch }, page) {
      try {
        commit('UPDATE_PAGINATION_PAGE', page)
        await dispatch('fetchBrands')
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi chuyển trang'
        commit('SET_ERROR', message)
        throw error
      }
    },

    async deleteBrand({ commit, dispatch, state }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        await brandsApi.delete(id)

        // Kiểm tra nếu xóa item cuối cùng của trang
        const isLastItem = state.brands.length === 1
        const notFirstPage = state.pagination.currentPage > 1

        if (isLastItem && notFirstPage) {
          // Lùi về trang trước
          await dispatch('setCurrentPage', state.pagination.currentPage - 1)
        } else {
          await dispatch('fetchBrands')
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

    async createBrand({ commit, dispatch }, data) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await brandsApi.store(data)
        await dispatch('fetchBrands')
        
        return response.data

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo mới'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateBrand({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await brandsApi.update(id, data)
        await dispatch('fetchBrands')

        return response.data
        
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Cập nhật filters
    async updateFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters)
      commit('UPDATE_PAGINATION_PAGE', 1)
      await dispatch('fetchBrands')
    },

    // Reset filters
    async resetFilters({ commit, dispatch }) {
      commit('RESET_FILTERS')
      commit('UPDATE_PAGINATION_PAGE', 1) 
      await dispatch('fetchBrands')
    }
  }
}

export default brandsStore