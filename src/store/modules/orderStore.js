import orderApi from '@/api/modules/order.api'

export default {
    namespaced: true,

    state: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10
        },
        userOrders: [],
        userOrderDetail: null
    },

    mutations: {
        SET_ORDERS(state, orders) {
            state.orders = orders
        },
        SET_CURRENT_ORDER(state, order) {
            state.currentOrder = order
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
        },
        SET_USER_ORDERS(state, orders) {
            state.userOrders = orders
        },
        SET_USER_ORDER_DETAIL(state, order) {
            state.userOrderDetail = order
        }
    },

    actions: {
        // Tạo đơn hàng mới
        async createOrder({ commit }, orderData) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await orderApi.createOrder(orderData)
                
                if (response.data.success) {
                    commit('SET_CURRENT_ORDER', response.data.order)
                    return {
                        success: true,
                        order: response.data.order,
                        payment_url: response.data.payment_url
                    }
                }
                
                throw new Error(response.data.message || 'Có lỗi xảy ra')
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Xử lý kết quả thanh toán VNPay
        async vnpayReturn({ commit }, queryParams) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await orderApi.vnpayReturn(queryParams)
                
                if (response.data.success) {
                    commit('SET_CURRENT_ORDER', response.data.order)
                }
                
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Xử lý kết quả thanh toán MOMO
        async momoReturn({ commit }, queryParams) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await orderApi.momoReturn(queryParams)
                
                if (response.data.success) {
                    commit('SET_CURRENT_ORDER', response.data.order)
                }
                
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Lấy danh sách đơn hàng
        async fetchOrders({ commit }, params = {}) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await orderApi.getOrders(params)
                if (response.data.success) {
                    commit('SET_ORDERS', response.data.data.data)
                    commit('SET_PAGINATION', response.data.data)
                    return response.data
                }
                throw new Error(response.data.message || 'Có lỗi xảy ra')
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Lấy chi tiết đơn hàng
        async fetchOrderDetail({ commit }, orderId) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await orderApi.getOrderDetail(orderId)
                if (response.data.success) {
                    commit('SET_CURRENT_ORDER', response.data.data)
                }
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi tải chi tiết đơn hàng')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Cập nhật trạng thái đơn hàng
        async updateOrderStatus({ commit, dispatch }, { orderId, status, note }) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await orderApi.updateOrderStatus(orderId, { status, note })
                
                if (response.data.success) {
                    // Cập nhật đơn hàng hiện tại nếu đang xem chi tiết
                    if (this.state.currentOrder?.id === orderId) {
                        commit('SET_CURRENT_ORDER', response.data.data)
                    }
                    
                    // Refresh danh sách đơn hàng
                    await dispatch('fetchOrders')
                    
                    return {
                        success: true,
                        message: response.data.message,
                        order: response.data.data
                    }
                }
                
                throw new Error(response.data.message || 'Có lỗi xảy ra')
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        async getUserOrders({ commit }, params) {
            try {
                commit('SET_LOADING', true)
                const response = await orderApi.getUserOrders(params)
                commit('SET_USER_ORDERS', response.data.data)
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        async getUserOrderDetail({ commit }, id) {
            try {
                commit('SET_LOADING', true)
                const response = await orderApi.getUserOrderDetail(id)
                commit('SET_USER_ORDER_DETAIL', response.data.data)
                return response.data
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Thêm action mới để hủy đơn hàng
        async cancelUserOrder({ commit, dispatch }, orderId) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await orderApi.cancelUserOrder(orderId)
                
                if (response.data.success) {
                    // Refresh danh sách đơn hàng sau khi hủy
                    await dispatch('getUserOrders')
                    return {
                        success: true,
                        message: response.data.message,
                        order: response.data.order
                    }
                }
                
                throw new Error(response.data.message || 'Có lỗi xảy ra')
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        }
    },

    getters: {
        isLoading: state => state.loading,
        getError: state => state.error,
        getAllOrders: state => state.orders,
        getCurrentOrder: state => state.currentOrder,
        getPagination: state => state.pagination,
        getUserOrders: state => state.userOrders,
        getUserOrderDetail: state => state.userOrderDetail
    }
}
