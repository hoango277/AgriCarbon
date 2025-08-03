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
      // Chỉ redirect nếu không phải là trang login hoặc register
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && !currentPath.startsWith('/register')) {
        // Token hết hạn, redirect về login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Phiên đăng nhập đã hết hạn'));
      }
    }
    
    // Trả về lỗi với thông tin dễ đọc từ backend
    let errorMessage = 'Có lỗi xảy ra';
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      errorMessage = 'Tài khoản hoặc mật khẩu không chính xác';
    } else if (error.response?.status === 422) {
      errorMessage = 'Thông tin đăng nhập không hợp lệ';
    } else if (error.response?.status === 500) {
      errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance; 