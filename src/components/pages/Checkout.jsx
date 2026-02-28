import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../components/layout/Container';
import {
  ShoppingCartIcon,
  TruckIcon,
  CreditCardIcon,
  MapPinIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  PlusIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { getCart } from '../API/api-cart';
import { getAddresses, addAddress } from '../API/api-address';
import { placeOrder } from '../API/api-Order';

// Helper function for currency formatting
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
};

// Helper function for image URL
const getImageUrl = (item, API_URL = "http://localhost:8000") => {
  if (!item) return '';
  if (item.image_url) return item.image_url;
  if (item.image) {
    if (item.image.startsWith('http')) return item.image;
    if (item.image.startsWith('products/')) return `${API_URL}/storage/${item.image}`;
    return `${API_URL}/storage/products/${item.image}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'P')}&background=3B82F6&color=fff&size=400&length=2`;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    shipping_address: {
      full_name: '',
      phone: '',
      email: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      address_type: 'home'
    },
    billing_address: {
      same_as_shipping: true,
      full_name: '',
      phone: '',
      email: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    payment_method: 'cod',
    delivery_instructions: '',
    save_address: true
  });

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Constants
  const FREE_DELIVERY_THRESHOLD = 500;
  const DELIVERY_CHARGE = 40;
  const API_URL = "http://localhost:8000";

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    setLoading(true);

    try {
      // Load cart
      const cartResponse = await getCart();

      // Extract cart data
      let cartData = [];
      if (cartResponse?.data) {
        if (Array.isArray(cartResponse.data)) {
          cartData = cartResponse.data;
        } else if (cartResponse.data.data && Array.isArray(cartResponse.data.data)) {
          cartData = cartResponse.data.data;
        }
      }

      // Check if cart is empty
      if (cartData.length === 0) {
        toast.info('Your cart is empty');
        navigate('/cart');
        return;
      }

      setCartItems(cartData);

      // Load saved addresses
      await loadSavedAddresses();

    } catch (error) {
      console.error('Error loading checkout data:', error);

      if (error.response?.status === 401) {
        toast.info('Please login to proceed to checkout');
        navigate('/login', { state: { from: '/checkout' } });
      } else {
        toast.error('Failed to load checkout data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await getAddresses();

      if (response?.data) {
        const addresses = response.data;
        setSavedAddresses(addresses);

        // Auto-select default address if available
        const defaultAddress = addresses.find(addr => addr.is_default);
        if (defaultAddress) {
          selectAddress(defaultAddress);
        } else if (addresses.length > 0) {
          setShowAddressForm(false);
        } else {
          setShowAddressForm(true);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const selectAddress = (address) => {
    setSelectedAddressId(address.id);
    setFormData(prev => ({
      ...prev,
      shipping_address: {
        full_name: address.full_name || address.name || '',
        phone: address.phone || '',
        email: address.email || '',
        address_line1: address.address_line1 || address.address || '',
        address_line2: address.address_line2 || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        landmark: address.landmark || '',
        address_type: address.address_type || 'home'
      }
    }));
    setShowAddressForm(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setFormData(prev => ({
      ...prev,
      shipping_address: {
        full_name: '',
        phone: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        address_type: 'home'
      }
    }));
    setShowAddressForm(true);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let itemCount = 0;

    cartItems.forEach(item => {
      const quantity = item.quantity || 1;
      const price = item.selling_price || item.price || 0;
      subtotal += price * quantity;
      itemCount += quantity;
    });

    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const total = subtotal + deliveryCharge;

    return { subtotal, itemCount, deliveryCharge, total };
  };

  const { subtotal, itemCount, deliveryCharge, total } = calculateTotals();

  const validateForm = () => {
    const { shipping_address } = formData;

    const requiredFields = ['full_name', 'phone', 'email', 'address_line1', 'city', 'state', 'pincode'];

    for (const field of requiredFields) {
      if (!shipping_address[field]?.trim()) {
        toast.error(`Please enter ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shipping_address.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shipping_address.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return false;
    }

    // Pincode validation
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(shipping_address.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const saveAddressToAccount = async () => {
    if (!formData.save_address || selectedAddressId) return;

    try {
      await addAddress({
        ...formData.shipping_address,
        is_default: savedAddresses.length === 0
      });
      toast.success('Address saved successfully');
      await loadSavedAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      // Don't show error to user as order was still placed
    }
  };

  const placeOrderHandler = async () => {
    if (!validateForm()) return;

    setPlacingOrder(true);

    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1,
        price: item.selling_price || item.price || 0,
        name: item.name,
        image: item.image || item.image_url || null // Make sure to include the image
      }));

      // Prepare order data
      const orderData = {
        items: orderItems,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_address.same_as_shipping
          ? formData.shipping_address
          : formData.billing_address,
        payment_method: formData.payment_method,
        delivery_instructions: formData.delivery_instructions,
        subtotal: subtotal,
        delivery_charge: deliveryCharge,
        total: total
      };

      // Place order
      const response = await placeOrder(orderData);

      if (response?.status || response?.success) {
        // Save address if requested and it's a new address
        await saveAddressToAccount();

        toast.success('Order placed successfully!');

        // Clear cart from local storage and trigger update
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));

        // Navigate to order confirmation
        const orderId = response?.data?.id || response?.order?.id;
        navigate(`/order-confirmation/${orderId}`);
      } else {
        throw new Error(response?.message || 'Failed to place order');
      }

    } catch (error) {
      console.error('Error placing order:', error);

      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checkout...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCardIcon className="w-8 h-8 text-blue-600" />
              Checkout
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !showAddressForm && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    Saved Addresses
                  </h2>
                  <button
                    onClick={handleAddNewAddress}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add New
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {savedAddresses.map(address => (
                    <div
                      key={address.id}
                      onClick={() => selectAddress(address)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === address.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {address.address_type === 'home' ? (
                            <HomeIcon className="w-5 h-5 text-gray-400" />
                          ) : address.address_type === 'work' ? (
                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                          ) : (
                            <MapIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {address.full_name || address.name}
                            </p>
                            {address.is_default && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            📞 {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address Form */}
            {(showAddressForm || savedAddresses.length === 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  {selectedAddressId ? 'Edit Address' : 'Shipping Address'}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="shipping_address.full_name"
                      value={formData.shipping_address.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="shipping_address.phone"
                      value={formData.shipping_address.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="9876543210"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="shipping_address.email"
                      value={formData.shipping_address.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="shipping_address.address_line1"
                      value={formData.shipping_address.address_line1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="House/Flat No., Building Name"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="shipping_address.address_line2"
                      value={formData.shipping_address.address_line2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Street, Area, Locality"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="shipping_address.city"
                      value={formData.shipping_address.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="shipping_address.state"
                      value={formData.shipping_address.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="shipping_address.pincode"
                      value={formData.shipping_address.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="400001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="shipping_address.landmark"
                      value={formData.shipping_address.landmark}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Near Central Park"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address Type
                    </label>
                    <select
                      name="shipping_address.address_type"
                      value={formData.shipping_address.address_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {!selectedAddressId && (
                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="save_address"
                        checked={formData.save_address}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Save this address for future orders
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Billing Address (if different from shipping) */}
            {/* {!formData.billing_address.same_as_shipping && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  Billing Address
                </h2>

                {/* Add billing address fields here - similar to shipping address */}
                {/* ... }
              </div>
            )} */}

            {/* Same as shipping checkbox */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="billing_address.same_as_shipping"
                  checked={formData.billing_address.same_as_shipping}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Billing address same as shipping address
                </span>
              </label>
            </div> */}

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-blue-600" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-700">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={formData.payment_method === 'cod'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <TruckIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Cash on Delivery</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive your order</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-700">
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={formData.payment_method === 'online'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Online Payment</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Credit/Debit Card, UPI, NetBanking</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Instructions (Optional)
              </h2>
              <textarea
                name="delivery_instructions"
                value={formData.delivery_instructions}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Any special instructions for delivery? (e.g., Leave at gate, Call before delivery)"
              ></textarea>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                  Your Order
                </h2>

                {/* Order Items */}
                <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item, API_URL)}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'P')}&background=3B82F6&color=fff&size=400&length=2`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {item.name}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity || 1}
                          </span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency((item.selling_price || item.price || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal ({itemCount} items)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <TruckIcon className="w-4 h-4" />
                      Delivery Charge
                    </span>
                    {deliveryCharge === 0 ? (
                      <span className="font-medium text-green-600">FREE</span>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(deliveryCharge)}</span>
                    )}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={placeOrderHandler}
                  disabled={placingOrder}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5" />
                      Place Order • {formatCurrency(total)}
                    </>
                  )}
                </button>

                {/* Security Note */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <LockClosedIcon className="w-4 h-4" />
                  Your information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}