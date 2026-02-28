// // API/api-cart.js - Updated version with fixed clearCart

// import api from "./axios";

// // Get Cart Items
// export const getCart = async () => {
//   try {
//     const response = await api.get("/cart");
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching cart:', error);
//     throw error;
//   }
// };

// // Add To Cart
// export const addToCart = async (productId, quantity = 1) => {
//   try {
//     const response = await api.post("/cart", {
//       product_id: productId,
//       quantity: quantity,
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     throw error;
//   }
// };

// // Update Cart Quantity
// export const updateCartItem = async (productId, quantity) => {
//   try {
//     const response = await api.put(`/cart/${productId}`, {
//       quantity: quantity
//     });
    
//     console.log('Update cart response:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error updating cart:', error);
//     if (error.response) {
//       console.error('Error response data:', error.response.data);
//       console.error('Error response status:', error.response.status);
//     }
//     throw error;
//   }
// };

// // Remove Item From Cart
// export const removeCartItem = async (productId) => {
//   try {
//     const response = await api.delete(`/cart/${productId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error removing from cart:', error);
//     throw error;
//   }
// };

// // Clear Cart - FIXED VERSION
// export const clearCart = async () => {
//   try {
//     // Use the correct endpoint - /cart/clear instead of /cart
//     const response = await api.delete("/cart/clear");
//     return response.data;
//   } catch (error) {
//     console.error('Error clearing cart:', error);
//     if (error.response) {
//       console.error('Error response data:', error.response.data);
//       console.error('Error response status:', error.response.status);
//     }
//     throw error;
//   }
// };

// // Get Cart Count
// export const getCartCount = async () => {
//   try {
//     const response = await api.get("/cart/count");
//     return response.data;
//   } catch (error) {
//     console.error('Error getting cart count:', error);
//     throw error;
//   }
// };

// API/api-cart.js - Updated version with fixed clearCart and role-based error handling

import api from "./axios";

// Get Cart Items
export const getCart = async () => {
  try {
    const response = await api.get("/cart");
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Check if it's a role-based error (403)
    if (error.response && error.response.status === 403) {
      // Return a specific structure for role-based errors
      return {
        status: false,
        success: false,
        message: error.response.data.message || 'Not authorized to view cart',
        role_error: true
      };
    }
    throw error;
  }
};

// Add To Cart
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post("/cart", {
      product_id: productId,
      quantity: quantity,
    });
    
    // Log the full response for debugging
    console.log('Add to cart raw response:', response);
    console.log('Add to cart response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    // Handle role-based errors (403)
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      if (error.response.status === 403) {
        return {
          status: false,
          success: false,
          message: error.response.data.message || 'Users with role 1 cannot add items to cart',
          role_error: true
        };
      }
      
      // Handle validation errors (422)
      if (error.response.status === 422) {
        return {
          status: false,
          success: false,
          message: 'Validation error',
          errors: error.response.data.errors,
          validation_error: true
        };
      }
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Update Cart Quantity
export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await api.put(`/cart/${productId}`, {
      quantity: quantity
    });
    
    console.log('Update cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Handle role-based errors (403)
      if (error.response.status === 403) {
        return {
          status: false,
          success: false,
          message: error.response.data.message || 'Not authorized to update cart',
          role_error: true
        };
      }
    }
    
    throw error;
  }
};

// Remove Item From Cart
export const removeCartItem = async (productId) => {
  try {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    
    if (error.response) {
      if (error.response.status === 403) {
        return {
          status: false,
          success: false,
          message: error.response.data.message || 'Not authorized to remove items from cart',
          role_error: true
        };
      }
    }
    
    throw error;
  }
};

// Clear Cart - FIXED VERSION
export const clearCart = async () => {
  try {
    // Use the correct endpoint - /cart/clear instead of /cart
    const response = await api.delete("/cart/clear");
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Handle role-based errors (403)
      if (error.response.status === 403) {
        return {
          status: false,
          success: false,
          message: error.response.data.message || 'Not authorized to clear cart',
          role_error: true
        };
      }
    }
    
    throw error;
  }
};

// Get Cart Count
export const getCartCount = async () => {
  try {
    const response = await api.get("/cart/count");
    return response.data;
  } catch (error) {
    console.error('Error getting cart count:', error);
    
    if (error.response) {
      if (error.response.status === 403) {
        return {
          status: false,
          success: false,
          message: error.response.data.message || 'Not authorized to view cart count',
          role_error: true,
          data: { count: 0, total_quantity: 0 } // Return empty data for role 1
        };
      }
    }
    
    throw error;
  }
};