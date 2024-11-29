import api from '../axios'

const resource = '/auth'

export default {
    // Đăng nhập
    login(data) {
        return api.post(`${resource}/login`, data)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Đăng ký
    register(data) {
        return api.post(`${resource}/register`, data)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Đăng xuất
    logout() {
        return api.post('/logout')
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Lấy thông tin profile
    getProfile() {
        return api.get('/profile')
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Cập nhật profile
    updateProfile(data) {
        return api.post('/profile/update', data)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Lấy URL đăng nhập Google
    getGoogleSignInUrl() {
        return api.get(`${resource}/google/url`)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Lấy URL đăng nhập Facebook  
    getFacebookSignInUrl() {
        return api.get(`${resource}/facebook/url`)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Quên mật khẩu - Gửi email
    forgotPassword(data) {
        return api.post(`/forgot-password`, data)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Xác thực OTP
    verifyOTP(data) {
        return api.post(`/verify-otp`, data)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Reset mật khẩu
    resetPassword(data) {
        return api.post(`/reset-password`, data)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    handleGoogleCallback(code) {
        return api.get(`${resource}/google/callback`, { params: { code } })
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    handleFacebookCallback(code) {
        return api.get(`${resource}/facebook/callback`, { params: { code } })
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

    // Xác thực email
    verifyEmail(token) {
        return api.get(`verify-email/${token}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
    }
}
