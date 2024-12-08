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

  getDetail(id) {
    return api.get(`${resource}/getDetail/${id}`)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

  getAllProducts(params = {}) {
    return api.get(`${resource}/allproduct`, {
      params: {
        category: params.category,
        brand: params.brand,
        price_min: params.priceMin,
        price_max: params.priceMax,
        color: params.color,
        size: params.size,
        promotion: params.hasPromotion,
        rating: params.rating,
        search: params.search,
        sort_by: params.sortBy,
        per_page: params.perPage || 12,
        page: params.page || 1
      }
    })
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

 
}