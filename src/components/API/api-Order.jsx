// api-Order.jsx
import api from "./axios"; // Import the configured axios instance

// ==========================
// USER ORDER APIs
// ==========================

// Get user's orders
export const getMyOrders = async () => {
  try {
    const response = await api.get('/orders');
    console.log('getMyOrders response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get single order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Place new order
export const placeOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// ==========================
// ADMIN ORDER APIs
// ==========================

// Get all orders (Admin only)
export const getAllOrders = async () => {
  try {
    const response = await api.get('/admin/orders');
    console.log('Admin orders response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Get single order details (Admin only)
export const getAdminOrderById = async (orderId) => {
  try {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Delete order (Admin only)
export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};