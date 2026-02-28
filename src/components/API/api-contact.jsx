// src/API/contact.js
import api from "./axios";

/**
 * Submit contact form data to store in database
 * @param {Object} formData - The form data to submit
 * @param {string} formData.name - User's name
 * @param {string} formData.email - User's email
 * @param {string} formData.subject - Message subject
 * @param {string} formData.message - Message content
 * @returns {Promise} - Promise with the response data
 */
export const submitContactForm = async (formData) => {
  try {
    const response = await api.post("/contact", {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    });
    
    console.log('Contact form submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting contact form:', error.response?.data || error.message);
    
    if (error.response) {
      // Handle validation errors (422)
      if (error.response.status === 422) {
        return {
          success: false,
          message: 'Validation failed',
          errors: error.response.data?.errors || {}
        };
      }
      
      // Handle other errors
      return {
        success: false,
        message: error.response.data?.message || 'Failed to send message'
      };
    }
    
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.'
    };
  }
};