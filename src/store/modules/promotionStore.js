import promotionsApi from '@/api/modules/promtions.api'

const promotionStore = {
  namespaced: true,
  
  state: () => ({
    promotions: [], // Danh sách khuyến mãi
    promotion: null, // Chi tiết khuyến mãi
    productsWithoutPromotion: [], // Sản phẩm chưa có khuyến mãi
    isLoading: false,
    error: null
  }),

  getters: {
    // Get list promotions
    promotions: state => state.promotions,
    
    // Get single promotion
    promotion: state => state.promotion,
    
    // Get products without promotion
    productsWithoutPromotion: state => state.productsWithoutPromotion,
    
    // Get loading state
    isLoading: state => state.isLoading,
    
    // Get error if exists
    error: state => state.error,

    // Check if has promotions
    hasPromotions: state => state.promotions.length > 0,
    
    // Get active promotions
    activePromotions: state => state.promotions.filter(p => p.is_active),
  },

  mutations: {
    // Set promotions list
    SET_PROMOTIONS(state, promotions) {
      state.promotions = promotions
    },

    // Set single promotion
    SET_PROMOTION(state, promotion) {
      state.promotion = promotion
    },

    // Set products without promotion
    SET_PRODUCTS_WITHOUT_PROMOTION(state, products) {
      state.productsWithoutPromotion = products
    },

    // Set loading state
    SET_LOADING(state, status) {
      state.isLoading = status
    },

    // Set error
    SET_ERROR(state, error) {
      state.error = error
    },

    // Clear error
    CLEAR_ERROR(state) {
      state.error = null
    }
  },

  actions: {
    // Fetch promotions list
    async fetchPromotions({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await promotionsApi.getAll()
        commit('SET_PROMOTIONS', response.data.data)

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách khuyến mãi'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Fetch single promotion
    async fetchPromotion({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const response = await promotionsApi.getOne(id)
        commit('SET_PROMOTION', response.data.data)
        return response.data.data

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin khuyến mãi'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Fetch products without promotion
    async fetchProductsWithoutPromotion({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await promotionsApi.getProductsWithoutPromotion()
        commit('SET_PRODUCTS_WITHOUT_PROMOTION', response.data.data)

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách sản phẩm'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Create promotion
    async createPromotion({ commit, dispatch }, data) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await promotionsApi.create(data)
        await dispatch('fetchPromotions')
        
        return response.data

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo khuyến mãi'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Update promotion
    async updatePromotion({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await promotionsApi.update(id, data)
        await dispatch('fetchPromotions')

        return response.data
        
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khuyến mãi'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Delete promotion
    async deletePromotion({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        await promotionsApi.delete(id)
        await dispatch('fetchPromotions')

        return true

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa khuyến mãi'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Toggle promotion status
    async togglePromotionStatus({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await promotionsApi.toggleStatus(id)
        await dispatch('fetchPromotions')

        return response.data

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Update promotion status
    async updatePromotionStatus({ commit, dispatch }, { id, isActive }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await promotionsApi.updateStatus(id, isActive)
        await dispatch('fetchPromotions')

        return response.data

      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Thêm action mới
    async removeProductFromPromotion({ commit, dispatch }, { promotionId, productId }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        await promotionsApi.removeProduct(promotionId, productId)
        // Refresh lại data promotion
        await dispatch('fetchPromotion', promotionId)

        return true
      } catch (error) {
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi gỡ sản phẩm'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}

export default promotionStore
