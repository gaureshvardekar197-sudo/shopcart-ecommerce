import api from "./axios";

export const getUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    // Use the correct admin endpoint
    const response = await api.get("/admin/users");
    
    console.log('Full API Response:', response); // Debug log
    console.log('Response Data:', response.data); // Debug log

    // Check the response structure from your Laravel controller
    if (response.data && response.data.status === true && response.data.users) {
      // Return the users array from the response
      return response.data.users;
    }
    
    // If response.data is directly an array (fallback)
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // If no valid data found, return empty array
    console.warn("Unexpected API response structure:", response.data);
    return [];
    
  } catch (error) {
    console.error("Error fetching users:", error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      if (error.response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      } else if (error.response.status === 403) {
        throw new Error("Forbidden: You don't have permission to view users. Admin access required.");
      } else if (error.response.status === 404) {
        throw new Error("Admin users API endpoint not found");
      } else {
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from server. Please check your connection.");
    }
    
    throw error;
  }
};

// Optional: Get only admins
export const getAdmins = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const response = await api.get("/admin/admins");
    
    console.log('Admins Response:', response.data);

    if (response.data && response.data.status === true && response.data.admins) {
      return response.data.admins;
    }
    
    return [];
    
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};