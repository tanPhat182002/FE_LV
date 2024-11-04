import api from '../axios'

export default {
  getAll(params) {
    return api.get('/categories', { params })
  },

  getOne(id) {
    return api.get(`/categories/${id}`)
  },

  create(data) {
    const formData = new FormData()
    if (data.image) {
      formData.append('image', data.image)
    }
    formData.append('name', data.name)
    
    return api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
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
    formData.append('_method', 'PUT') // Laravel requirement for PUT/PATCH with FormData
    
    return api.post(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  delete(id) {
    return api.delete(`/categories/${id}`)
  }
}