import api from "./axios";

// Get Wishlist
export const getWishlist = async () => {
  try {
    const response = await api.get("/wishlist");
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    
    if (error.response && error.response.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Not authorized to view wishlist',
        role_error: true,
        is_admin_error: true,
        data: []
      };
    }
    
    throw error;
  }
};

// Add To Wishlist
export const addToWishlist = async (productId) => {
  try {
    const response = await api.post("/wishlist", {
      product_id: productId,
    });
    
    console.log('Add to wishlist response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    
    // Handle admin role error (403)
    if (error.response && error.response.status === 403) {
      console.log('Admin error caught:', error.response.data);
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Admin cannot add to wishlist - You are checking the website, not making a purchase',
        role_error: true,
        is_admin_error: true
      };
    }
    
    // Handle duplicate entry (409)
    if (error.response && error.response.status === 409) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Product already in wishlist',
        duplicate_error: true
      };
    }
    
    throw error;
  }
};

// Remove From Wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    
    if (error.response && error.response.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Admin cannot remove items from wishlist',
        role_error: true,
        is_admin_error: true
      };
    }
    
    throw error;
  }
};

// Clear Wishlist
export const clearWishlist = async () => {
  try {
    const response = await api.delete('/wishlist/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    
    if (error.response && error.response.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Admin cannot clear wishlist',
        role_error: true,
        is_admin_error: true
      };
    }
    
    throw error;
  }
};

// Check if product is in wishlist
export const checkWishlist = async (productId) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    
    if (error.response && error.response.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Not authorized',
        role_error: true,
        data: { in_wishlist: false }
      };
    }
    
    throw error;
  }
};

// Get Wishlist Count
export const getWishlistCount = async () => {
  try {
    const response = await api.get('/wishlist/count');
    return response.data;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    
    if (error.response && error.response.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Not authorized',
        role_error: true,
        data: { count: 0 }
      };
    }
    
    throw error;
  }
};