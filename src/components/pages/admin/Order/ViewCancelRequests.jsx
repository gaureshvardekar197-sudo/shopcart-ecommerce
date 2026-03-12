import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
  ShoppingBag,
  Calendar,
  MessageSquare,
  DollarSign,
  Edit,
  Trash2,
  Printer,
  Mail,
  Download,
  AlertCircle,
  Tag,
  Package,
  CreditCard,
  Truck,
  Home,
  Building,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Eye
} from 'lucide-react';
import { 
  getAdminCancellationById,
  approveCancellationRequest, 
  rejectCancellationRequest,
  CANCELLATION_REASONS,
  CANCELLATION_STATUS,
  REFUND_STATUS,
  getCancellationStatusColor,
  getRefundStatusColor
} from '../../../API/api-cancellation_Order';
import { getAdminOrderById } from '../../../API/api-Order';
import { toast } from 'react-toastify';
import Loader from '../../../Common/Loader';
import Swal from 'sweetalert2';

const ViewCancellationRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    shipping: true,
    items: true,
    timeline: true
  });

  // Form state for approval
  const [approvalData, setApprovalData] = useState({
    refund_amount: '',
    admin_response: ''
  });

  // Form state for rejection
  const [rejectionData, setRejectionData] = useState({
    admin_response: ''
  });

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

const fetchRequestDetails = async () => {
  setLoading(true);
  try {
    const response = await getAdminCancellationById(id);
    
    if (response?.status) {
      const requestData = response.data;
      setRequest(requestData);
      setApprovalData(prev => ({
        ...prev,
        refund_amount: requestData.refund_amount || requestData.order?.total || ''
      }));
      
      // Fetch full order details with items - USE ADMIN ENDPOINT
      if (requestData.order?.id) {
        try {
          // Use getAdminOrderById instead of getOrderById
          const orderResponse = await getAdminOrderById(requestData.order.id);
          if (orderResponse?.success && orderResponse?.data) {
            setOrderDetails(orderResponse.data);
          } else if (orderResponse?.data) {
            setOrderDetails(orderResponse.data);
          }
        } catch (orderError) {
          console.error('Error fetching order details:', orderError);
        }
      }
    } else {
      toast.error('Failed to load request details');
      navigate('/admin/cancellation-requests');
    }
  } catch (error) {
    console.error('Error fetching request details:', error);
    toast.error('Error loading request details');
    navigate('/admin/cancellation-requests');
  } finally {
    setLoading(false);
  }
};

  const handleApproveClick = () => {
    setApprovalData({
      refund_amount: request.refund_amount || request.order?.total || '',
      admin_response: ''
    });
    setShowApproveModal(true);
  };

  const handleRejectClick = () => {
    setRejectionData({ admin_response: '' });
    setShowRejectModal(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: 'Approve Cancellation?',
      text: `Are you sure you want to approve this cancellation request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setProcessing(true);
    try {
      const response = await approveCancellationRequest(id, approvalData);

      if (response?.status) {
        toast.success('Cancellation request approved successfully');
        setShowApproveModal(false);
        fetchRequestDetails();
      } else if (response?.validation_error) {
        toast.error('Please check the form for errors');
      } else {
        toast.error(response?.message || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('Error processing approval');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: 'Reject Cancellation?',
      text: `Are you sure you want to reject this cancellation request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setProcessing(true);
    try {
      const response = await rejectCancellationRequest(id, rejectionData);

      if (response?.status) {
        toast.success('Cancellation request rejected');
        setShowRejectModal(false);
        fetchRequestDetails();
      } else {
        toast.error(response?.message || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Error processing rejection');
    } finally {
      setProcessing(false);
    }
  };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleEmail = () => {
//     toast.info('Email feature coming soon');
//   };

//   const handleDownload = () => {
//     toast.info('Download feature coming soon');
//   };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getReasonLabel = (reason) => {
    const found = CANCELLATION_REASONS.find(r => r.value === reason);
    return found ? found.label : reason;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    if (image.startsWith('/storage/')) {
      return `${baseUrl}${image}`;
    }
    
    if (image.startsWith('storage/')) {
      return `${baseUrl}/${image}`;
    }
    
    if (image.startsWith('products/')) {
      return `${baseUrl}/storage/${image}`;
    }
    
    return `${baseUrl}/storage/products/${image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 font-medium">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Request Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">The cancellation request you're looking for doesn't exist.</p>
          <Link
            to="/admin/cancellation-requests"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  const order = orderDetails || request.order || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed for mobile */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/admin/cancellation-requests"
                className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Link>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  Cancellation Request #{request.id}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">View and manage cancellation request</p>
              </div>
            </div>
            
            {/* Status Badge - Mobile optimized */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium border ${getCancellationStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Action Buttons - Scrollable on mobile */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap sm:overflow-visible">
            {/* <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">Print</span>
            </button> */}
            {/* <button
              onClick={handleEmail}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Email</span>
              <span className="sm:hidden">Email</span>
            </button> */}
            {/* <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">DL</span>
            </button> */}
            <Link
              to={`/admin/orders/${order.id}`}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Order</span>
              <span className="sm:hidden">Order</span>
            </Link>
            {request.status === 'pending' && (
              <>
                <button
                  onClick={handleApproveClick}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                >
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Approve</span>
                  <span className="sm:hidden">Approve</span>
                </button>
                <button
                  onClick={handleRejectClick}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                >
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Reject</span>
                  <span className="sm:hidden">Reject</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Status Banner */}
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${
          request.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
          request.status === 'approved' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3">
            {request.status === 'pending' && <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />}
            {request.status === 'approved' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            {request.status === 'rejected' && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                This request is <span className={`font-bold ${
                  request.status === 'pending' ? 'text-yellow-600' :
                  request.status === 'approved' ? 'text-green-600' :
                  'text-red-600'
                }`}>{request.status.toUpperCase()}</span>
              </p>
              {request.processed_at && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Processed on {formatDate(request.processed_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm mb-1">Order Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(order.total)}</p>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:gap-6 gap-4">
                <div>
                  <p className="text-blue-100 text-xs mb-1">Order ID</p>
                  <p className="text-sm sm:text-base font-semibold text-white">#{order.id}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-xs mb-1">Payment</p>
                  <p className="text-xs sm:text-sm font-semibold text-white capitalize truncate">
                    {order.payment_method === 'cod' ? 'COD' : order.payment_method}
                  </p>
                </div>
                <div className="col-span-2 sm:col-auto">
                  <p className="text-blue-100 text-xs mb-1">Order Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Request Information Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Request Information
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Request ID</p>
                <p className="text-sm font-medium text-gray-900">#{request.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCancellationStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Updated</p>
                <p className="text-sm text-gray-600">{formatDate(request.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information - Collapsible */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          <div 
            className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
            onClick={() => toggleSection('customer')}
          >
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Customer Information
            </h2>
            <button className="lg:hidden">
              {expandedSections.customer ? 
                <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </button>
          </div>
          
          {(expandedSections.customer || window.innerWidth >= 1024) && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">{request.user?.name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900 break-all">{request.user?.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">#{request.user?.id || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Shipping Address
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Home className="w-5 h-5 text-gray-400 hidden sm:block flex-shrink-0 mt-1" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {order.shipping_address.full_name}
                    </p>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p>{order.shipping_address.address_line1}</p>
                      {order.shipping_address.address_line2 && (
                        <p>{order.shipping_address.address_line2}</p>
                      )}
                      {order.shipping_address.landmark && (
                        <p className="text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.shipping_address.landmark}
                        </p>
                      )}
                      <p className="font-medium">
                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                      <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.shipping_address.phone}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 break-all">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{order.shipping_address.email}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Cancellation Reason
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                {getReasonLabel(request.reason)}
              </p>
              {request.reason_note ? (
                <p className="text-gray-600 text-sm">{request.reason_note}</p>
              ) : (
                <p className="text-gray-400 italic text-sm">No additional notes provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Section with Images */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          <div 
            className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
            onClick={() => toggleSection('items')}
          >
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Order Items ({orderDetails?.items?.length || order.items?.length || 0})
            </h2>
            <button className="lg:hidden">
              {expandedSections.items ? 
                <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </button>
          </div>
          
          {(expandedSections.items || window.innerWidth >= 1024) && (
            <div className="p-4 sm:p-6">
              {orderDetails?.items && orderDetails.items.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {orderDetails.items.map((item, index) => {
                    const imageUrl = getImageUrl(item.image) || getImageUrl(item.image_url);
                    
                    return (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                        {/* Product Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 mx-auto sm:mx-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3B82F6&color=fff&size=80`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 text-center sm:text-left">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 text-center sm:text-left">
                                ID: #{item.product_id}
                              </p>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-blue-600 text-center sm:text-right">
                              {formatCurrency(item.total || item.price * item.quantity)}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 mt-3">
                            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200">
                              <Tag className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Price:</span>
                              <span className="text-xs font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200">
                              <Package className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Qty:</span>
                              <span className="text-xs font-semibold text-gray-900">{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500">No items found for this order</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Response */}
        {request.admin_response && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Admin Response
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">{request.admin_response}</p>
                {request.processor && (
                  <p className="text-xs text-gray-500 mt-2">
                    Responded by {request.processor.name} on {formatDate(request.processed_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Refund Information */}
        {request.refund_amount && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Refund Information
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Refund Amount</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(request.refund_amount)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Refund Status</p>
                  {request.refund_status ? (
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getRefundStatusColor(request.refund_status)}`}>
                      {request.refund_status}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Not applicable</span>
                  )}
                </div>
                {request.refund_transaction_id && (
                  <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-sm text-gray-600 break-all">{request.refund_transaction_id}</p>
                  </div>
                )}
                {request.refunded_at && (
                  <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Refund Date</p>
                    <p className="text-sm text-gray-600">{formatDate(request.refunded_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-pointer lg:cursor-default"
            onClick={() => toggleSection('timeline')}
          >
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Timeline
            </h2>
            <button className="lg:hidden">
              {expandedSections.timeline ? 
                <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </button>
          </div>
          
          {(expandedSections.timeline || window.innerWidth >= 1024) && (
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Request Created */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    {request.processed_at && (
                      <div className="absolute top-8 sm:top-10 left-4 sm:left-5 w-0.5 h-8 sm:h-12 bg-gray-200"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-3 sm:pb-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Request Created</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(request.created_at)}</p>
                  </div>
                </div>

                {/* Processed (if any) */}
                {request.processed_at && (
                  <div className="flex gap-3 sm:gap-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      request.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    } rounded-full flex items-center justify-center`}>
                      {request.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">
                        Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(request.processed_at)}</p>
                      {request.processor && (
                        <p className="text-xs text-gray-400 mt-0.5">by {request.processor.name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Approve Cancellation</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Request #{request.id}</p>
            </div>
            
            <form onSubmit={handleApproveSubmit}>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={approvalData.refund_amount}
                      onChange={(e) => setApprovalData({ ...approvalData, refund_amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="Enter refund amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Response
                  </label>
                  <textarea
                    rows="3"
                    value={approvalData.admin_response}
                    onChange={(e) => setApprovalData({ ...approvalData, admin_response: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="Add a response to the customer (optional)"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Approving this request will cancel the order and initiate a refund.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2.5 sm:py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors text-sm w-full sm:w-auto order-1 sm:order-2"
                >
                  {processing ? 'Processing...' : 'Approve Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Reject Cancellation</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Request #{request.id}</p>
            </div>
            
            <form onSubmit={handleRejectSubmit}>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={rejectionData.admin_response}
                    onChange={(e) => setRejectionData({ admin_response: e.target.value })}
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Explain why the cancellation request is being rejected"
                  />
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Note:</strong> Rejecting this request will notify the customer and the order will remain active.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2.5 sm:py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors text-sm w-full sm:w-auto order-1 sm:order-2"
                >
                  {processing ? 'Processing...' : 'Reject Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCancellationRequest;