import api from '../axios'

const resource = '/discounts'

export default {
  // Lấy danh sách mã giảm giá có phân trang
  getAll(params) {
    return api.get(resource, { params })
  },

  // Lấy chi tiết mã giảm giá
  getOne(id) {
    return api.get(`${resource}/${id}`)
  },

  // Tạo mã giảm giá mới
  create(data) {
    return api.post(resource, data)
  },

  // Cập nhật mã giảm giá
  update(id, data) {
    return api.put(`${resource}/${id}`, data)
  },

  // Xóa mã giảm giá
  delete(id) {
    return api.delete(`${resource}/${id}`)
  },

  // Cập nhật trạng thái
  toggleStatus(id) {
    return api.patch(`${resource}/${id}/toggle-status`)
  },

  checkDiscount(data) {
    return api.post(`${resource}/check`, data)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  },

  applyDiscount(data) {
    return api.post(`${resource}/apply`, data)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error))
  }
}
