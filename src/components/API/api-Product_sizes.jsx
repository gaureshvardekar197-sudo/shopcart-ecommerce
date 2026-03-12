import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Size API Service
 */
const sizeApi = {
    // PUBLIC ENDPOINTS
    getSizeOptions: async () => {
        try {
            const response = await api.get('/sizes/options');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getSizesByCategory: async (category) => {
        try {
            const response = await api.get(`/sizes/category/${category}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getPriceRange: async (productId) => {
        try {
            const response = await api.get(`/sizes/price-range/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getProductSizes: async (productId) => {
        try {
            const response = await api.get(`/products/${productId}/sizes`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    checkSizeAvailability: async (productId, sizeData) => {
        try {
            const response = await api.post(`/products/${productId}/sizes/check-availability`, sizeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getSizeDetails: async (sizeId) => {
        try {
            const response = await api.get(`/sizes/${sizeId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ADMIN ENDPOINTS
    addSizes: async (productId, sizeData, token) => {
        try {
            const response = await api.post(`/admin/products/${productId}/sizes`, sizeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateBulkSizes: async (productId, sizesData, token) => {
        try {
            const response = await api.put(`/admin/products/${productId}/sizes/bulk`, sizesData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateSize: async (sizeId, sizeData, token) => {
        try {
            const response = await api.put(`/admin/sizes/${sizeId}`, sizeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteSize: async (sizeId, token) => {
        try {
            const response = await api.delete(`/admin/sizes/${sizeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default sizeApi;