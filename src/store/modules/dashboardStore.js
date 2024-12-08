import dashboardApi from '@/api/modules/dashboard.api'

export default {
    namespaced: true,

    state: {
        statistics: {
            overview: {
                total_orders: 0,
                total_products: 0,
                total_users: 0,
                total_revenue: 0
            },
            orders: {
                by_status: {}
            },
            revenue: {
                daily: [],
                monthly: []
            },
            products: {
                top_selling: []
            },
            ratings: {
                recent: [],
                stats: {
                    total: 0,
                    approved: 0,
                    pending: 0,
                    average: 0
                }
            }
        },
        revenueStats: {
            summary: {
                total_orders: 0,
                total_revenue: 0,
                average_order_value: 0,
                period: {
                    start: '',
                    end: '',
                    days: 0
                }
            },
            daily_stats: [],
            top_products: []
        },
        loading: false,
        error: null
    },

    mutations: {
        SET_STATISTICS(state, data) {
            state.statistics = data
        },
        SET_REVENUE_STATS(state, data) {
            state.revenueStats = data
        },
        SET_LOADING(state, status) {
            state.loading = status
        },
        SET_ERROR(state, error) {
            state.error = error
        }
    },

    actions: {
        // Lấy thống kê tổng quan
        async fetchStatistics({ commit }) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await dashboardApi.getStatistics()
                if (response.data.success) {
                    commit('SET_STATISTICS', response.data.data)
                    return response.data
                }
                throw new Error(response.data.message || 'Có lỗi xảy ra')
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // Thêm action cho thống kê theo khoảng thời gian
        async fetchRevenueByDateRange({ commit }, { startDate, endDate }) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            
            try {
                const response = await dashboardApi.getRevenueByDateRange(startDate, endDate)
                if (response.data.success) {
                    commit('SET_REVENUE_STATS', response.data.data)
                    return response.data
                }
                throw new Error(response.data.message || 'Có lỗi xảy ra')
            } catch (error) {
                commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra khi tải thống kê')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        }
    },

    getters: {
        isLoading: state => state.loading,
        getError: state => state.error,
        getOverview: state => state.statistics.overview,
        getOrdersByStatus: state => state.statistics.orders.by_status,
        getDailyRevenue: state => state.statistics.revenue.daily,
        getTopProducts: state => state.statistics.products.top_selling,
        getRecentRatings: state => state.statistics.ratings.recent,
        getRatingStats: state => state.statistics.ratings.stats,
        // Thêm getter để format doanh thu
        getFormattedRevenue: state => {
            return {
                ...state.statistics.overview,
                total_revenue: new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(state.statistics.overview.total_revenue)
            }
        },
        // Getter để lấy dữ liệu cho biểu đồ doanh thu
        getRevenueChartData: state => {
            const daily = state.statistics.revenue.daily
            return {
                labels: daily.map(item => item.date),
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: daily.map(item => item.revenue),
                        borderColor: '#4CAF50',
                        tension: 0.4
                    },
                    {
                        label: 'Số đơn hàng',
                        data: daily.map(item => item.orders),
                        borderColor: '#2196F3',
                        tension: 0.4
                    }
                ]
            }
        },
        // Getter để lấy dữ liệu cho biểu đồ trạng thái đơn hàng
        getOrderStatusChartData: state => {
            const statusData = state.statistics.orders.by_status
            const statusLabels = {
                'PENDING': 'Chờ xác nhận',
                'CONFIRMED': 'Đã xác nhận', 
                'SHIPPING': 'Đang giao',
                'COMPLETED': 'Hoàn thành',
                'CANCELLED': 'Đã hủy'
            }
            const statusColors = {
                'PENDING': '#4CAF50',    // Xanh lá
                'CONFIRMED': '#FF9800',  // Cam
                'SHIPPING': '#2196F3',   // Xanh dương
                'COMPLETED': '#3F51B5',  // Indigo
                'CANCELLED': '#F44336'   // Đỏ
            }
            
            return {
                labels: Object.keys(statusData).map(key => statusLabels[key]),
                datasets: [{
                    data: Object.values(statusData),
                    backgroundColor: Object.keys(statusData).map(key => statusColors[key]),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            }
        },
        // Thêm getters cho thống kê theo tháng
        getMonthlyRevenue: state => state.statistics.revenue.monthly,
        getMonthlyChartData: state => {
            const monthly = state.statistics.revenue.monthly
            return {
                labels: monthly.map(item => item.month),
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: monthly.map(item => item.revenue),
                        borderColor: '#4CAF50',
                        tension: 0.4
                    },
                    {
                        label: 'Số đơn hàng',
                        data: monthly.map(item => item.orders),
                        borderColor: '#2196F3',
                        tension: 0.4
                    }
                ]
            }
        },
        // Getters cho thống kê theo khoảng thời gian
        getRevenueStats: state => state.revenueStats,
        getRevenueStatsSummary: state => state.revenueStats.summary,
        getRevenueDailyStats: state => state.revenueStats.daily_stats,
        getRevenueTopProducts: state => state.revenueStats.top_products,
        
        // Getter cho biểu đồ thống kê theo khoảng thời gian
        getRevenueStatsChartData: state => {
            const dailyStats = state.revenueStats.daily_stats
            return {
                labels: dailyStats.map(item => item.date),
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: dailyStats.map(item => item.revenue),
                        borderColor: '#4CAF50',
                        tension: 0.4
                    },
                    {
                        label: 'Số đơn hàng',
                        data: dailyStats.map(item => item.orders),
                        borderColor: '#2196F3',
                        tension: 0.4
                    },
                    {
                        label: 'Giá trị trung bình',
                        data: dailyStats.map(item => item.average_order),
                        borderColor: '#FF9800',
                        tension: 0.4
                    }
                ]
            }
        }
    }
}

