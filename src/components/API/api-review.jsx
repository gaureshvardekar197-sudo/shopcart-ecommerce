// src/API/api-review.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - Token expired or invalid');
      // Optionally redirect to login
      // window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Forbidden - Insufficient permissions');
      if (error.config.url.includes('/admin/')) {
        console.error('Admin access denied');
      }
    }
    return Promise.reject(error);
  }
);

const reviewApi = {
  // ============ PUBLIC METHODS ============
  
  getReviews: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('API Error (getReviews):', error.response?.data || error.message);
      throw error;
    }
  },

  createReview: async (data) => {
    try {
      const response = await api.post('/reviews', data);
      return response.data;
    } catch (error) {
      console.error('API Error (createReview):', error.response?.data || error.message);
      throw error;
    }
  },

  canReview: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/can-review`);
      return response.data;
    } catch (error) {
      console.error('API Error (canReview):', error.response?.data || error.message);
      return {
        success: false,
        data: {
          can_review: false,
          has_purchased: false,
          order_id: null
        }
      };
    }
  },

  updateReview: async (id, data) => {
    try {
      const response = await api.put(`/reviews/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error (updateReview):', error.response?.data || error.message);
      throw error;
    }
  },

  deleteReview: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error (deleteReview):', error.response?.data || error.message);
      throw error;
    }
  },

  // ============ ADMIN METHODS ============

  // Get review statistics
  getReviewStats: async () => {
    try {
      const response = await api.get('/admin/reviews/stats');
      return response.data;
    } catch (error) {
      console.error('API Error (getReviewStats):', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all reviews with filters
  getAllReviews: async ({ 
    page = 1, 
    per_page = 10, 
    status = 'all', 
    rating = '', 
    product_id = '', 
    search = '', 
    sort = 'latest' 
  } = {}) => {
    try {
      const params = new URLSearchParams();
      
      params.append('page', page);
      params.append('per_page', per_page);
      
      if (status && status !== 'all') params.append('status', status);
      if (rating) params.append('rating', rating);
      if (product_id) params.append('product_id', product_id);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      
      const response = await api.get(`/admin/reviews?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error (getAllReviews):', error.response?.data || error.message);
      throw error;
    }
  },

  // Get reviews by user ID
  getReviewsByUser: async (userId, { page = 1, per_page = 10 } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', per_page);
      
      const response = await api.get(`/admin/reviews/user/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error (getReviewsByUser):', error.response?.data || error.message);
      throw error;
    }
  },

  // Get reviews by product ID
  getReviewsByProduct: async (productId, { page = 1, per_page = 10 } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', per_page);
      
      const response = await api.get(`/admin/reviews/product/${productId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('API Error (getReviewsByProduct):', error.response?.data || error.message);
      throw error;
    }
  },

  // Get single review by ID
  getReviewById: async (id) => {
    try {
      const response = await api.get(`/admin/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error (getReviewById):', error.response?.data || error.message);
      throw error;
    }
  },

  // Update review status
  updateReviewStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/reviews/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('API Error (updateReviewStatus):', error.response?.data || error.message);
      throw error;
    }
  },

  // Admin delete review
  adminDeleteReview: async (id) => {
    try {
      const response = await api.delete(`/admin/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error (adminDeleteReview):', error.response?.data || error.message);
      throw error;
    }
  },

  // Bulk delete reviews
  bulkDeleteReviews: async (reviewIds) => {
    try {
      const response = await api.post('/admin/reviews/bulk-delete', { review_ids: reviewIds });
      return response.data;
    } catch (error) {
      console.error('API Error (bulkDeleteReviews):', error.response?.data || error.message);
      throw error;
    }
  },

  // Bulk update review status
  bulkUpdateStatus: async (reviewIds, status) => {
    try {
      const response = await api.post('/admin/reviews/bulk-status', { 
        review_ids: reviewIds, 
        status 
      });
      return response.data;
    } catch (error) {
      console.error('API Error (bulkUpdateStatus):', error.response?.data || error.message);
      throw error;
    }
  }
};

export default reviewApi;