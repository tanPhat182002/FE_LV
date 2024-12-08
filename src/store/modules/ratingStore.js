import ratingApi from '@/api/modules/rating.api'

export default {
    namespaced: true,

    state: {
        ratings: [],
        userRatings: [],
        productRatings: [],
        loading: false,
        error: null,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10
        },
        filterStatus: null,
    },

    mutations: {
        SET_RATINGS(state, ratings) {
            state.ratings = ratings
        },
        SET_USER_RATINGS(state, ratings) {
            state.userRatings = ratings
        },
        SET_PRODUCT_RATINGS(state, ratings) {
            state.productRatings = ratings
        },
        SET_LOADING(state, status) {
            state.loading = status
        },
        SET_ERROR(state, error) {
            state.error = error
        },
        SET_PAGINATION(state, pagination) {
            state.pagination = {
                currentPage: pagination.current_page,
                totalPages: pagination.last_page,
                totalItems: pagination.total,
                perPage: pagination.per_page
            }
        }
    },

    actions: {
        // Admin: Lấy danh sách đánh giá
        async getRatings({ commit, state }, params = {}) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const queryParams = {
                    ...params,
                    ...(state.filterStatus !== null && { is_approved: state.filterStatus })
                }
                
                const response = await ratingApi.getRatings(queryParams)
                commit('SET_RATINGS', response.data.data.data)
                commit('SET_PAGINATION', response.data.data)
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Admin: Phê duyệt đánh giá
        async approveRating({ commit, dispatch }, id) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await ratingApi.approveRating(id)
                // Refresh danh sách sau khi phê duyệt
                await dispatch('getRatings')
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Admin: Từ chối đánh giá
        async rejectRating({ commit, dispatch }, id) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await ratingApi.rejectRating(id)
                // Refresh danh sách sau khi từ chối
                await dispatch('getRatings')
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // User: Tạo đánh giá mới
        async createRating({ commit }, data) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await ratingApi.createRating(data)
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // User: Lấy danh sách đánh giá của user
        async getUserRatings({ commit }) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await ratingApi.getUserRatings()
                commit('SET_USER_RATINGS', response.data.data)
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Lấy đánh giá của sản phẩm
        async getProductRatings({ commit }, { productId, params = {} }) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await ratingApi.getProductRatings(productId, params)
                commit('SET_PRODUCT_RATINGS', response.data.data)
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        }
    },

    getters: {
        isLoading: state => state.loading,
        getError: state => state.error,
        getAllRatings: state => state.ratings,
        getUserRatings: state => state.userRatings,
        getProductRatings: state => state.productRatings,
        getPagination: state => state.pagination
    }
}
