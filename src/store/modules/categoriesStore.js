// store/modules/categoriesStore.js

import categoriesApi from '@/api/modules/categories.api'

const categoriesStore = {
 namespaced: true,
 
 state: () => ({
   categories: [], 
   category: null, 
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
   categories: state => state.categories,
   category: state => state.category,
   isLoading: state => state.isLoading,
   error: state => state.error,
   pagination: state => state.pagination,
   filters: state => state.filters,
   
   hasCategories: state => state.categories.length > 0,
   totalCategories: state => state.pagination.totalItems,
   currentPageItems: state => state.pagination.to - state.pagination.from + 1,
   isFirstPage: state => state.pagination.currentPage === 1,
   isLastPage: state => state.pagination.currentPage === state.pagination.lastPage
 },

 mutations: {
   SET_CATEGORIES(state, categories) {
     state.categories = categories
   },
   SET_CATEGORY(state, category) {
     state.category = category
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
   async fetchCategories({ commit, state }) {
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

       const response = await categoriesApi.getAll(params)
       
       commit('SET_CATEGORIES', response.data.data)
       commit('SET_PAGINATION', response.data)

     } catch (error) {
       const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách'
       commit('SET_ERROR', message)
       throw error
     } finally {
       commit('SET_LOADING', false) 
     }
   },

   async fetchCategory({ commit }, id) {
     try {
       commit('SET_LOADING', true)
       commit('CLEAR_ERROR')

       const response = await categoriesApi.getOne(id)
       commit('SET_CATEGORY', response.data)
       
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
       await dispatch('fetchCategories')
     } catch (error) {
       const message = error.response?.data?.message || 'Có lỗi xảy ra khi chuyển trang'
       commit('SET_ERROR', message)
       throw error
     }
   },

   async deleteCategory({ commit, dispatch, state }, id) {
     try {
       commit('SET_LOADING', true)
       commit('CLEAR_ERROR')

       await categoriesApi.delete(id)

       // Kiểm tra nếu xóa item cuối cùng của trang
       const isLastItem = state.categories.length === 1
       const notFirstPage = state.pagination.currentPage > 1

       if (isLastItem && notFirstPage) {
         // Lùi về trang trước
         await dispatch('setCurrentPage', state.pagination.currentPage - 1)
       } else {
         await dispatch('fetchCategories')
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

   async createCategory({ commit, dispatch }, data) {
     try {
       commit('SET_LOADING', true)
       commit('CLEAR_ERROR')

       const response = await categoriesApi.create(data)
       await dispatch('fetchCategories')
       
       return response.data

     } catch (error) {
       const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo mới'
       commit('SET_ERROR', message)
       throw error
     } finally {
       commit('SET_LOADING', false)
     }
   },

   async updateCategory({ commit, dispatch }, { id, data }) {
     try {
       commit('SET_LOADING', true)
       commit('CLEAR_ERROR')

       const response = await categoriesApi.update(id, data)
       await dispatch('fetchCategories')

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
     await dispatch('fetchCategories')
   },

   // Reset filters
   async resetFilters({ commit, dispatch }) {
     commit('RESET_FILTERS')
     commit('UPDATE_PAGINATION_PAGE', 1) 
     await dispatch('fetchCategories')
   }
 }
}

export default categoriesStore