// src/api/modules/products.api.js

import api from '../axios'

const resource = '/products'

export default {
  // Lấy danh sách có phân trang và lọc
  getAll(params) {
    return api.get(resource, { params })
  },

  // Lấy chi tiết sản phẩm
  getOne(id) {
    return api.get(`${resource}/${id}`)
  },

  // Tạo sản phẩm mới  
  create(data) {
    const formData = new FormData()

    // Thêm thông tin cơ bản
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', data.price)
    formData.append('brand_id', data.brand_id)
    formData.append('category_id', data.category_id) 
    formData.append('is_active', data.is_active ? 1 : 0)

    // Thêm variants
    if (data.variants?.length) {
      data.variants.forEach((variant, index) => {
        formData.append(`variants[${index}][color_id]`, variant.color_id)
        formData.append(`variants[${index}][size_id]`, variant.size_id)  
        formData.append(`variants[${index}][stock_quantity]`, variant.stock_quantity)
      })
    }

    // Thêm hình ảnh
    if (data.images?.length) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    return api.post(resource, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Cập nhật sản phẩm
  update(id, data) {
    const formData = new FormData()
    formData.append('_method', 'PUT')

    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.price) formData.append('price', data.price)
    if (data.brand_id) formData.append('brand_id', data.brand_id)
    if (data.category_id) formData.append('category_id', data.category_id)
    if (typeof data.is_active !== 'undefined') {
      formData.append('is_active', data.is_active ? 1 : 0)
    }

    // Cập nhật variants
    if (data.variants?.length) {
      data.variants.forEach((variant, index) => {
        formData.append(`variants[${index}][color_id]`, variant.color_id)
        formData.append(`variants[${index}][size_id]`, variant.size_id)
        formData.append(`variants[${index}][stock_quantity]`, variant.stock_quantity) 
      })
    }

    // Cập nhật hình ảnh
    if (data.images?.length) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    return api.post(`${resource}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Xóa sản phẩm
  delete(id) {
    return api.delete(`${resource}/${id}`)
  }
}