import api from "./axios";

export const getCart = async () => {
  try {
    const response = await api.get("/cart");
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1, size = null, sizeId = null) => {
  try {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    const payload = {
      product_id: productId,
      quantity: quantity,
    };
    
    if (sizeId && !isNaN(parseInt(sizeId))) {
      payload.size_id = parseInt(sizeId);
    }
    
    console.log('Sending payload:', payload);
    
    const response = await api.post("/cart", payload);
    console.log('Raw response:', response);
    
    // Return the data directly
    return response.data;
    
  } catch (error) {
    console.error('Add to cart error:', error);
    
    // If it's an axios error with response
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // Return the error response data if available
      if (error.response.data) {
        return error.response.data;
      }
      
      // Create structured error response
      switch (error.response.status) {
        case 401:
          return {
            status: false,
            message: 'Please login to add items to cart'
          };
        case 403:
          return {
            status: false,
            role_error: true,
            message: 'Cannot add to cart'
          };
        case 409:
          return {
            status: false,
            duplicate_error: true,
            message: 'Item already in cart'
          };
        case 422:
          return {
            status: false,
            validation_error: true,
            message: 'Validation error',
            errors: error.response.data.errors
          };
        default:
          return {
            status: false,
            message: error.response.data?.message || 'Failed to add to cart'
          };
      }
    }
    
    // Network error or other issues
    return {
      status: false,
      message: error.message || 'Network error. Please check your connection.'
    };
  }
};

export const updateCartItem = async (productId, quantity, sizeId = null) => {
  try {
    const payload = { quantity };
    const url = sizeId 
      ? `/cart/${productId}?size_id=${sizeId}` 
      : `/cart/${productId}`;
    
    const response = await api.put(url, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to update cart'
    };
  }
};

export const removeCartItem = async (productId, sizeId = null) => {
  try {
    const url = sizeId 
      ? `/cart/${productId}?size_id=${sizeId}` 
      : `/cart/${productId}`;
    
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to remove item'
    };
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete("/cart/clear");
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to clear cart'
    };
  }
};

export const getCartCount = async () => {
  try {
    const response = await api.get("/cart/count");
    return response.data;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return {
      status: false,
      data: { count: 0, total_quantity: 0 }
    };
  }
};