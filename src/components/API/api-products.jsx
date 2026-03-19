// API/api-products.jsx
import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000 // Increased timeout to 30 seconds
});

// Helper function to extract numeric ID
const extractNumericId = (id) => {
  if (!id) return null;
  
  const strId = String(id);
  
  // If it's already a number, return it
  if (typeof id === 'number') return id;
  
  // Check if it contains URL-encoded pipe (%7C)
  if (strId.includes('%7C')) {
    const parts = strId.split('%7C');
    const possibleId = parts[0];
    if (/^\d+$/.test(possibleId)) {
      return parseInt(possibleId, 10);
    }
  }
  
  // Check if it contains a regular pipe
  if (strId.includes('|')) {
    const parts = strId.split('|');
    const possibleId = parts[0];
    if (/^\d+$/.test(possibleId)) {
      return parseInt(possibleId, 10);
    }
  }
  
  // Try to extract numbers from the beginning
  const match = strId.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // If it's a pure number string
  if (/^\d+$/.test(strId)) {
    return parseInt(strId, 10);
  }
  
  return null;
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server is not responding');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * PUBLIC PRODUCT ENDPOINTS (No Auth Required for GET)
 */

// Get all products with search and pagination - FIXED with null check
export const getProducts = async (params = {}) => {
  try {
    // Ensure params is an object, even if null or undefined is passed
    const safeParams = params || {};
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add search parameter if provided
    if (safeParams.search) {
      queryParams.append('search', safeParams.search);
    }
    
    // Add pagination
    if (safeParams.limit) {
      queryParams.append('limit', safeParams.limit);
    }
    
    if (safeParams.page) {
      queryParams.append('page', safeParams.page);
    }
    
    // Add sorting
    if (safeParams.sort) {
      queryParams.append('sort', safeParams.sort);
    }
    
    // Add category filter
    if (safeParams.category) {
      queryParams.append('category', safeParams.category);
    }
    
    // Add price range
    if (safeParams.min_price) {
      queryParams.append('min_price', safeParams.min_price);
    }
    
    if (safeParams.max_price) {
      queryParams.append('max_price', safeParams.max_price);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    console.log('Fetching products from:', url);
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error in getProducts:', error.message);
    
    // Return a fallback empty response to prevent UI crashes
    if (error.code === 'ECONNABORTED') {
      return { data: [], message: 'Request timeout - please try again' };
    }
    
    throw error;
  }
};

export const getProduct = async (id, token = null) => {
  try {
    // Clean the ID first
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid product ID format');
    }
    
    console.log('Fetching product with ID:', cleanId);
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get(`/products/${cleanId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('API Error in getProduct:', error.message);
    
    // Handle 404 specifically
    if (error.response?.status === 404) {
      // Return a structured error response instead of throwing
      return { 
        status: false, 
        message: 'Product not found',
        data: null 
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return { 
        status: false, 
        message: 'Request timeout - please try again',
        data: null 
      };
    }
    
    throw error;
  }
};

// Get products by category ID
export const getProductsByCategory = async (categoryId, params = {}) => {
  try {
    const cleanId = extractNumericId(categoryId) || categoryId;
    const safeParams = params || {};
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (safeParams.search) {
      queryParams.append('search', safeParams.search);
    }
    
    if (safeParams.limit) {
      queryParams.append('limit', safeParams.limit);
    }
    
    if (safeParams.page) {
      queryParams.append('page', safeParams.page);
    }
    
    if (safeParams.sort) {
      queryParams.append('sort', safeParams.sort);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products/category/${cleanId}?${queryString}` : `/products/category/${cleanId}`;
    
    console.log('Fetching products by category from:', url);
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error in getProductsByCategory:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return { data: [], message: 'Request timeout - please try again' };
    }
    
    throw error;
  }
};

/**
 * ADMIN PRODUCT ENDPOINTS (Auth Required)
 */

// Create new product (Admin only)
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
    console.error('API Error in createProduct:', error.response?.data || error.message);
    throw error;
  }
};

// Update product (Admin only)
export const updateProduct = async (token, id, data) => {
  try {
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid product ID format');
    }
    
    const response = await api.post(`/admin/products/${cleanId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error in updateProduct:', error.response?.data || error.message);
    throw error;
  }
};

// Delete product (Admin only)
export const deleteProduct = async (token, id) => {
  try {
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid product ID format');
    }
    
    const response = await api.delete(`/admin/products/${cleanId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Handle different response structures
    return response.data;
  } catch (error) {
    console.error('API Error in deleteProduct:', error.response?.data || error.message);
    
    // If the error has a response, return it to be handled by the caller
    if (error.response) {
      return error.response.data;
    }
    
    throw error;
  }
};

/**
 * SIZE ENDPOINTS
 */

// Get all size options and categories
export const getSizeOptions = async () => {
  try {
    const response = await api.get('/sizes/options');
    return response.data;
  } catch (error) {
    console.error('API Error in getSizeOptions:', error.message);
    throw error;
  }
};

// Get sizes by category
export const getSizesByCategory = async (category) => {
  try {
    const response = await api.get(`/sizes/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('API Error in getSizesByCategory:', error.message);
    throw error;
  }
};

// Get price range for product sizes
export const getPriceRange = async (productId) => {
  try {
    const cleanId = extractNumericId(productId) || productId;
    const response = await api.get(`/sizes/price-range/${cleanId}`);
    return response.data;
  } catch (error) {
    console.error('API Error in getPriceRange:', error.message);
    throw error;
  }
};

// Get all sizes for a specific product
export const getProductSizes = async (productId) => {
  try {
    const cleanId = extractNumericId(productId) || productId;
    const response = await api.get(`/products/${cleanId}/sizes`);
    return response.data;
  } catch (error) {
    console.error('API Error in getProductSizes:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return { data: { sizes: [] } };
    }
    
    throw error;
  }
};

// Check size availability
export const checkSizeAvailability = async (productId, sizeData) => {
  try {
    const cleanId = extractNumericId(productId) || productId;
    const response = await api.post(`/products/${cleanId}/sizes/check-availability`, sizeData);
    return response.data;
  } catch (error) {
    console.error('API Error in checkSizeAvailability:', error.message);
    throw error;
  }
};

// Get single size details
export const getSizeDetails = async (sizeId) => {
  try {
    const cleanId = extractNumericId(sizeId) || sizeId;
    const response = await api.get(`/sizes/${cleanId}`);
    return response.data;
  } catch (error) {
    console.error('API Error in getSizeDetails:', error.message);
    throw error;
  }
};

// Admin size management
export const addProductSizes = async (token, productId, sizeData) => {
  try {
    const cleanId = extractNumericId(productId) || productId;
    const response = await api.post(`/admin/products/${cleanId}/sizes`, sizeData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('API Error in addProductSizes:', error.response?.data || error.message);
    throw error;
  }
};

export const updateBulkSizes = async (token, productId, sizesData) => {
  try {
    const cleanId = extractNumericId(productId) || productId;
    const response = await api.put(`/admin/products/${cleanId}/sizes/bulk`, sizesData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('API Error in updateBulkSizes:', error.response?.data || error.message);
    throw error;
  }
};

export const updateSize = async (token, sizeId, sizeData) => {
  try {
    const cleanId = extractNumericId(sizeId) || sizeId;
    const response = await api.put(`/admin/sizes/${cleanId}`, sizeData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('API Error in updateSize:', error.response?.data || error.message);
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
    console.error('API Error in deleteSize:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to parse product response with all details
export const parseProductResponse = (product) => {
  if (!product) return product;

  // Add image URLs
  product.image_url = product.image ? `${API_URL.replace('/api', '')}/storage/products/${product.image}` : null;
  
  // Parse additional images
  if (product.product_images) {
    const images = Array.isArray(product.product_images) 
      ? product.product_images 
      : JSON.parse(product.product_images || '[]');
    
    product.product_images_urls = images.map(img => 
      `${API_URL.replace('/api', '')}/storage/products/additional/${img}`
    );
  } else {
    product.product_images_urls = [];
  }

  // Parse sizes
  if (product.sizes && product.sizes.length > 0) {
    product.sizes = product.sizes.map(size => ({
      ...size,
      in_stock: size.stock > 0,
      display_price: size.effective_price || size.selling_price || product.selling_price
    }));
    
    // Add size info
    product.has_sizes = true;
    product.has_variable_pricing = new Set(product.sizes.map(s => s.display_price)).size > 1;
    
    if (product.has_variable_pricing) {
      const prices = product.sizes.map(s => s.display_price);
      product.price_range = {
        min: Math.min(...prices),
        max: Math.max(...prices),
        text: `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`
      };
    }
  } else {
    product.has_sizes = false;
    product.sizes = [];
  }

  return product;
};

// Search products helper
export const searchProducts = async (searchTerm, limit = 10) => {
  try {
    const response = await getProducts({ search: searchTerm, limit });
    return response;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Export all functions as default object
export default {
  getProducts,
  getProduct,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getSizeOptions,
  getSizesByCategory,
  getPriceRange,
  getProductSizes,
  checkSizeAvailability,
  getSizeDetails,
  addProductSizes,
  updateBulkSizes,
  updateSize,
  deleteSize,
  parseProductResponse,
  searchProducts
};