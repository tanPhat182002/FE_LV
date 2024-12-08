import api from '../axios'

const resource = '/orders'

export default {
    // Tạo đơn hàng mới
    createOrder(data) {
        return api.post(resource, data)
    },

    // Xử lý kết quả thanh toán VNPay
    vnpayReturn(params) {
        return api.get(`${resource}/vnpay-return`, { params })
    },

    // Xử lý kết quả thanh toán MOMO
    momoReturn(params) {
        return api.get(`${resource}/momo-return`, { params })
    },

    // Lấy danh sách đơn hàng
    getOrders(params = {}) {
        return api.get(resource, { params })
    },

    // Lấy chi tiết đơn hàng
    getOrderDetail(id) {
        return api.get(`${resource}/${id}`)
    },

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus(id, data) {
        return api.put(`${resource}/${id}/status`, data)
    },

    // Lấy danh sách đơn hàng của user
    getUserOrders(params = {}) {
        return api.get('/user/orders', { params })
    },

    // Lấy chi tiết đơn hàng của user
    getUserOrderDetail(id) {
        return api.get(`/user/orders/${id}`)
    },

    // Thêm method mới để hủy đơn hàng
    cancelUserOrder(orderId) {
        return api.post(`/user/orders/${orderId}/cancel`)
    }
}
