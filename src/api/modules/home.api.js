import api from '../axios'

export default {
  // Get featured/new products for home page
  getProducts(params) {
    return api.get('/home', { params })
  },

  // Get flash sale data
  getFlashSale() {
    return api.get('/home/flash-sale')
  },

  // Get product detail
  getProductDetail(id) {
    return api.get(`/home/getDetail/${id}`)
  }
}