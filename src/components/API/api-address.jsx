import api from "./axios";

// Get all user addresses
export const getAddresses = async () => {
  try {
    const response = await api.get("/addresses");
    return response.data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
};

// Get single address by ID
export const getAddressById = async (addressId) => {
  try {
    const response = await api.get(`/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
};

// Add new address
export const addAddress = async (addressData) => {
  try {
    const response = await api.post("/addresses", addressData);
    return response.data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.post(`/addresses/${addressId}`, {
      ...addressData,
      _method: 'PUT'
    });
    return response.data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Delete address
export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Set default address
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.post(`/addresses/${addressId}/default`, {
      _method: 'PATCH'
    });
    return response.data;
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};