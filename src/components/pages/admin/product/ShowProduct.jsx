import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../admin/AdminLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Tag,
  Layers,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Image as ImageIcon,
  Eye,
  Star,
  Clock,
  BarChart,
  ShoppingBag
} from 'lucide-react';
import { getProduct, deleteProduct } from '../../../API/api-products';
import Swal from 'sweetalert2';

const ShowProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch product data
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await getProduct(token, id);
      console.log('Product data:', response);
      
      let productData = response.data || response;
      setProduct(productData);
      
      // Set main image as selected
      if (productData.image_url) {
        setSelectedImage(productData.image_url);
      } else if (productData.image) {
        setSelectedImage(getImageUrl(productData));
      }
      
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to load product');
      
      Swal.fire({
        icon: 'error',
        title: 'Loading Failed',
        text: error.response?.data?.message || 'Failed to load product data',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-center">
          <p class="mb-3">You are about to delete product:</p>
          <p class="font-bold text-lg text-red-600">"${product?.name}"</p>
          <p class="mt-3 text-sm text-gray-500">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#f8f9fa',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading
          Swal.fire({
            title: 'Deleting...',
            html: 'Please wait while we delete the product',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
            background: '#f8f9fa'
          });

          const token = localStorage.getItem('token');
          await deleteProduct(token, id);
          
          // Close loading
          Swal.close();
          
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            html: `
              <div class="text-center">
                <p>Product <strong>"${product.name}"</strong> has been deleted.</p>
              </div>
            `,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#f8f9fa'
          });
          
          // Navigate back to products list
          navigate('/admin/products');
          
        } catch (error) {
          console.error("Delete error:", error.response?.data || error.message);
          
          // Close loading
          Swal.close();
          
          // Show error message
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: error.response?.data?.message || 'Could not delete product. Please try again.',
            confirmButtonColor: '#d33',
            background: '#f8f9fa'
          });
        }
      }
    });
  };

  // Image URL helper
  const getImageUrl = (product) => {
    if (!product || !product.image) {
      return "https://via.placeholder.com/600x400?text=No+Image";
    }
    
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    return `http://localhost:8000/storage/products/${product.image}`;
  };

  // Get additional images
  const getAdditionalImages = () => {
    if (!product) return [];
    
    if (product.product_images_urls && Array.isArray(product.product_images_urls)) {
      return product.product_images_urls;
    }
    
    if (product.product_images && Array.isArray(product.product_images)) {
      return product.product_images.map(img => 
        `http://localhost:8000/storage/products/additional/${img}`
      );
    }
    
    return [];
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (!product?.original_price || !product?.selling_price) return null;
    const discount = ((product.original_price - product.selling_price) / product.original_price) * 100;
    return Math.round(discount);
  };

  const additionalImages = getAdditionalImages();

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto pt-5 px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product details...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !product) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto pt-5 px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-center">Product Details</h1>
            <p className="text-xs text-blue-100 text-center">ID: #{product.id}</p>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-5 px-4 lg:px-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/products"
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
              title="Back to products"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Product Details</h1>
              <p className="text-sm text-gray-500">Viewing product #{product.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/admin/products/edit/${product.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Product
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <h2 className="font-semibold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Product Image
                </h2>
              </div>
              <div className="p-4">
                <div className="relative group">
                  <img
                    src={selectedImage || getImageUrl(product)}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/600x400?text=No+Image";
                    }}
                  />
                  <a
                    href={selectedImage || getImageUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View full image"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {additionalImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Additional Images ({additionalImages.length})
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {additionalImages.map((img, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                          selectedImage === img ? 'border-blue-600' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-20 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150?text=No+Image";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <h2 className="font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Basic Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Product ID</label>
                    <p className="text-lg font-semibold text-gray-800">#{product.id}</p>
                  </div>
                  {/* <div>
                    <label className="text-sm text-gray-500 block mb-1">SKU</label>
                    <p className="text-lg font-semibold text-gray-800">{product.sku || 'N/A'}</p>
                  </div> */}
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 block mb-1">Product Name</label>
                    <p className="text-lg font-semibold text-gray-800">{product.name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 block mb-1">Slug</label>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded-lg font-mono text-sm">
                      {product.slug}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Category</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {product.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
                <h2 className="font-semibold flex items-center gap-2">
                   <span className="text-lg">₹</span>
                  Pricing & Inventory
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="text-sm text-blue-600 block mb-1">Original Price</label>
                    <p className="text-xl font-bold text-gray-800">
                      {formatPrice(product.original_price)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="text-sm text-green-600 block mb-1">Selling Price</label>
                    <p className="text-xl font-bold text-gray-800">
                      {formatPrice(product.selling_price)}
                    </p>
                    {getDiscountPercentage() && (
                      <span className="text-xs text-green-600 font-semibold">
                        {getDiscountPercentage()}% OFF
                      </span>
                    )}
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <label className="text-sm text-purple-600 block mb-1">Quantity</label>
                    <p className={`text-xl font-bold ${
                      product.qty > 10 ? 'text-gray-800' : 'text-orange-600'
                    }`}>
                      {product.qty} units
                    </p>
                  </div>
                  {product.tax && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm text-gray-600 block mb-1">Tax</label>
                      <p className="text-xl font-bold text-gray-800">{product.tax}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white">
                <h2 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Status Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      product.status ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {product.status ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">Status</label>
                      <span className={`font-semibold ${
                        product.status ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      product.trending ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <TrendingUp className={`w-5 h-5 ${
                        product.trending ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">Trending</label>
                      <span className={`font-semibold ${
                        product.trending ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {product.trending ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-full bg-blue-100">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">Stock Status</label>
                      <span className={`font-semibold ${
                        product.qty > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.qty > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <h2 className="font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Description
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Short Description</label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {product.small_description || 'No short description available'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">Full Description</label>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {product.description || 'No description available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Information */}
            {(product.meta_title || product.meta_keywords || product.meta_description) && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                  <h2 className="font-semibold flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    SEO Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {product.meta_title && (
                      <div>
                        <label className="text-sm text-gray-500 block mb-1">Meta Title</label>
                        <p className="text-gray-800 font-medium">{product.meta_title}</p>
                      </div>
                    )}
                    {product.meta_keywords && (
                      <div>
                        <label className="text-sm text-gray-500 block mb-1">Meta Keywords</label>
                        <div className="flex flex-wrap gap-2">
                          {product.meta_keywords.split(',').map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {product.meta_description && (
                      <div>
                        <label className="text-sm text-gray-500 block mb-1">Meta Description</label>
                        <p className="text-gray-600 text-sm">{product.meta_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <label className="text-sm text-gray-500 block">Created At</label>
                      <p className="text-gray-800 font-medium">{formatDate(product.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <label className="text-sm text-gray-500 block">Updated At</label>
                      <p className="text-gray-800 font-medium">{formatDate(product.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="lg:hidden flex gap-3 pt-4">
              <Link
                to={`/admin/products/edit/${product.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ShowProduct;