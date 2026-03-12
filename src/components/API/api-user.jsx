// API/api-user.jsx
import api from "./axios";

// Get current user profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get("/user/profile", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile with PUT
export const updateUserProfile = async (userData) => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.put("/user/profile", userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Alternative: Update user profile with POST + _method PUT
export const updateUserProfileWithMethod = async (userData) => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.post("/user/profile", {
      ...userData,
      _method: 'PUT'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.post("/user/change-password", passwordData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get current user from /user endpoint (alternative)
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get("/user", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};