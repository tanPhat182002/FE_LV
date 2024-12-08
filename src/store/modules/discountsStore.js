import discountsApi from '@/api/modules/discounts.api'

const discountsStore = {
  namespaced: true,
  
  state: () => ({
    discounts: [],
    discount: null,
    isLoading: false,
    error: null
  }),

  getters: {
    discounts: state => state.discounts,
    discount: state => state.discount,
    isLoading: state => state.isLoading,
    error: state => state.error
  },

  mutations: {
    SET_DISCOUNTS(state, discounts) {
      state.discounts = discounts
    },
    SET_DISCOUNT(state, discount) {
      state.discount = discount
    },
    SET_LOADING(state, status) {
      state.isLoading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },

  actions: {
    async fetchDiscounts({ commit }, params) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        const response = await discountsApi.getAll(params)
        commit('SET_DISCOUNTS', response.data.data)
        return response.data.data
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách mã giảm giá'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchDiscount({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        const response = await discountsApi.getOne(id)
        commit('SET_DISCOUNT', response.data.data)
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin mã giảm giá'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createDiscount({ commit, dispatch }, data) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        await discountsApi.create(data)
        await dispatch('fetchDiscounts')
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo mã giảm giá'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateDiscount({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        await discountsApi.update(id, data)
        await dispatch('fetchDiscounts')
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật mã giảm giá'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteDiscount({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        await discountsApi.delete(id)
        await dispatch('fetchDiscounts')
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa mã giảm giá'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async toggleDiscountStatus({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        await discountsApi.toggleStatus(id)
        await dispatch('fetchDiscounts')
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Kiểm tra mã giảm giá
    async checkDiscount({ commit }, data) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        const response = await discountsApi.checkDiscount(data)
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Mã giảm giá không hợp lệ'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Áp dụng mã giảm giá
    async applyDiscount({ commit }, data) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        const response = await discountsApi.applyDiscount(data)
        
        if (response.data.success) {
          commit('SET_DISCOUNT', response.data.data)
        }
        
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Không thể áp dụng mã giảm giá'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

export default discountsStore
