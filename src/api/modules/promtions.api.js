import api from '../axios'

const resource = '/promotions'

export default {
  // Lấy tất cả khuyến mãi
  getAll() {
    return api.get(resource)
  },

  // Lấy chi tiết khuyến mãi
  getOne(id) {
    return api.get(`${resource}/${id}`)
  },

  // Lấy sản phẩm chưa có khuyến mãi
  getProductsWithoutPromotion() {
    return api.get(`${resource}/no-promotion`)
  },

  // Tạo khuyến mãi mới
  create(data) {
    return api.post(resource, {
      name: data.name,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      start_date: data.start_date,
      end_date: data.end_date,
      product_ids: data.product_ids
    })
  },

  // Cập nhật khuyến mãi
  update(id, data) {
    return api.put(`${resource}/${id}`, {
      name: data.name,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      start_date: data.start_date,
      end_date: data.end_date,
      product_ids: data.product_ids
    })
  },

  // Xóa khuyến mãi
  delete(id) {
    return api.delete(`${resource}/${id}`)
  },

  // Cập nhật trạng thái khuyến mãi
  async updateStatus(id, isActive) {
    try {
      const response = await api.patch(`${resource}/${id}/status`, {
        is_active: isActive
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      console.log('Cập nhật trạng thái thành công:', response.data)
      return response.data
    } catch (error) {
      // Lấy message từ response của API
      const errorMessage = error.response?.data?.message || 'Không thể kích hoạt khuyến mãi đã hết hạn'
      console.error('Lỗi cập nhật trạng thái:', errorMessage)
      throw new Error(errorMessage)
    }
  },

  // Thêm method mới
  removeProduct(promotionId, productId) {
    return api.delete(`${resource}/${promotionId}/products/${productId}`)
      .then(response => {
        if (!response.data.success) {
          throw new Error(response.data.message)
        }
        return response.data
      })
      .catch(error => {
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gỡ sản phẩm'
        throw new Error(errorMessage)
      })
  }
}
