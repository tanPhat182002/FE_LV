import api from '../axios'

const resource = '/home'

export default {
  getProducts() {
    return api.get(`${resource}`)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

  getFlashSale() {
    return api.get(`${resource}/flash-sale`)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

  getProductDetail(id) {
    return api.get(`${resource}/getDetail/${id}`)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

  getAllProducts_Filter(params) {
    return api.get(`${resource}/allproduct`, { params })
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

  
  
}