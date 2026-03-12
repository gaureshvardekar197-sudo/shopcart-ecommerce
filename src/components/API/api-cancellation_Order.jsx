import api from "./axios";

// ============================================
// USER API FUNCTIONS
// ============================================

/**
 * Check if an order is eligible for cancellation
 * @param {number} orderId - The order ID to check
 * @returns {Promise} - Response with eligibility status
 */
export const checkCancellationEligibility = async (orderId) => {
  try {
    console.log('Checking cancellation eligibility for order:', orderId);
    const response = await api.get(`/cancellation/check/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking cancellation eligibility:', error);
    
    if (error.response) {
      return {
        status: false,
        message: error.response.data?.message || 'Failed to check eligibility',
        data: error.response.data
      };
    }
    
    return {
      status: false,
      message: error.message || 'Network error. Please check your connection.'
    };
  }
};

/**
 * Get all cancellation requests for the authenticated user
 * @param {Object} params - Query parameters
 * @returns {Promise} - Response with list of cancellations
 */
export const getMyCancellations = async (params = {}) => {
  try {
    const response = await api.get('/cancellations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cancellations:', error);
    
    if (error.response) {
      return {
        status: false,
        message: error.response.data?.message || 'Failed to fetch cancellations',
        data: error.response.data
      };
    }
    
    return {
      status: false,
      message: error.message || 'Network error. Please check your connection.'
    };
  }
};

/**
 * Get a specific cancellation request by ID
 * @param {number} id - Cancellation request ID
 * @returns {Promise} - Response with cancellation details
 */
export const getCancellationById = async (id) => {
  try {
    const response = await api.get(`/cancellations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cancellation:', error);
    
    if (error.response) {
      return {
        status: false,
        message: error.response.data?.message || 'Failed to fetch cancellation',
        data: error.response.data
      };
    }
    
    return {
      status: false,
      message: error.message || 'Network error. Please check your connection.'
    };
  }
};

/**
 * Submit a new cancellation request
 * @param {Object} data - Cancellation request data
 * @returns {Promise} - Response with created cancellation
 */
export const submitCancellationRequest = async (data) => {
  try {
    // Validate required fields
    if (!data.order_id) {
      throw new Error('Order ID is required');
    }
    
    if (!data.reason) {
      throw new Error('Cancellation reason is required');
    }
    
    // Ensure order_id is a number
    const payload = {
      order_id: Number(data.order_id),
      reason: data.reason,
      reason_note: data.reason_note || ''
    };
    
    console.log('Submitting cancellation request:', payload);
    
    const response = await api.post('/cancellations', payload);
    console.log('Cancellation response:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error('Error submitting cancellation request:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      switch (error.response.status) {
        case 422:
          return {
            status: false,
            validation_error: true,
            message: 'Validation error',
            errors: error.response.data.errors
          };
          
        case 400:
          return {
            status: false,
            business_error: true,
            message: error.response.data?.message || 'Cannot cancel this order',
            reason: error.response.data?.reason
          };
          
        case 409:
          return {
            status: false,
            duplicate_error: true,
            message: error.response.data?.message || 'A pending request already exists'
          };
          
        case 401:
          return {
            status: false,
            auth_error: true,
            message: 'Please login to submit a cancellation request'
          };
          
        case 404:
          return {
            status: false,
            message: error.response.data?.message || 'Order not found'
          };
          
        case 500:
          // Show user-friendly message but log the detailed error
          const serverMessage = error.response.data?.message || 
                               'Server error occurred. Please try again later.';
          
          // Log the detailed error for debugging
          if (error.response.data?.error_detail) {
            console.error('Server error details:', error.response.data.error_detail);
          }
          
          return {
            status: false,
            server_error: true,
            message: serverMessage
          };
          
        default:
          return {
            status: false,
            message: error.response.data?.message || 'Failed to submit cancellation request'
          };
      }
    }
    
    return {
      status: false,
      message: error.message || 'Network error. Please check your connection.'
    };
  }
};

/**
 * Cancel a pending cancellation request
 * @param {number} id - Cancellation request ID to cancel
 * @returns {Promise} - Response with success message
 */
export const cancelCancellationRequest = async (id) => {
  try {
    const response = await api.delete(`/cancellations/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling request:', error);
    
    if (error.response) {
      if (error.response.status === 400) {
        return {
          status: false,
          business_error: true,
          message: error.response.data?.message || 'Only pending requests can be cancelled'
        };
      }
      
      if (error.response.status === 404) {
        return {
          status: false,
          message: 'Cancellation request not found'
        };
      }
      
      return {
        status: false,
        message: error.response.data?.message || 'Failed to cancel request',
        data: error.response.data
      };
    }
    
    return {
      status: false,
      message: error.message || 'Network error. Please check your connection.'
    };
  }
};

// ============================================
// ADMIN API FUNCTIONS
// ============================================

/**
 * Get all cancellation requests with filters (Admin only)
 */
export const getAllCancellations = async (params = {}) => {
  try {
    const response = await api.get('/admin/cancellations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cancellations:', error);
    
    if (error.response?.status === 403) {
      return {
        status: false,
        role_error: true,
        message: 'Admin access required'
      };
    }
    
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to fetch cancellations'
    };
  }
};

/**
 * Get all pending cancellation requests (Admin only)
 */
export const getPendingCancellations = async (params = {}) => {
  try {
    const response = await api.get('/admin/cancellations/pending', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending cancellations:', error);
    
    if (error.response?.status === 403) {
      return {
        status: false,
        role_error: true,
        message: 'Admin access required'
      };
    }
    
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to fetch pending cancellations'
    };
  }
};

/**
 * Get a specific cancellation request by ID (Admin only)
 */
export const getAdminCancellationById = async (id) => {
  try {
    const response = await api.get(`/admin/cancellations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cancellation:', error);
    
    if (error.response?.status === 403) {
      return {
        status: false,
        role_error: true,
        message: 'Admin access required'
      };
    }
    
    if (error.response?.status === 404) {
      return {
        status: false,
        message: 'Cancellation request not found'
      };
    }
    
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to fetch cancellation'
    };
  }
};

/**
 * Approve a cancellation request (Admin only)
 */
export const approveCancellationRequest = async (id, data = {}) => {
  try {
    const payload = {
      refund_amount: data.refund_amount,
      admin_response: data.admin_response || ''
    };
    
    const response = await api.post(`/admin/cancellations/${id}/approve`, payload);
    return response.data;
  } catch (error) {
    console.error('Error approving cancellation:', error);
    
    if (error.response?.status === 403) {
      return {
        status: false,
        role_error: true,
        message: 'Admin access required'
      };
    }
    
    if (error.response?.status === 422) {
      return {
        status: false,
        validation_error: true,
        message: 'Validation error',
        errors: error.response.data.errors
      };
    }
    
    if (error.response?.status === 404) {
      return {
        status: false,
        message: 'Cancellation request not found'
      };
    }
    
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to approve cancellation'
    };
  }
};

/**
 * Reject a cancellation request (Admin only)
 */
export const rejectCancellationRequest = async (id, data = {}) => {
  try {
    const payload = {
      admin_response: data.admin_response || ''
    };
    
    const response = await api.post(`/admin/cancellations/${id}/reject`, payload);
    return response.data;
  } catch (error) {
    console.error('Error rejecting cancellation:', error);
    
    if (error.response?.status === 403) {
      return {
        status: false,
        role_error: true,
        message: 'Admin access required'
      };
    }
    
    if (error.response?.status === 422) {
      return {
        status: false,
        validation_error: true,
        message: 'Validation error',
        errors: error.response.data.errors
      };
    }
    
    if (error.response?.status === 404) {
      return {
        status: false,
        message: 'Cancellation request not found'
      };
    }
    
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to reject cancellation'
    };
  }
};

/**
 * Process refund for an approved cancellation (Admin only)
 */
export const processRefund = async (id, data = {}) => {
  try {
    const payload = {
      transaction_id: data.transaction_id,
      notes: data.notes || ''
    };
    
    const response = await api.post(`/admin/cancellations/${id}/refund`, payload);
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    
    if (error.response?.status === 403) {
      return {
        status: false,
        role_error: true,
        message: 'Admin access required'
      };
    }
    
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to process refund'
    };
  }
};

/**
 * Get cancellation statistics (Admin only)
 */
export const getCancellationStats = async () => {
  try {
    const response = await api.get('/admin/cancellations/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching cancellation stats:', error);
    
    if (error.response?.status === 403) {
      return {
        status: false,
        role_error: true,
        message: 'Admin access required'
      };
    }
    
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to fetch statistics'
    };
  }
};

// ============================================
// CONSTANTS for cancellation reasons and statuses
// ============================================

export const CANCELLATION_REASONS = [
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'wrong_item', label: 'Wrong Item Ordered' },
  { value: 'shipping_delay', label: 'Shipping Delay' },
  { value: 'better_price', label: 'Found Better Price' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'duplicate_order', label: 'Duplicate Order' },
  { value: 'other', label: 'Other' }
];

export const CANCELLATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const REFUND_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const CANCELLATION_REASON_LABELS = {
  changed_mind: 'Changed Mind',
  wrong_item: 'Wrong Item Ordered',
  shipping_delay: 'Shipping Delay',
  better_price: 'Found Better Price',
  payment_issue: 'Payment Issue',
  duplicate_order: 'Duplicate Order',
  other: 'Other'
};

/**
 * Get status badge color for UI
 */
export const getCancellationStatusColor = (status) => {
  switch (status) {
    case CANCELLATION_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case CANCELLATION_STATUS.APPROVED:
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case CANCELLATION_STATUS.REJECTED:
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
};

/**
 * Get refund status badge color for UI
 */
export const getRefundStatusColor = (status) => {
  switch (status) {
    case REFUND_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case REFUND_STATUS.PROCESSING:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case REFUND_STATUS.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case REFUND_STATUS.FAILED:
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
};

/**
 * Get reason label from value
 */
export const getReasonLabel = (reasonValue) => {
  return CANCELLATION_REASON_LABELS[reasonValue] || reasonValue;
};

/**
 * Format cancellation data for display
 */
export const formatCancellationForDisplay = (cancellation) => {
  return {
    ...cancellation,
    reason_label: getReasonLabel(cancellation.reason),
    status_color: getCancellationStatusColor(cancellation.status),
    refund_status_color: cancellation.refund_status ? getRefundStatusColor(cancellation.refund_status) : '',
    formatted_created_at: new Date(cancellation.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    formatted_processed_at: cancellation.processed_at ? new Date(cancellation.processed_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null
  };
};