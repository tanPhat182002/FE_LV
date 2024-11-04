import sizesApi from '@/api/modules/sizes.api'

const sizesStore = {
    namespaced: true,
    
    state: () => ({
        sizes: [],
        size: null,
        isLoading: false,
        error: null
    }),

    getters: {
        sizes: state => state.sizes,
        size: state => state.size,
        isLoading: state => state.isLoading,
        error: state => state.error,
    },

    mutations: {
        SET_SIZES(state, sizes) {
            state.sizes = sizes
        },
        SET_SIZE(state, size) {
            state.size = size
        },
        SET_LOADING(state, status) {
            state.isLoading = status
        },
        SET_ERROR(state, error) {
            state.error = error
        },
        REMOVE_SIZE(state, id) {
            state.sizes = state.sizes.filter(s => s.id !== id)
        }
    },

    actions: {
        // Lấy danh sách sizes
        async fetchSizes({ commit }) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const response = await sizesApi.index()
                commit('SET_SIZES', response.data.data)

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Lấy chi tiết size
        async fetchSize({ commit }, id) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const response = await sizesApi.show(id)
                commit('SET_SIZE', response.data.data)

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Tạo size mới
        async createSize({ commit, dispatch }, data) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const response = await sizesApi.store(data)
                await dispatch('fetchSizes')

                return response.data

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo mới'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Cập nhật size
        async updateSize({ commit, dispatch }, { id, data }) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                const response = await sizesApi.update(id, data)
                await dispatch('fetchSizes')

                return response.data

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Xóa size
        async deleteSize({ commit }, id) {
            try {
                commit('SET_LOADING', true)
                commit('SET_ERROR', null)

                await sizesApi.delete(id)
                commit('REMOVE_SIZE', id)

                return true

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        }
    }
}

export default sizesStore