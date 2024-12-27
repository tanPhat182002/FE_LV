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
    const url = new URL(`${resource}/allproduct`, api.defaults.baseURL)
    
    if (params.page) url.searchParams.append('page', params.page)
    if (params.per_page) url.searchParams.append('per_page', params.per_page)
    if (params.categories) url.searchParams.append('categories', params.categories)
    if (params.brands) url.searchParams.append('brands', params.brands)
    if (params.search) url.searchParams.append('search', params.search)
    if (params.sort_by) url.searchParams.append('sort_by', params.sort_by)

    return api.get(url.pathname + url.search)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

  
  
}