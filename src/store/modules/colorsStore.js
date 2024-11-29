// store/modules/colorsStore.js

import colorsApi from '@/api/modules/colors.api'

const colorsStore = {
    namespaced: true,

    state: () => ({
        colors: [],
        color: null,
        isLoading: false,
        error: null
    }),

    getters: {
        colors: state => state.colors,
        color: state => state.color,
        isLoading: state => state.isLoading,
        error: state => state.error,

        // Thêm getters hữu ích
        hasColors: state => state.colors.length > 0,
        getColorById: state => id => state.colors.find(c => c.id === id),
        getColorByName: state => name => state.colors.find(c => c.name === name)
    },

    mutations: {
        SET_COLORS(state, colors) {
            state.colors = colors
        },
        SET_COLOR(state, color) {
            state.color = color
        },
        SET_LOADING(state, status) {
            state.isLoading = status
        },
        SET_ERROR(state, error) {
            state.error = error
        },
        REMOVE_COLOR(state, id) {
            state.colors = state.colors.filter(c => c.id !== id)
        },
        CLEAR_ERROR(state) {
            state.error = null
        }
    },

    actions: {
        // Lấy danh sách colors
        async fetchColors({ commit }) {
            try {
                commit('SET_LOADING', true)
                commit('CLEAR_ERROR')

                const response = await colorsApi.index()
                commit('SET_COLORS', response.data.data)

                return response.data.data

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách màu'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Lấy chi tiết color
        async fetchColor({ commit }, id) {
            try {
                commit('SET_LOADING', true)
                commit('CLEAR_ERROR')

                const response = await colorsApi.show(id)
                commit('SET_COLOR', response.data.data)

                return response.data.data

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin màu'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Tạo color mới
        async createColor({ commit, dispatch }, formData) {
            try {
                commit('SET_LOADING', true)
                commit('CLEAR_ERROR')

                const response = await colorsApi.store(formData)
                await dispatch('fetchColors') // Refresh list

                return response.data

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi thêm màu'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Cập nhật color
        async updateColor({ commit, dispatch }, { id, data }) {
            try {
                commit('SET_LOADING', true) 
                commit('CLEAR_ERROR')

                const response = await colorsApi.update(id, data)
                await dispatch('fetchColors')
                return response.data

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật màu'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Xóa color
        async deleteColor({ commit }, id) {
            try {
                commit('SET_LOADING', true)
                commit('CLEAR_ERROR')

                await colorsApi.delete(id)
                commit('REMOVE_COLOR', id)

                return true

            } catch (error) {
                const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa màu'
                commit('SET_ERROR', message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        clearError({ commit }) {
            commit('CLEAR_ERROR')
        }
    }
}

export default colorsStore