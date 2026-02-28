// src/components/pages/admin/Product_Review/All Review.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Grid,
  List,
  Package,
  X
} from 'lucide-react'
import reviewApi from '../../../API/api-review'
import { getProducts } from '../../../API/api-products'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import Pagination from "../../../Common/Pagination";

function AdminAllReviews() {
  const navigate = useNavigate()

  // States
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [itemsPerPage] = useState(10)

  // Filter states
  const [selectedRating, setSelectedRating] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState('table')

  // Selection states
  const [selectedReviews, setSelectedReviews] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Review stats
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    average: 0
  })

  // Helper function to get product image URL
  const getProductImageUrl = (product) => {
    if (!product) return "https://via.placeholder.com/48?text=No+Img";

    try {
      if (product.image_url) return product.image_url;
      if (product.image) {
        if (product.image.startsWith('http')) return product.image;
        return `http://localhost:8000/storage/products/${product.image}`;
      }
    } catch (error) {
      console.error('Error getting image URL:', error);
    }
    return "https://via.placeholder.com/48?text=No+Img";
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
    fetchReviewStats()
  }, [])

  // Fetch reviews when filters change
  useEffect(() => {
    fetchAllReviews()
  }, [currentPage, selectedRating, selectedStatus, sortBy, selectedProduct, debouncedSearchTerm])

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedReviews(reviews.map(review => review.id))
    } else {
      setSelectedReviews([])
    }
  }, [selectAll, reviews])

  // Fetch all products for filter
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await getProducts(token)
      const productsData = response?.data || response || []
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    }
  }

  // Fetch review statistics
  const fetchReviewStats = async () => {
    try {
      const response = await reviewApi.getReviewStats()
      if (response?.success && response?.data) {
        setReviewStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching review stats:', error)
    }
  }

  // Fetch all reviews with filters
  const fetchAllReviews = async () => {
    setLoading(true)

    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        sort: sortBy,
        product_id: selectedProduct !== 'all' ? selectedProduct : null,
        search: debouncedSearchTerm || undefined
      }

      if (selectedRating) {
        params.rating = selectedRating
      }

      if (selectedStatus !== 'all') {
        params.status = selectedStatus
      }

      console.log('Fetching with params:', params)
      const response = await reviewApi.getAllReviews(params)
      console.log('API Response:', response)

      if (response?.success && response?.data) {
        const { data } = response

        if (data.reviews && data.reviews.data) {
          setReviews(data.reviews.data)
          setLastPage(data.reviews.last_page || 1)
          setTotal(data.reviews.total || 0)
        } else if (Array.isArray(data)) {
          setReviews(data)
          setLastPage(1)
          setTotal(data.length)
        } else {
          setReviews([])
        }
      } else {
        setReviews([])
        setTotal(0)
        setLastPage(1)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews: ' + (error.response?.data?.message || error.message))
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchAllReviews()
    fetchReviewStats()
    toast.success('Reviews refreshed successfully!')
  }

  // Handle status update for single review
  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      if (newStatus === 'deleted') {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: `You are about to delete this review.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!'
        })

        if (!result.isConfirmed) return
      }

      Swal.fire({
        title: 'Processing...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      if (newStatus === 'deleted') {
        await reviewApi.adminDeleteReview(reviewId)
        Swal.close()
        toast.success('Review deleted successfully!')
      } else {
        await reviewApi.updateReviewStatus(reviewId, newStatus)
        Swal.close()
        toast.success(`Review ${newStatus} successfully!`)
      }

      fetchAllReviews()
      fetchReviewStats()

    } catch (error) {
      Swal.close()
      console.error('Error updating review:', error)

      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        toast.error('Failed to update review: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (selectedReviews.length === 0) {
      toast.warning('Please select at least one review');
      return
    }

    const actionText = action === 'delete' ? 'delete' : action === 'approve' ? 'approve' : 'reject'

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${actionText} ${selectedReviews.length} selected review(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'delete' ? '#d33' : '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${actionText} them!`
    })

    if (!result.isConfirmed) return

    Swal.fire({
      title: 'Processing...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    try {
      console.log(`Bulk ${action} for IDs:`, selectedReviews);

      if (action === 'delete') {
        const response = await reviewApi.bulkDeleteReviews(selectedReviews)
        console.log('Bulk delete response:', response);
        Swal.close()
        toast.success(`${selectedReviews.length} reviews deleted successfully!`)
      } else {
        const response = await reviewApi.bulkUpdateStatus(selectedReviews, action)
        console.log('Bulk update response:', response);
        Swal.close()
        toast.success(`${selectedReviews.length} reviews ${action}d successfully!`)
      }

      setSelectedReviews([])
      setSelectAll(false)
      fetchAllReviews()
      fetchReviewStats()

    } catch (error) {
      Swal.close()
      console.error('Error in bulk action:', error)

      const errorMessage = error.response?.data?.message || error.message
      toast.error(`Failed to perform bulk action: ${errorMessage}`)

      if (error.response) {
        console.error('Error response data:', error.response.data)
        console.error('Error response status:', error.response.status)
      }
    }
  }

  // Handle view product
  const viewReviewDetails = (reviewId) => {
    console.log('Viewing review ID:', reviewId);
    navigate(`/admin/product_review/${reviewId}`); // ✅ Correct path
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge color
  const getStatusBadge = (isApproved) => {
    if (isApproved === true) {
      return 'bg-green-100 text-green-700'
    } else {
      return 'bg-yellow-100 text-yellow-700'
    }
  }

  // Render stars
  const renderStars = (rating, size = 'small') => {
    const stars = []
    const sizeClasses = {
      small: 'w-3 h-3',
      default: 'w-4 h-4',
      large: 'w-5 h-5'
    }
    const starSize = sizeClasses[size] || sizeClasses.default

    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <Star
            key={i}
            className={`${starSize} text-yellow-400 fill-current`}
          />
        ) : (
          <Star
            key={i}
            className={`${starSize} text-gray-300`}
          />
        )
      )
    }
    return stars
  }

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    const tableElement = document.getElementById('reviews-table')
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedRating(null)
    setSelectedStatus('all')
    setSelectedProduct('all')
    setSortBy('latest')
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Get current page items for grid view
  const getCurrentPageItems = () => {
    if (!reviews || reviews.length === 0) return []
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return reviews.slice(indexOfFirstItem, indexOfLastItem)
  }

  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Product Reviews Management</h1>
              <p className="text-sm text-gray-500">Manage and moderate all product reviews</p>
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
          {/* Total Reviews */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-2xl font-bold">{reviewStats.total}</p>
            <p className="text-sm text-blue-100 mt-1">All Reviews</p>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-yellow-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-2xl font-bold">{reviewStats.pending}</p>
            <p className="text-sm text-yellow-100 mt-1">Awaiting Review</p>
          </div>

          {/* Approved */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Approved</span>
            </div>
            <p className="text-2xl font-bold">{reviewStats.approved}</p>
            <p className="text-sm text-green-100 mt-1">Published</p>
          </div>

          {/* Average Rating */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-purple-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Avg</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{reviewStats.average}</p>
              <div className="flex items-center">
                {renderStars(Math.round(reviewStats.average), 'small')}
              </div>
            </div>
            <p className="text-sm text-purple-100 mt-1">Overall Rating</p>
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
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Product Filter */}
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>

              {/* Rating Filter */}
              <select
                value={selectedRating || ''}
                onChange={(e) => {
                  setSelectedRating(e.target.value ? parseInt(e.target.value) : null)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Ratings</option>
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>{rating} Stars</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="latest">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
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

            {/* Clear Filters */}
            {(selectedRating || selectedStatus !== 'all' || selectedProduct !== 'all' || searchTerm) && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}

            {/* Search Results */}
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-500">
                Found {total} result{total !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Display */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading reviews...</div>
            </div>
          </div>
        ) : reviews.length > 0 ? (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div id="reviews-table" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reviews.map((review) => (
                        <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={getProductImageUrl(review.product)}
                                alt={review.product?.name || 'Product'}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/40?text=No+Img";
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-800">{review.product?.name || 'Unknown Product'}</p>
                                <p className="text-xs text-gray-500">ID: #{review.product?.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{review.user?.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">{review.user?.email || 'No email'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {review.comment || 'No comment'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="text-xs text-gray-500 ml-1">
                                ({review.rating})
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.is_approved)}`}>
                              {review.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(review.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {!review.is_approved && (
                                <button
                                  onClick={() => handleStatusUpdate(review.id, 'approved')}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              {review.is_approved && (
                                <button
                                  onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              )}
                              {/* <button
                                onClick={() => viewProduct(review.product?.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Product"
                              >
                                <Eye className="w-5 h-5" />
                              </button> */}
                              <button
                                onClick={() => viewReviewDetails(review.id)} // ✅ Pass review.id, not product.id
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Review Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(review.id, 'deleted')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
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
              <div id="reviews-table" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentPageItems().map((review) => (
                  <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                    {/* Product Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImageUrl(review.product)}
                          alt={review.product?.name || 'Product'}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/48?text=No+Img";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{review.product?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-gray-500">ID: #{review.product?.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="p-4">
                      {/* User Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-800">{review.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{review.user?.email || 'No email'}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.is_approved)}`}>
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({review.rating})
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {review.comment || 'No comment'}
                      </p>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100">
                        {!review.is_approved && (
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => viewReviewDetails(review.id)} // ✅ Pass review.id
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Review Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(review.id, 'deleted')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={total}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Reviews Found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedRating || selectedStatus !== 'all' || selectedProduct !== 'all'
                ? 'No reviews match your filters. Try adjusting your search criteria.'
                : 'There are no reviews in the system yet.'}
            </p>
            {(searchTerm || selectedRating || selectedStatus !== 'all' || selectedProduct !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAllReviews