import axios from 'axios';

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm authorization token (nếu cần)
axiosInstance.interceptors.request.use(
  (config) => {
    // Có thể thêm token vào header tại đây
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Nếu data là FormData, xóa Content-Type để browser tự động set
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý lỗi chung
    if (error.response?.status === 401) {
      // Token hết hạn, có thể redirect về login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Trả về lỗi với thông tin dễ đọc
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance; 