import authApi from '@/api/modules/user.api'

export default {
  namespaced: true,

  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    LOGOUT(state) {
      state.user = null
      state.token = null
      state.error = null
    }
  },

  actions: {
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')

        const response = await authApi.login(credentials)
        const { user, access_token } = response.data.data

        // Lưu token và user vào localStorage
        localStorage.setItem('token', access_token)
        localStorage.setItem('user', JSON.stringify(user))

        // Cập nhật state
        commit('SET_USER', user)
        commit('SET_TOKEN', access_token)

        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Đăng nhập thất bại'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      try {
        commit('SET_LOADING', true)
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Xóa dữ liệu local storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Reset state
        commit('LOGOUT')
        commit('SET_LOADING', false)
      }
    },

    // Khôi phục session từ localStorage
    initializeAuth({ commit }) {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        commit('SET_TOKEN', token)
        commit('SET_USER', JSON.parse(user))
      }
    },

    async getProfile({ commit }) {
      try {
        const response = await authApi.getProfile()
        console.log('Profile API response:', response)
        
        // Cập nhật user trong store và localStorage
        commit('SET_USER', response.data.data)
        return response
      } catch (error) {
        console.error('Get profile error:', error)
        throw error
      }
    },

    async updateProfile({ commit }, data) {
      try {
        const response = await authApi.updateProfile(data)
        
        // Cập nhật user sau khi update thành công
        commit('SET_USER', response.data.data)
        return response
      } catch (error) {
        console.error('Update profile error:', error)
        throw error
      }
    },

    async resendVerificationEmail() {
      try {
        return await authApi.resendVerificationEmail()
      } catch (error) {
        console.error('Resend verification email error:', error)
        throw error
      }
    },

    async verifyEmail(_, token) {
      try {
        const response = await authApi.verifyEmail(token)
        return response
      } catch (error) {
        console.error('Email verification error:', error)
        throw error
      }
    },

    async getGoogleSignInUrl({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await authApi.getGoogleSignInUrl()
        return response.data.url
      } catch (error) {
        commit('SET_ERROR', 'Không thể kết nối với Google')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async getFacebookSignInUrl({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await authApi.getFacebookSignInUrl()
        return response.data.url
      } catch (error) {
        commit('SET_ERROR', 'Không thể kết nối với Facebook')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async handleGoogleCallback({ commit }, code) {
      try {
        commit('SET_LOADING', true)
        const response = await authApi.handleGoogleCallback(code)
        const { user, access_token } = response.data
        
        commit('SET_USER', user)
        commit('SET_TOKEN', access_token)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Đăng nhập Google thất bại')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async handleFacebookCallback({ commit }, code) {
      try {
        commit('SET_LOADING', true)
        const response = await authApi.handleFacebookCallback(code)
        const { user, access_token } = response.data
        
        commit('SET_USER', user)
        commit('SET_TOKEN', access_token)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Đăng nhập Facebook thất bại')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async forgotPassword({ commit }, email) {
      try {
        commit('SET_LOADING', true)
        const response = await authApi.forgotPassword({ email })
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Không thể gửi mã xác thực'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async verifyOTP({ commit }, data) {
      try {
        commit('SET_LOADING', true)
        const response = await authApi.verifyOTP(data)
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Mã xác thực không hợp lệ'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async resetPassword({ commit }, data) {
      try {
        commit('SET_LOADING', true)
        const response = await authApi.resetPassword(data)
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Không thể đặt lại mật khẩu'
        commit('SET_ERROR', message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },

  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    isLoading: state => state.loading,
    getError: state => state.error
  }
}