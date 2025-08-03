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

// Crop Management APIs
export const cropAPI = {
  // Tạo khai báo mới
  createDeclaration: (declarationData) => apiService.post('/crop/declarations', declarationData),
  
  // Lấy danh sách khai báo của nông dân
  getDeclarations: () => apiService.get('/crop/declarations'),
  
  // Lấy chi tiết một khai báo
  getDeclaration: (id) => apiService.get(`/crop/declarations/${id}`),
  
  // Cập nhật khai báo
  updateDeclaration: (id, data) => apiService.put(`/crop/declarations/${id}`, data),
  
  // Upload ảnh minh chứng
  uploadEvidence: (id, formData) => apiService.post(`/crop/declarations/${id}/upload-evidence`, formData),
  
  // Tạo cam kết
  createCommitment: (id, commitmentData) => apiService.post(`/crop/declarations/${id}/commitment`, commitmentData),
  
  // Nộp khai báo
  submitDeclaration: (id) => apiService.post(`/crop/declarations/${id}/submit`),
  
  // Admin APIs
  getAllDeclarations: (status = null) => {
    const params = status ? { status } : {};
    return apiService.get('/crop/admin/declarations', { params });
  },
  
  // Admin phê duyệt khai báo
  approveDeclaration: (id, approvalData) => apiService.post(`/crop/admin/declarations/${id}/approve`, approvalData),
  
  // Xóa khai báo
  deleteDeclaration: (id) => apiService.delete(`/crop/declarations/${id}`),
};

// Carbon Tracking API
export const carbonAPI = {
  // Lấy danh sách vùng đất đã được duyệt của farmer
  getFarmerAreas: () => apiService.get('/carbon/areas'),
  
  // Lấy dữ liệu carbon summary của một vùng đất
  getAreaCarbonSummary: (areaId) => apiService.get(`/carbon/areas/${areaId}/summary`),
  
  // Tạo dữ liệu carbon tracking mới
  createCarbonTracking: (data) => apiService.post('/carbon/tracking', data),
  
  // Cập nhật dữ liệu carbon tracking
  updateCarbonTracking: (id, data) => apiService.put(`/carbon/tracking/${id}`, data),
  
  // Xóa dữ liệu carbon tracking
  deleteCarbonTracking: (id) => apiService.delete(`/carbon/tracking/${id}`),
  
  // Lấy tất cả dữ liệu carbon (admin only)
  getAllCarbonTracking: () => apiService.get('/carbon/tracking'),
  
  // Admin APIs
  // Lấy danh sách tất cả nông dân (admin only)
  getAllFarmers: () => apiService.get('/carbon/admin/farmers'),
  
  // Lấy danh sách vùng đất của một farmer cụ thể (admin only)
  getAdminFarmerAreas: (farmerId) => apiService.get(`/carbon/admin/farmers/${farmerId}/areas`),
};

export default apiService; 