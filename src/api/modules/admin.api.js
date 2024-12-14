import api from '../axios'

const resource = '/admin'

export default {
    // Đăng nhập
    loginAdmin(data) {
        return api.post(`${resource}/login`, data)
            .then(response => Promise.resolve(response))
            .catch(error => Promise.reject(error))
    },

}
