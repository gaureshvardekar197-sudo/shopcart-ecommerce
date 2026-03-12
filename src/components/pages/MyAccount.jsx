// pages/MyAccount.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  HomeIcon,
  PlusIcon,
  TrashIcon,
  StarIcon as StarIconSolid,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import {
  StarIcon as StarIconOutline,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Container from '../layout/Container';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../API/api-address';
import {
  updateUserProfile
} from '../API/api-user';

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Address states - Updated to match Laravel controller fields
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'home',
    is_default: false
  });
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistCount: 0,
    cartCount: 0
  });

  const navigate = useNavigate();
  const { wishlistCount, refreshWishlist } = useWishlist();
  const { cartCount, refreshCart } = useCart();

  useEffect(() => {
    loadUserData();
    fetchUserStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const loadUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditedUser(parsedUser);
        // Pre-fill address form with user data if available
        setAddressForm(prev => ({
          ...prev,
          full_name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setIsLoading(false);
  };

  const fetchUserStats = () => {
    setStats({
      totalOrders: 0,
      wishlistCount,
      cartCount
    });
  };

  // Address functions
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await getAddresses();
      if (response?.success && response.data) {
        setAddresses(response.data);
      } else if (Array.isArray(response)) {
        setAddresses(response);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetAddressForm = () => {
    setAddressForm({
      full_name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      address_type: 'home',
      is_default: false
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const validateAddressForm = () => {
    const required = ['full_name', 'phone', 'email', 'address_line1', 'city', 'state', 'pincode'];
    const missingFields = required.filter(field => !addressForm[field]?.trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleAddAddress = async () => {
    if (!validateAddressForm()) return;

    try {
      setError('');
      setLoadingAddresses(true);
      const response = await addAddress(addressForm);
      
      if (response?.success) {
        setSuccess('Address added successfully');
        fetchAddresses();
        resetAddressForm();
      } else {
        setError(response?.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      setError(error.response?.data?.message || 'Failed to add address');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress || !validateAddressForm()) return;

    try {
      setError('');
      setLoadingAddresses(true);
      const response = await updateAddress(editingAddress.id, addressForm);
      
      if (response?.success) {
        setSuccess('Address updated successfully');
        fetchAddresses();
        resetAddressForm();
      } else {
        setError(response?.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      setError(error.response?.data?.message || 'Failed to update address');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setError('');
      const response = await deleteAddress(addressId);
      
      if (response?.success) {
        setSuccess('Address deleted successfully');
        fetchAddresses();
      } else {
        setError(response?.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setError('');
      const response = await setDefaultAddress(addressId);
      
      if (response?.success) {
        setSuccess('Default address updated successfully');
        fetchAddresses();
      } else {
        setError(response?.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      setError(error.response?.data?.message || 'Failed to set default address');
    }
  };

  const editAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      full_name: address.full_name || '',
      phone: address.phone || '',
      email: address.email || '',
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      landmark: address.landmark || '',
      address_type: address.address_type || 'home',
      is_default: address.is_default || false
    });
    setShowAddressForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      setIsSaving(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await updateUserProfile(editedUser);
      
      if (response?.status === true) {
        const updatedUser = response.user || editedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditedUser(updatedUser);
        
        // Update address form with new user data
        setAddressForm(prev => ({
          ...prev,
          full_name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || ''
        }));
        
        setSuccess(response.message || 'Profile updated successfully!');
        setIsEditing(false);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Profile update error:', err);
      
      let errorMessage = 'Failed to update profile. ';
      
      if (err.response) {
        switch (err.response.status) {
          case 404:
            errorMessage += 'Profile update endpoint not found. Please contact support.';
            break;
          case 401:
            errorMessage += 'Your session has expired. Please login again.';
            setTimeout(() => navigate('/login'), 2000);
            break;
          case 422:
            const validationErrors = err.response.data.errors;
            if (validationErrors) {
              const firstError = Object.values(validationErrors)[0];
              errorMessage += Array.isArray(firstError) ? firstError[0] : firstError;
            } else {
              errorMessage += err.response.data?.message || 'Invalid data provided';
            }
            break;
          default:
            errorMessage += err.response.data?.message || `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getAddressTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home': return <HomeIcon className="h-5 w-5" />;
      case 'work': return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'other': return <MapPinIcon className="h-5 w-5" />;
      default: return <HomeIcon className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <Container>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Container>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profile, addresses, and view your orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden sticky top-24">
              {/* User Info Summary */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-blue-600">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold">{user.name || 'User'}</h3>
                    <p className="text-xs text-blue-100">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  Profile Information
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors mt-1 ${
                    activeTab === 'addresses'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <MapPinIcon className="h-5 w-5" />
                  My Addresses
                  {addresses.length > 0 && (
                    <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {addresses.length}
                    </span>
                  )}
                </button>

                <Link
                  to="/my-orders"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-1"
                >
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  My Orders
                  {stats.totalOrders > 0 && (
                    <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {stats.totalOrders}
                    </span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-1"
                >
                  <HeartIcon className="h-5 w-5" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <div className="border-t dark:border-gray-700 my-4"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              </div>

              {/* Quick Stats */}
              {/* <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  Quick Stats
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stats.totalOrders}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">{stats.wishlistCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Wishlist</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.cartCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cart</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      disabled={isSaving}
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editedUser.name || ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        {user.name || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email || ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        {user.email || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editedUser.phone || ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        {user.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Security */}
                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Security
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      To change your password or update security settings, please use the password reset option on the login page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    My Addresses
                  </h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add New Address
                    </button>
                  )}
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <div className="mb-8 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={addressForm.full_name}
                          onChange={handleAddressInputChange}
                          placeholder="Enter full name"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleAddressInputChange}
                          placeholder="Enter phone number"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={addressForm.email}
                          onChange={handleAddressInputChange}
                          placeholder="Enter email address"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* Address Line 1 */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          name="address_line1"
                          value={addressForm.address_line1}
                          onChange={handleAddressInputChange}
                          placeholder="House number, street name"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* Address Line 2 */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          name="address_line2"
                          value={addressForm.address_line2}
                          onChange={handleAddressInputChange}
                          placeholder="Apartment, suite, unit"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Landmark */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={addressForm.landmark}
                          onChange={handleAddressInputChange}
                          placeholder="Nearby landmark"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressInputChange}
                          placeholder="City"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressInputChange}
                          placeholder="State"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressInputChange}
                          placeholder="Pincode"
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>

                      {/* Address Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address Type
                        </label>
                        <select
                          name="address_type"
                          value={addressForm.address_type}
                          onChange={handleAddressInputChange}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Default Address Checkbox */}
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            name="is_default"
                            checked={addressForm.is_default}
                            onChange={handleAddressInputChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Set as default address
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                        disabled={loadingAddresses}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loadingAddresses ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        onClick={resetAddressForm}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Addresses List */}
                {loadingAddresses && !showAddressForm ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No addresses saved
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Add your first address to make checkout faster
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border dark:border-gray-700 rounded-lg p-4 ${
                          address.is_default ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="text-gray-500 dark:text-gray-400">
                              {getAddressTypeIcon(address.address_type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                  {address.address_type} Address
                                </span>
                                {address.is_default && (
                                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                    <StarIconSolid className="h-3 w-3" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{address.full_name}</span>
                                <br />
                                {address.address_line1}
                                {address.address_line2 && <>, {address.address_line2}</>}
                                {address.landmark && <>, {address.landmark}</>}
                                <br />
                                {address.city}, {address.state} - {address.pincode}
                                <br />
                                <span className="text-gray-500">Phone: {address.phone}</span>
                                <br />
                                <span className="text-gray-500">Email: {address.email}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!address.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Set as default"
                              >
                                <StarIconOutline className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => editAddress(address)}
                              className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Edit address"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Delete address"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MyAccount;