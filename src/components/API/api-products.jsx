import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Get all products
export const getProducts = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Get single product by ID
export const getProduct = async (token, id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Create new product (with image upload)
export const createProduct = async (token, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/products`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Update product (with image upload) - Using POST with _method=PUT for FormData
export const updateProduct = async (token, id, data) => {
  try {
    // Using POST with _method=PUT approach for better FormData compatibility
    const response = await axios.post(
      `${API_URL}/products/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
          // Don't set Content-Type - let browser set it with boundary
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Alternative: If you prefer using PUT method
// export const updateProduct = async (token, id, data) => {
//   try {
//     const response = await axios({
//       method: 'PUT',
//       url: `${API_URL}/products/${id}`,
//       data: data,
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// Delete product
export const deleteProduct = async (token, id) => {
  try {
    const response = await axios.delete(`${API_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Get products by category ID
export const getProductsByCategory = async (token, categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/products/category/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};