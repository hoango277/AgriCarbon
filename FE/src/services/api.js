import axiosInstance from '../config/axios.js';

// API service methods
export const apiService = {
  // GET request
  get: (url, config = {}) => {
    return axiosInstance.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return axiosInstance.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return axiosInstance.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return axiosInstance.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  },
};

// Các API endpoints cụ thể
export const userAPI = {
  // Lấy thông tin user hiện tại
  getProfile: () => apiService.get('/auth/me'),
  
  // Đăng nhập
  login: (formData) => apiService.post('/auth/login', formData),
  
  // Đăng ký với thông tin đã extract
  register: (userData) => apiService.post('/auth/register', userData),
  
  // Trích xuất thông tin CCCD
  extractCCCDInfo: (formData) => apiService.post('/auth/extract-cccd', formData),
  
  // Đổi mật khẩu
  changePassword: (passwordData) => apiService.post('/auth/change-password', passwordData),
};

export default apiService; 