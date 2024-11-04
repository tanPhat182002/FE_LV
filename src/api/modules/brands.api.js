import api from '../axios'

const resource = '/brands'

export default {
    index(params) {
        return api.get(`${resource}`, { params })
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    show(id) {
        return api.get(`${resource}/${id}`)
            .then(response => {
                return Promise.resolve(response)
            })
            .catch(error => {
                return Promise.reject(error)
            })
    },

    store(data) {
        const formData = new FormData()
        
        if (data.image) {
            formData.append('image', data.image)
        }
        formData.append('name', data.name)

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

    update(id, data) {
        const formData = new FormData()
        
        if (data.image) {
            formData.append('image', data.image)
        }
        if (data.name) {
            formData.append('name', data.name)
        }
        formData.append('_method', 'PUT') // Laravel requirement for PUT/PATCH

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