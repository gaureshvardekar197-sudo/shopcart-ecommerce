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

import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const getCategories = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// ADD THIS FUNCTION - Get single category by ID
export const getCategory = async (token, id) => {
  try {
    const response = await axios.get(`${API_URL}/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const createCategory = async (token, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/categories`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
          // DO NOT ADD Content-Type - browser will set it automatically with boundary
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateCategory = async (token, id, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/categories/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteCategory = async (token, id) => {
  try {
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};