import api from '../axios'

const resource = '/sizes'

export default {
    // Lấy danh sách sizes
    index(params) {
        return api.get(`${resource}`, { params })
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Lấy chi tiết size
    show(id) {
        return api.get(`${resource}/${id}`)
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Tạo size mới
    store(data) {
        return api.post(`${resource}`, data)
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Cập nhật size
    update(id, data) {
        return api.put(`${resource}/${id}`, data)
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Xóa size
    delete(id) {
        return api.delete(`${resource}/${id}`)
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    }
}