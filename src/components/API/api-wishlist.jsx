import api from "./axios";

/**
 * Wishlist API Service
 * Handles all wishlist-related API calls with size support
 */

// Get user's wishlist with size details
export const getWishlist = async () => {
  try {
    const response = await api.get("/wishlist");
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    
    // Handle 403 Forbidden (Admin view-only mode)
    if (error.response?.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Not authorized to view wishlist',
        role_error: true,
        is_admin_error: true,
        data: []
      };
    }
    
    // Re-throw other errors to be handled by the caller
    throw error;
  }
};

// Add product to wishlist with optional size
export const addToWishlist = async (productId, size = null, sizeId = null) => {
  try {
    // Build payload with optional size information
    const payload = {
      product_id: productId,
      ...(size && { size }),
      ...(sizeId && { size_id: sizeId })
    };
    
    const response = await api.post("/wishlist", payload);
    console.log('Add to wishlist response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    
    // Handle 403 Forbidden (Admin view-only mode)
    if (error.response?.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Admin cannot add to wishlist',
        role_error: true,
        is_admin_error: true
      };
    }
    
    // Handle 409 Conflict (Duplicate entry)
    if (error.response?.status === 409) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Product already in wishlist',
        duplicate_error: true
      };
    }
    
    // Handle validation errors (422)
    if (error.response?.status === 422) {
      return {
        status: false,
        success: false,
        message: 'Validation error',
        errors: error.response.data.errors
      };
    }
    
    throw error;
  }
};

// Remove product from wishlist (with optional sizeId for size-specific removal)
export const removeFromWishlist = async (productId, sizeId = null) => {
  try {
    // Build URL with optional sizeId query parameter
    const url = sizeId 
      ? `/wishlist/${productId}?size_id=${sizeId}`
      : `/wishlist/${productId}`;
    
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    
    // Handle 403 Forbidden (Admin view-only mode)
    if (error.response?.status === 403) {
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Admin cannot remove items from wishlist',
        role_error: true,
        is_admin_error: true
      };
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      return {
        status: false,
        success: false,
        message: 'Product not found in wishlist'
      };
    }
    
    throw error;
  }
};

// Clear entire wishlist
export const clearWishlist = async () => {
  try {
    const response = await api.delete('/wishlist/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    
    // Handle 403 Forbidden (Admin view-only mode)
    if (error.response?.status === 403) {
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

// Check if product is in wishlist (with optional size check)
export const checkWishlist = async (productId, sizeId = null) => {
  try {
    // Build URL with optional sizeId query parameter
    const url = sizeId 
      ? `/wishlist/check/${productId}?size_id=${sizeId}`
      : `/wishlist/check/${productId}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    
    // Handle 403 Forbidden (Admin view-only mode)
    if (error.response?.status === 403) {
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

// Get wishlist count
export const getWishlistCount = async () => {
  try {
    const response = await api.get('/wishlist/count');
    return response.data;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    
    // Handle 403 Forbidden (Admin view-only mode)
    if (error.response?.status === 403) {
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

// Get wishlist items count (simplified version)
export const getWishlistItemCount = async () => {
  try {
    const response = await getWishlistCount();
    return response.data?.count || 0;
  } catch (error) {
    console.error('Error getting wishlist item count:', error);
    return 0;
  }
};

// Check if a specific product with size is in wishlist (returns boolean)
export const isInWishlist = async (productId, sizeId = null) => {
  try {
    const response = await checkWishlist(productId, sizeId);
    return response.data?.in_wishlist || false;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
};