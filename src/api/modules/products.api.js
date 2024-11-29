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

    // Đảm bảo các trường bắt buộc luôn được gửi đi
    formData.append('name', data.get('name') || '')
    formData.append('description', data.get('description') || '')
    formData.append('price', data.get('price') || 0)
    formData.append('brand_id', data.get('brand_id') || '')
    formData.append('category_id', data.get('category_id') || '')
    formData.append('is_active', data.get('is_active') === '1' ? '1' : '0')

    // Cập nhật variants
    const variantKeys = Array.from(data.keys())
      .filter(key => key.startsWith('variants'))
    
    variantKeys.forEach(key => {
      formData.append(key, data.get(key))
    })

    // Cập nhật hình ảnh
    const imageFiles = data.getAll('images[]')
    if (imageFiles?.length) {
      imageFiles.forEach(file => {
        formData.append('images[]', file)
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
  },
  deleteImage(productId, imageId) {
    return api.delete(`${resource}/${productId}/images/${imageId}`)
  },
  
  // Delete product variant
  deleteVariant(productId, variantId) {
    return api.delete(`${resource}/${productId}/variants/${variantId}`)
  }
}