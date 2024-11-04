// api/modules/colors.api.js

import api from '../axios'

const resource = '/colors'

export default {
    // Lấy danh sách colors
    index(params) {
        return api.get(`${resource}`, { params })
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Lấy chi tiết color
    show(id) {
        return api.get(`${resource}/${id}`)
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Tạo color mới
    store(formData) {
        return api.post(`${resource}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Cập nhật color
    update(id, formData) {
        formData.append('_method', 'PUT') // Laravel requirement for PUT requests
        
        return api.post(`${resource}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    // Xóa color
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