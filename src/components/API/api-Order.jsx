// api-Order.jsx
import axios from 'axios';

const API_URL = "http://localhost:8000/api";

// Get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==========================
// USER ORDER APIs
// ==========================

// Get user's orders
export const getMyOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: getAuthHeader()
    });
    console.log('getMyOrders raw response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get single order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Place new order
export const placeOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// ==========================
// ADMIN ORDER APIs
// ==========================

// Get all orders (Admin only) - FIXED VERSION
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/orders`, {
      headers: getAuthHeader()
    });
    
    console.log('===== ADMIN ORDERS API DEBUG =====');
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('==================================');
    
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    throw error;
  }
};

// Get single order details (Admin only)
export const getAdminOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/admin/orders/${orderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${API_URL}/admin/orders/${orderId}/status`, 
      { status },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Delete order (Admin only)
export const deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/orders/${orderId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};