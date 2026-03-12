import React, { useState, useEffect } from 'react';
import { 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  User,
  ShoppingBag,
  Calendar,
  MessageSquare,
  DollarSign,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';
import { 
  getAllCancellations,  // Changed from getPendingCancellations
  getAdminCancellationById,
  approveCancellationRequest, 
  rejectCancellationRequest,
  CANCELLATION_REASONS,
  CANCELLATION_STATUS,
  REFUND_STATUS,
  getCancellationStatusColor,
  getRefundStatusColor
} from '../../../API/api-cancellation_Order';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../../../Common/Loader';
import Swal from 'sweetalert2';
import Pagination from "../../../Common/Pagination";

const CancellationRequests = () => {
  const [allRequests, setAllRequests] = useState([]); // Store all requests for stats
  const [displayedRequests, setDisplayedRequests] = useState([]); // Store filtered/paginated requests for display
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [processing, setProcessing] = useState(false);
   const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
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
    fetchAllRequests();
  }, []);

  // Apply filters and pagination whenever dependencies change
  useEffect(() => {
    if (allRequests.length > 0) {
      // Apply filters
      let filtered = [...allRequests];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(request => 
          request.order?.order_number?.toLowerCase().includes(searchLower) ||
          request.user?.name?.toLowerCase().includes(searchLower) ||
          request.user?.email?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
      
      // Update pagination based on filtered results
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pagination.perPage);
      
      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages,
        currentPage: 1 // Reset to first page when filters change
      }));
      
      // Get current page items
      const startIndex = 0; // Reset to first page
      const endIndex = pagination.perPage;
      setDisplayedRequests(filtered.slice(startIndex, endIndex));
    }
  }, [allRequests, searchTerm, statusFilter, sortBy]);

  // Handle page change
  useEffect(() => {
    if (allRequests.length > 0) {
      // Apply filters first
      let filtered = [...allRequests];
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(request => 
          request.order?.order_number?.toLowerCase().includes(searchLower) ||
          request.user?.name?.toLowerCase().includes(searchLower) ||
          request.user?.email?.toLowerCase().includes(searchLower)
        );
      }
      
      if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
      
      // Apply pagination
      const startIndex = (pagination.currentPage - 1) * pagination.perPage;
      const endIndex = startIndex + pagination.perPage;
      setDisplayedRequests(filtered.slice(startIndex, endIndex));
    }
  }, [pagination.currentPage, allRequests, searchTerm, statusFilter, sortBy]);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: 100 // Get more items for stats
      };

      const response = await getAllCancellations(params);
      
      if (response?.status) {
        const requestsData = response.data.data || [];
        setAllRequests(requestsData);
        
        // Set initial displayed requests
        setDisplayedRequests(requestsData.slice(0, pagination.perPage));
        
        setPagination({
          currentPage: 1,
          totalPages: Math.ceil(requestsData.length / pagination.perPage),
          totalItems: requestsData.length,
          perPage: pagination.perPage
        });
        
        console.log('All requests loaded:', requestsData);
      } else if (response?.role_error) {
        toast.error('Admin access required');
      }
    } catch (error) {
      toast.error('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllRequests();
  };

const handleViewDetails = (id) => {
  navigate(`/admin/cancellation-requests/${id}`); // Navigate to the view page
};
  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setApprovalData({
      refund_amount: request.refund_amount || request.order?.total || '',
      admin_response: ''
    });
    setShowApproveModal(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
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
      const response = await approveCancellationRequest(
        selectedRequest.id, 
        approvalData
      );

      if (response?.status) {
        toast.success('Cancellation request approved successfully');
        setShowApproveModal(false);
        fetchAllRequests(); // Refresh all requests
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
      const response = await rejectCancellationRequest(
        selectedRequest.id, 
        rejectionData
      );

      if (response?.status) {
        toast.success('Cancellation request rejected');
        setShowRejectModal(false);
        fetchAllRequests(); // Refresh all requests
      } else {
        toast.error(response?.message || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Error processing rejection');
    } finally {
      setProcessing(false);
    }
  };

  const getReasonLabel = (reason) => {
    const found = CANCELLATION_REASONS.find(r => r.value === reason);
    return found ? found.label : reason;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
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

  // Calculate stats from all requests
  const totalRequests = allRequests?.length || 0;
  const pendingCount = allRequests?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = allRequests?.filter(r => r.status === 'approved').length || 0;
  const rejectedCount = allRequests?.filter(r => r.status === 'rejected').length || 0;

  // Debug log
  console.log('All Requests:', allRequests);
  console.log('Stats:', { totalRequests, pendingCount, approvedCount, rejectedCount });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Cancellation Requests</h1>
              <p className="text-sm text-gray-500">Manage and process customer cancellation requests</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {/* Total Requests */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-blue-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-2xl font-bold">{totalRequests}</p>
            <p className="text-sm text-blue-100 mt-1">All Requests</p>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-sm text-yellow-100 mt-1">Awaiting Review</p>
          </div>

          {/* Approved */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Approved</span>
            </div>
            <p className="text-2xl font-bold">{approvedCount}</p>
            <p className="text-sm text-green-100 mt-1">Cancelled</p>
          </div>

          {/* Rejected */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Rejected</span>
            </div>
            <p className="text-2xl font-bold">{rejectedCount}</p>
            <p className="text-sm text-red-100 mt-1">Denied</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {/* Mobile Filter Toggle */}
          <div className="sm:hidden mb-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
            >
              <span className="flex items-center gap-2 text-gray-700">
                <Filter className="w-4 h-4" />
                Filters & Search
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Content */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order #, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results count */}
            {allRequests.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                Showing {displayedRequests.length} of {pagination.totalItems} requests
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loader message="Loading cancellation requests..." />
        ) : displayedRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No cancellation requests</h3>
            <p className="text-gray-500">There are no requests to display at this moment</p>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">#{request.id}</p>
                                <p className="text-xs text-gray-500">{formatDate(request.created_at)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{request.user?.name}</p>
                                <p className="text-xs text-gray-500">{request.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">#{request.order?.order_number}</p>
                                <p className="text-xs text-gray-500">{formatCurrency(request.order?.total)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-800">{getReasonLabel(request.reason)}</p>
                            {request.reason_note && (
                              <p className="text-xs text-gray-500 mt-1">{request.reason_note}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCancellationStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(request.id)}
                                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                              
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveClick(request)}
                                    className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(request)}
                                    className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Request #{request.id}</p>
                            <p className="text-xs text-gray-500">{formatDate(request.created_at)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCancellationStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Customer */}
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{request.user?.name}</p>
                          <p className="text-xs text-gray-500">{request.user?.email}</p>
                        </div>
                      </div>

                      {/* Order */}
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Order #{request.order?.order_number}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(request.order?.total)}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{getReasonLabel(request.reason)}</p>
                          {request.reason_note && (
                            <p className="text-xs text-gray-500 mt-1">{request.reason_note}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleViewDetails(request.id)}
                          className="flex-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
                        >
                          View Details
                        </button>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveClick(request)}
                              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(request)}
                              className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                  itemsPerPage={pagination.perPage}
                  totalItems={pagination.totalItems}
                />
              </div>
            )}
          </>
        )}
      </div>

 {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Cancellation Request Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badges */}
              <div className="flex gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCancellationStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </span>
                {selectedRequest.refund_status && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRefundStatusColor(selectedRequest.refund_status)}`}>
                    Refund: {selectedRequest.refund_status}
                  </span>
                )}
              </div>

              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Request ID</p>
                  <p className="text-sm font-medium text-gray-800">#{selectedRequest.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Requested On</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-800">{selectedRequest.user?.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-8">
                    {selectedRequest.user?.email}
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Order Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Order Number</p>
                      <p className="text-sm font-medium text-gray-800">#{selectedRequest.order?.order_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Total</p>
                      <p className="text-sm font-medium text-gray-800">{formatCurrency(selectedRequest.order?.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedRequest.order?.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Status</p>
                      <p className="text-sm text-gray-600">{selectedRequest.order?.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Cancellation Reason</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    {getReasonLabel(selectedRequest.reason)}
                  </p>
                  {selectedRequest.reason_note && (
                    <div className="flex gap-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{selectedRequest.reason_note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Response */}
              {selectedRequest.admin_response && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Admin Response</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedRequest.admin_response}</p>
                    {selectedRequest.processed_by && (
                      <p className="text-xs text-gray-500 mt-2">
                        Processed by: {selectedRequest.processor?.name} on {formatDate(selectedRequest.processed_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Refund Info */}
              {selectedRequest.refund_amount && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Refund Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Refund Amount</p>
                        <p className="text-sm font-medium text-gray-800">{formatCurrency(selectedRequest.refund_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Refund Status</p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRefundStatusColor(selectedRequest.refund_status)}`}>
                          {selectedRequest.refund_status}
                        </span>
                      </div>
                      {selectedRequest.refund_transaction_id && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Transaction ID</p>
                          <p className="text-sm text-gray-600">{selectedRequest.refund_transaction_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Approve Cancellation</h2>
            </div>

            <form onSubmit={handleApproveSubmit}>
              <div className="p-6 space-y-4">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add a response to the customer (optional)"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Approving this request will cancel the order and initiate a refund of {formatCurrency(approvalData.refund_amount || 0)}.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Reject Cancellation</h2>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={rejectionData.admin_response}
                    onChange={(e) => setRejectionData({ admin_response: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Explain why the cancellation request is being rejected"
                  />
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Note:</strong> Rejecting this request will notify the customer and the order will remain active.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationRequests;





     
