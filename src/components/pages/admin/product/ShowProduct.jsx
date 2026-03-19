import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../admin/AdminLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Image as ImageIcon,
  Eye,
  Clock,
  BarChart,
  ShoppingBag,
  Ruler,
  Percent,
  Layers
} from 'lucide-react';
import { getProduct, deleteProduct } from '../../../API/api-products';
import sizeApi from '../../../API/api-Product_sizes';
import Swal from 'sweetalert2';

const ShowProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingSizes, setLoadingSizes] = useState(false);

  useEffect(() => {
    if (id) {
      const cleanId = extractNumericId(id);
      if (cleanId) {
        fetchProduct(cleanId);
      } else {
        setError('Invalid product ID format');
        setLoading(false);
      }
    }
  }, [id]);

  const extractNumericId = (idString) => {
    if (!idString) return null;
    
    const strId = String(idString);
    
    if (strId.includes('%7C')) {
      const parts = strId.split('%7C');
      const possibleId = parts[0];
      if (/^\d+$/.test(possibleId)) {
        return parseInt(possibleId, 10);
      }
    }
    
    const match = strId.match(/^(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    if (/^\d+$/.test(strId)) {
      return parseInt(strId, 10);
    }
    
    return null;
  };

// ShowProduct.jsx - Updated fetchProduct function

const fetchProduct = async (productId) => {
  try {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    // FIXED: Pass ID first, then token
    const response = await getProduct(productId, token);
    
    // Handle different response structures
    let productData;
    if (response && response.data) {
      productData = response.data;
    } else if (response && response.status === false) {
      throw new Error(response.message || 'Product not found');
    } else {
      productData = response;
    }
    
    if (!productData || !productData.id) {
      throw new Error('Product not found');
    }

    setProduct(productData);
    
    if (productData.image_url) {
      setSelectedImage(productData.image_url);
    } else if (productData.image) {
      setSelectedImage(getImageUrl(productData));
    }

    // Fetch sizes for this product
    await fetchProductSizes(productId);
    
    setError(null);
  } catch (error) {
    console.error("Fetch error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load product';
    setError(errorMessage);
    
    Swal.fire({
      icon: 'error',
      title: 'Loading Failed',
      text: errorMessage,
      confirmButtonColor: '#d33',
    });
  } finally {
    setLoading(false);
  }
};

const fetchProductSizes = async (productId) => {
  try {
    setLoadingSizes(true);
    const token = localStorage.getItem('token');
    
    // Try to get sizes from product data first
    if (product?.sizes && product.sizes.length > 0) {
      setSizes(product.sizes);
    } else {
      // Fetch sizes from API - make sure to pass ID correctly
      const sizesResponse = await sizeApi.getProductSizes(productId);
      
      // Handle different response structures
      let sizesData;
      if (sizesResponse && sizesResponse.data) {
        sizesData = sizesResponse.data;
      } else {
        sizesData = sizesResponse;
      }
      
      if (Array.isArray(sizesData)) {
        setSizes(sizesData);
      } else if (sizesData && Array.isArray(sizesData.sizes)) {
        setSizes(sizesData.sizes);
      }
    }
  } catch (error) {
    console.error('Error fetching sizes:', error);
    // Don't show error to user, just log it
  } finally {
    setLoadingSizes(false);
  }
};

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
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Deleting...',
            html: 'Please wait while we delete the product',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const token = localStorage.getItem('token');
          const cleanId = extractNumericId(id);
          
          if (!cleanId) {
            throw new Error('Invalid product ID');
          }
          
          await deleteProduct(token, cleanId);
          
          Swal.close();
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            html: `<p>Product <strong>"${product.name}"</strong> has been deleted.</p>`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          
          navigate('/admin/products');
          
        } catch (error) {
          console.error("Delete error:", error.response?.data || error.message);
          Swal.close();
          
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: error.response?.data?.message || 'Could not delete product. Please try again.',
            confirmButtonColor: '#d33'
          });
        }
      }
    });
  };

  const handleDeleteSize = (sizeId, sizeName) => {
    Swal.fire({
      title: 'Delete Size?',
      text: `Are you sure you want to delete size "${sizeName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await sizeApi.deleteSize(sizeId, token);
          
          // Remove size from state
          setSizes(sizes.filter(s => s.id !== sizeId));
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Size has been deleted.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to delete size'
          });
        }
      }
    });
  };

  const getImageUrl = (product) => {
    if (!product || !product.image) {
      return "https://via.placeholder.com/600x400?text=No+Image";
    }
    
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    return `http://localhost:8000/storage/products/${product.image}`;
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

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

  const getDiscountPercentage = () => {
    if (!product?.original_price || !product?.selling_price) return null;
    const discount = ((product.original_price - product.selling_price) / product.original_price) * 100;
    return Math.round(discount);
  };

  const additionalImages = getAdditionalImages();

  // Size Management Component
  const SizeSection = () => {
    if (loadingSizes) {
      return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <h2 className="font-semibold flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Product Sizes
            </h2>
          </div>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading sizes...</p>
          </div>
        </div>
      );
    }

    if (!sizes || sizes.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <h2 className="font-semibold flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Product Sizes
            </h2>
          </div>
          <div className="p-8 text-center">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No sizes configured for this product</p>
            <Link
              to={`/admin/products/edit/${product.id}`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              Add Sizes
            </Link>
          </div>
        </div>
      );
    }

    // Calculate statistics
    const totalStock = sizes.reduce((sum, size) => sum + (size.stock || size.qty || 0), 0);
    const inStockCount = sizes.filter(s => (s.stock || s.qty || 0) > 0).length;
    const outOfStockCount = sizes.filter(s => (s.stock || s.qty || 0) === 0).length;
    
    // Check if sizes have variable pricing
    const hasVariablePricing = new Set(sizes.map(s => s.selling_price || s.price || product.selling_price)).size > 1;
    
    // Get price range
    const prices = sizes.map(s => s.selling_price || s.price || product.selling_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Product Sizes ({sizes.length})
            </h2>
            <Link
              to={`/admin/products/edit/${product.id}`}
              className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              Manage
            </Link>
          </div>
        </div>

        {/* Size Statistics */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{sizes.length}</p>
            <p className="text-xs text-gray-500">Total Sizes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{totalStock}</p>
            <p className="text-xs text-gray-500">Total Stock</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{inStockCount}</p>
            <p className="text-xs text-gray-500">In Stock</p>
          </div>
        </div>

        {/* Price Range if variable */}
        {hasVariablePricing && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Price Range:</span> {formatPrice(minPrice)} - {formatPrice(maxPrice)}
            </p>
          </div>
        )}

        {/* Sizes Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sizes.map((size) => {
                const stock = size.stock || size.qty || 0;
                const price = size.selling_price || size.price || product.selling_price;
                const originalPrice = size.original_price || product.original_price;
                const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                
                return (
                  <tr key={size.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Ruler className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{size.size || size.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-900">{formatPrice(price)}</span>
                        {originalPrice > price && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                            <span className="text-xs text-green-600 font-medium">-{discount}%</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${stock > 10 ? 'text-gray-900' : stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {stock > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          <XCircle className="w-3 h-3 mr-1" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteSize(size.id, size.size || size.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete size"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Out of Stock Summary */}
        {outOfStockCount > 0 && (
          <div className="p-4 bg-yellow-50 border-t border-yellow-100">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {outOfStockCount} size{outOfStockCount > 1 ? 's are' : ' is'} out of stock
            </p>
          </div>
        )}
      </div>
    );
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-4">
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

            {additionalImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5" />
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
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Category</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {product.category?.name || 'Uncategorized'}
                    </p>
                  </div>
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
                    <label className="text-sm text-purple-600 block mb-1">Base Quantity</label>
                    <p className={`text-xl font-bold ${
                      product.qty > 10 ? 'text-gray-800' : 'text-orange-600'
                    }`}>
                      {product.qty} units
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes Section */}
            <SizeSection />

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
                    <div className={`p-2 rounded-full ${product.status ? 'bg-green-100' : 'bg-red-100'}`}>
                      {product.status ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">Status</label>
                      <span className={`font-semibold ${product.status ? 'text-green-600' : 'text-red-600'}`}>
                        {product.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${product.trending ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                      <TrendingUp className={`w-5 h-5 ${product.trending ? 'text-yellow-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">Trending</label>
                      <span className={`font-semibold ${product.trending ? 'text-yellow-600' : 'text-gray-500'}`}>
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
                      <span className={`font-semibold ${product.qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                  <Package className="w-5 h-5" />
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