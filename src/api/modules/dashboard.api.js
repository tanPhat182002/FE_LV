import api from '../axios'

export default {
    // Lấy thống kê tổng quan
    getStatistics() {
        return api.get('/dashboard/statistics')
    },

    getRevenueByDateRange(startDate, endDate) {
        return api.get('/dashboard/revenue', {
            params: { start_date: startDate, end_date: endDate }
        })
    }
}
