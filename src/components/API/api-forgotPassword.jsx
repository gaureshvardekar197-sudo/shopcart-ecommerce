// src/API/forgotPassword.js
import api from "./axios";

// Step 1: Send OTP to email
export const sendOtp = async (email) => {
  try {
    const response = await api.post("/forgot-password/send-otp", { email });
    console.log('Send OTP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to send OTP'
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
};

// Step 2: Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post("/forgot-password/verify-otp", { 
      email, 
      otp 
    });
    console.log('Verify OTP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Invalid OTP'
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
};

// Step 3: Resend OTP
export const resendOtp = async (email) => {
  try {
    const response = await api.post("/forgot-password/resend-otp", { email });
    console.log('Resend OTP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error resending OTP:', error.response?.data || error.message);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to resend OTP'
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
};

// Step 4: Reset Password
export const resetPassword = async (email, password) => {
  try {
    const response = await api.post("/forgot-password/reset", { 
      email, 
      password 
    });
    console.log('Reset password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error.response?.data || error.message);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to reset password'
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
};