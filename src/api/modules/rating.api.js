import api from '../axios'

export default {
    // Lấy danh sách đánh giá (admin)
    getRatings(params = {}) {
        return api.get('/ratings', { params })
    },

    // Phê duyệt đánh giá (admin)
    approveRating(id) {
        return api.post(`/ratings/${id}/approve`)
    },

    // Từ chối đánh giá (admin)
    rejectRating(id) {
        return api.post(`/ratings/${id}/reject`)
    },

    // Tạo đánh giá mới (user)
    createRating(data) {
        return api.post('/user/ratings', data)
    },

    // Lấy danh sách đánh giá của user
    getUserRatings() {
        return api.get('/ratings/user')
    },

    // Lấy đánh giá của sản phẩm
    getProductRatings(productId, params = {}) {
        return api.get(`/products/${productId}/ratings`, { params })
    }
}
