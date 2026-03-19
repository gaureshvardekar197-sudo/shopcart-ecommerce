// api-products.jsx - Complete clean version
import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Helper function to extract numeric ID
const extractNumericId = (id) => {
  if (!id) return null;
  
  // If it's already a number, return it
  if (typeof id === 'number') return id;
  
  const strId = String(id).trim();
  
  // Check for URL-encoded pipe (%7C)
  if (strId.includes('%7C')) {
    const parts = strId.split('%7C');
    const possibleId = parts[0];
    if (/^\d+$/.test(possibleId)) {
      return parseInt(possibleId, 10);
    }
  }
  
  // Check for regular pipe
  if (strId.includes('|')) {
    const parts = strId.split('|');
    const possibleId = parts[0];
    if (/^\d+$/.test(possibleId)) {
      return parseInt(possibleId, 10);
    }
  }
  
  // Extract numbers from beginning
  const match = strId.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // Pure number string
  if (/^\d+$/.test(strId)) {
    return parseInt(strId, 10);
  }
  
  return null;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * PUBLIC PRODUCT ENDPOINTS
 */

// Get all products
export const getProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.category) queryParams.append('category', params.category);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Get single product - FIXED: Now accepts (id, token) for better compatibility
export const getProduct = async (id, token = null) => {
  try {
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid product ID format');
    }
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get(`/products/${cleanId}`, { headers });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId, params = {}) => {
  try {
    const cleanId = extractNumericId(categoryId) || categoryId;
    
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    if (params.sort) queryParams.append('sort', params.sort);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products/category/${cleanId}?${queryString}` : `/products/category/${cleanId}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * ADMIN PRODUCT ENDPOINTS
 */
export const createProduct = async (token, data) => {
  try {
    const response = await api.post('/admin/products', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProduct = async (token, id, data) => {
  try {
    const cleanId = extractNumericId(id);
    if (!cleanId) throw new Error('Invalid product ID format');
    
    const response = await api.post(`/admin/products/${cleanId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteProduct = async (token, id) => {
  try {
    const cleanId = extractNumericId(id);
    if (!cleanId) throw new Error('Invalid product ID format');
    
    const response = await api.delete(`/admin/products/${cleanId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * SIZE ENDPOINTS
 */
export const getProductSizes = async (productId) => {
  try {
    const cleanId = extractNumericId(productId) || productId;
    const response = await api.get(`/products/${cleanId}/sizes`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteSize = async (token, sizeId) => {
  try {
    const cleanId = extractNumericId(sizeId) || sizeId;
    const response = await api.delete(`/admin/sizes/${cleanId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Export all functions
export default {
  getProducts,
  getProduct,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductSizes,
  deleteSize
};