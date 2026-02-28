// src/components/pages/admin/Product_Review/SingleReview.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MessageSquare,
  ShoppingBag,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react'
import reviewApi from '../../../API/api-review'
import { getProduct } from '../../../API/api-products'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

const API_URL = 'http://localhost:8000';

function SingleReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [review, setReview] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Image gallery states
  const [productImages, setProductImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchReviewDetails()
    } else {
      setError('No review ID provided')
      setLoading(false)
    }
  }, [id])

  // Helper function to get all product images
  const getAllProductImages = (product) => {
    if (!product) return [];
    
    const images = [];
    
    // Add main product image
    const mainImage = getMainProductImage(product);
    if (mainImage) images.push(mainImage);
    
    // Add additional images
    const additionalImages = getAdditionalImages(product);
    if (additionalImages.length > 0) {
      // Filter out duplicates
      const uniqueAdditional = additionalImages.filter(img => 
        !images.includes(img) && img !== mainImage
      );
      images.push(...uniqueAdditional);
    }
    
    // If no images, add placeholder
    if (images.length === 0) {
      images.push(`https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name || 'Product')}`);
    }
    
    return images;
  };

  // Get main product image
  const getMainProductImage = (product) => {
    if (!product) return null;
    
    try {
      // Check for image_url first
      if (product.image_url) {
        if (product.image_url.startsWith('http')) {
          return product.image_url;
        }
        return `${API_URL}/storage/${product.image_url}`;
      }
      
      // Check for image field
      if (product.image) {
        if (product.image.startsWith('http')) {
          return product.image;
        }
        if (product.image.startsWith('products/')) {
          return `${API_URL}/storage/${product.image}`;
        }
        return `${API_URL}/storage/products/${product.image}`;
      }
    } catch (error) {
      console.error('Error getting main image:', error);
    }
    
    return null;
  };

  // Get additional images
  const getAdditionalImages = (product) => {
    if (!product) return [];
    
    const images = [];
    
    try {
      // Check for product_images_urls (array of full URLs)
      if (product.product_images_urls && Array.isArray(product.product_images_urls)) {
        return product.product_images_urls;
      }
      
      // Check for product_images (array of filenames)
      if (product.product_images && Array.isArray(product.product_images)) {
        product.product_images.forEach(img => {
          if (img.startsWith('http')) {
            images.push(img);
          } else if (img.startsWith('products/')) {
            images.push(`${API_URL}/storage/${img}`);
          } else {
            images.push(`${API_URL}/storage/products/additional/${img}`);
          }
        });
        return images;
      }
      
      // Check for images array
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          if (img.startsWith('http')) {
            images.push(img);
          } else {
            images.push(`${API_URL}/storage/products/${img}`);
          }
        });
        return images;
      }
    } catch (error) {
      console.error('Error getting additional images:', error);
    }
    
    return images;
  };

  // Get product image URL (fallback)
  const getProductImageUrl = (product) => {
    if (!product) return "https://via.placeholder.com/600x400?text=No+Image";
    
    try {
      // Try image_url first
      if (product.image_url) {
        if (product.image_url.startsWith('http')) return product.image_url;
        return `${API_URL}/storage/${product.image_url}`;
      }
      
      // Try image field
      if (product.image) {
        if (product.image.startsWith('http')) return product.image;
        if (product.image.startsWith('products/')) {
          return `${API_URL}/storage/${product.image}`;
        }
        return `${API_URL}/storage/products/${product.image}`;
      }
      
      // Try to get first additional image
      const additionalImages = getAdditionalImages(product);
      if (additionalImages.length > 0) {
        return additionalImages[0];
      }
    } catch (error) {
      console.error('Error getting image URL:', error);
    }
    
    return `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name || 'Product')}`;
  };

  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
    setImageLoading(true);
  };

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
    setImageLoading(true);
  };

  const fetchReviewDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching review with ID:', id)
      const response = await reviewApi.getReviewById(id)
      console.log('Review API response:', response)
      
      if (response?.success && response?.data) {
        setReview(response.data)
        
        if (response.data.product) {
          setProduct(response.data.product)
          // Get all product images
          const images = getAllProductImages(response.data.product);
          setProductImages(images);
        } else if (response.data.product_id) {
          await fetchProductDetails(response.data.product_id)
        }
      } else {
        setError('Review not found')
      }
    } catch (error) {
      console.error('Error fetching review:', error)
      setError(error.response?.data?.message || 'Failed to load review details')
      toast.error('Failed to load review details')
    } finally {
      setLoading(false)
    }
  }

  const fetchProductDetails = async (productId) => {
    try {
      console.log('Fetching product with ID:', productId)
      const token = localStorage.getItem('token')
      const response = await getProduct(token, productId)
      console.log('Product API response:', response)
      
      if (response?.data) {
        setProduct(response.data)
        // Get all product images
        const images = getAllProductImages(response.data);
        setProductImages(images);
      } else if (response?.product) {
        setProduct(response.product)
        // Get all product images
        const images = getAllProductImages(response.product);
        setProductImages(images);
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product details')
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (actionLoading) return
    
    try {
      const confirmMessage = newStatus === 'approved' 
        ? 'Approve this review? It will be published publicly.'
        : 'Reject this review? It will not be published.'
      
      const confirmColor = newStatus === 'approved' ? '#10b981' : '#f59e0b'

      const result = await Swal.fire({
        title: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Review?`,
        text: confirmMessage,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#3085d6',
        confirmButtonText: `Yes, ${newStatus} it!`
      })
      
      if (!result.isConfirmed) return

      setActionLoading(true)
      
      Swal.fire({
        title: 'Processing...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      await reviewApi.updateReviewStatus(id, newStatus)
      Swal.close()
      toast.success(`Review ${newStatus} successfully!`)
      await fetchReviewDetails()
      
    } catch (error) {
      Swal.close()
      console.error('Error updating review:', error)
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        toast.error(error.response?.data?.message || 'Failed to update review')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteReview = async () => {
    if (actionLoading) return
    
    try {
      const result = await Swal.fire({
        title: 'Delete Review?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      })
      
      if (!result.isConfirmed) return
      
      setActionLoading(true)
      
      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
      
      await reviewApi.adminDeleteReview(id)
      Swal.close()
      toast.success('Review deleted successfully!')
      navigate('/admin/Product_Review')
      
    } catch (error) {
      Swal.close()
      console.error('Error deleting review:', error)
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete review')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const getStatusBadge = () => {
    if (!review) return null
    
    return review.is_approved 
      ? {
          bg: 'bg-green-100',
          text: 'text-green-700',
          label: 'Approved',
          icon: <CheckCircle className="w-4 h-4 mr-1" />
        }
      : {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          label: 'Pending',
          icon: <Clock className="w-4 h-4 mr-1" />
        }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading review details...</div>
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Review Not Found</h3>
          <p className="text-gray-500 mb-4">{error || "The review you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/admin/Product_Review')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reviews
          </button>
        </div>
      </div>
    )
  }

  const status = getStatusBadge()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/Product_Review')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Reviews"
              disabled={actionLoading}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Review Details</h1>
              <p className="text-sm text-gray-500">View and manage review #{review.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Current Status:</span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                {status.icon}
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!review.is_approved && (
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Review
                </button>
              )}
              {review.is_approved && (
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Review
                </button>
              )}
              <button
                onClick={handleDeleteReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete Review
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Review Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Review Content
              </h2>
              
              <div className="mb-4">
                <label className="text-sm text-gray-500 block mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {review.rating} / 5
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-500 block mb-2">Review Comment</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {review.comment || 'No comment provided.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Created At</label>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(review.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Last Updated</label>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(review.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                Reviewer Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-800 font-medium">{review.user?.name || 'Anonymous'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{review.user?.email || 'No email provided'}</p>
                  </div>
                </div>

                {review.user?.phone && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800">{review.user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Information */}
          <div className="space-y-6">
            {product ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-500" />
                  Product Information
                </h2>
                
                {/* Image Gallery */}
                {productImages.length > 0 ? (
                  <div className="mb-4">
                    {/* Main Image */}
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-2">
                      <div className="relative h-[300px] flex items-center justify-center">
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        <img
                          src={productImages[currentImageIndex]}
                          alt={`${product.name} - Image ${currentImageIndex + 1}`}
                          className={`max-w-full max-h-full object-contain p-2 transition-opacity duration-300 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                          onLoad={() => setImageLoading(false)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}`;
                            setImageLoading(false);
                          }}
                        />
                      </div>
                      
                      {/* Navigation Arrows - Only show if more than one image */}
                      {productImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      {productImages.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                          {currentImageIndex + 1} / {productImages.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {productImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {productImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setImageLoading(true);
                            }}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index
                                ? 'border-blue-600 ring-2 ring-blue-300'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/64x64?text=${index + 1}`;
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 bg-gray-100 rounded-lg p-8 text-center border border-gray-200">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No product images available</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Product Name</p>
                    <p className="font-medium text-gray-800">{product.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{product.selling_price || product.price || 0}
                    </p>
                  </div>

                  {product.category && (
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="text-gray-700">
                        {typeof product.category === 'object' 
                          ? product.category.name 
                          : product.category}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/admin/products/${product.id}`)}
                    disabled={actionLoading}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Product Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Product information not available</p>
              </div>
            )}

            {review.order_id && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Order Information
                </h2>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-gray-800 font-medium">#{review.order_id}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/admin/orders/${review.order_id}`)}
                  disabled={actionLoading}
                  className="w-full mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  View Order Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleReview