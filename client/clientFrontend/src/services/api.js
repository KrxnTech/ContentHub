import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 600000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const videoAPI = {
  upload: (formData, onUploadProgress) =>
    api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),

  getAll: (page = 1, limit = 10) =>
    api.get(`/videos?page=${page}&limit=${limit}`),

  getById: (id) => api.get(`/videos/${id}`),

  process: (id) => api.post(`/videos/${id}/process`),

  getStatus: (id) => api.get(`/videos/${id}/status`),

  delete: (id) => api.delete(`/videos/${id}`),
};

export const clipAPI = {
  getByVideo: (videoId) => api.get(`/clips/video/${videoId}`),
  getById: (id) => api.get(`/clips/${id}`),
  delete: (id) => api.delete(`/clips/${id}`),
};

export default api;