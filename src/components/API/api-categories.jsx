// import axios from "axios";

// const API_URL = "http://localhost:8000/api";

// export const getCategories = async (token) => {
//   const response = await axios.get(`${API_URL}/categories`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return response.data;
// };

// export const createCategory = async (token, data) => {
//   const response = await axios.post(
//     `${API_URL}/categories`,
//     data,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`
//         // DO NOT ADD Content-Type
//       }
//     }
//   );
//   return response.data;
// };

// export const updateCategory = async (token, id, data) => {
//   const response = await axios.post(
//     `${API_URL}/categories/${id}`,
//     data,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }
//   );
//   return response.data;
// };

// export const deleteCategory = async (token, id) => {
//   const response = await axios.delete(`${API_URL}/categories/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return response.data;
// };

// import axios from "axios";

// const API_URL = "http://localhost:8000/api";

// export const getCategories = async (token) => {
//   try {
//     const response = await axios.get(`${API_URL}/categories`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // ADD THIS FUNCTION - Get single category by ID
// export const getCategory = async (token, id) => {
//   try {
//     const response = await axios.get(`${API_URL}/categories/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// export const createCategory = async (token, data) => {
//   try {
//     const response = await axios.post(
//       `${API_URL}/categories`,
//       data,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//           // DO NOT ADD Content-Type - browser will set it automatically with boundary
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// export const updateCategory = async (token, id, data) => {
//   try {
//     const response = await axios.post(
//       `${API_URL}/categories/${id}`,
//       data,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// export const deleteCategory = async (token, id) => {
//   try {
//     const response = await axios.delete(`${API_URL}/categories/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };


// API/api-categories.jsx
import api from "./axios";

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

// Get all categories with optional search and pagination
export const getCategories = async (params = {}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add search parameter if provided
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    // Add pagination
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }
    
    if (params.page) {
      queryParams.append('page', params.page);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/categories?${queryString}` : '/categories';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Get single category by ID - FIXED to handle encoded IDs
export const getCategory = async (id) => {
  try {
    // Extract numeric ID first
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid category ID format');
    }
    
    console.log('Original ID:', id, 'Cleaned ID:', cleanId); // Debug log
    
    const response = await api.get(`/categories/${cleanId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Create new category (Admin only)
export const createCategory = async (data) => {
  try {
    const response = await api.post('/admin/categories', data, {
      headers: {
        // Don't set Content-Type - browser will set it with boundary for FormData
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Update category (Admin only) - FIXED to handle encoded IDs
export const updateCategory = async (id, data) => {
  try {
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid category ID format');
    }
    
    const response = await api.post(`/admin/categories/${cleanId}`, {
      ...data,
      _method: 'PUT'
    }, {
      headers: {
        // Don't set Content-Type for FormData
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Alternative update method with PUT - FIXED to handle encoded IDs
export const updateCategoryPut = async (id, data) => {
  try {
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid category ID format');
    }
    
    const response = await api.put(`/admin/categories/${cleanId}`, data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Delete category (Admin only) - FIXED to handle encoded IDs
export const deleteCategory = async (id) => {
  try {
    const cleanId = extractNumericId(id);
    
    if (!cleanId) {
      throw new Error('Invalid category ID format');
    }
    
    const response = await api.delete(`/admin/categories/${cleanId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Search categories (public)
export const searchCategories = async (searchTerm, limit = 10) => {
  try {
    const response = await api.get(`/categories?search=${encodeURIComponent(searchTerm)}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};