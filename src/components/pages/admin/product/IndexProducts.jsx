import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Filter,
  ChevronDown,
  MoreVertical,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../../API/api-products';
import Swal from 'sweetalert2';
import Pagination from "../../../Common/Pagination";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get unique categories for filter
  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

  // Helper function for case-insensitive search
  const matchesSearch = (text, searchLower) => {
    if (!text) return false;
    return text.toString().toLowerCase().includes(searchLower);
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }

      const response = await getProducts(token);
      
      if (response && response.data) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else if (Array.isArray(response)) {
        setProducts(response);
        setFilteredProducts(response);
      }
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load',
        text: 'Could not load products. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
      
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let result = [...products];

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter(product => {
        return (
          matchesSearch(product.name, searchLower) ||
          matchesSearch(product.category?.name, searchLower) ||
          matchesSearch(product.id?.toString(), searchLower) ||
          matchesSearch(product.description, searchLower) ||
          matchesSearch(product.selling_price?.toString(), searchLower)
        );
      });
    }

    // Apply stock filter
    if (stockFilter !== 'all') {
      result = result.filter(product => {
        const stock = product.qty || product.stock || 0;
        return stockFilter === 'in-stock' ? stock > 0 : stock === 0;
      });
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => 
        product.category?.name === categoryFilter
      );
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, stockFilter, categoryFilter]);

  // Get current page items
  const getCurrentPageItems = () => {
    if (!filteredProducts || filteredProducts.length === 0) return [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const tableElement = document.getElementById('products-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchProducts();
    Swal.fire({
      icon: 'success',
      title: 'Refreshed',
      text: 'Product list has been updated',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Delete handler
  const handleDelete = (id, productName) => {
    Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-center">
          <p class="mb-3">You are about to delete product:</p>
          <p class="font-bold text-lg text-red-600">"${productName}"</p>
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
          await deleteProduct(token, id);
          
          Swal.close();
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            html: `<p>Product <strong>"${productName}"</strong> has been deleted.</p>`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          
          fetchProducts();
          
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

  // Get image URL
  const getImageUrl = (product) => {
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

  // Format price
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get stock count
  const getStockCount = (product) => {
    return product.qty || product.stock || 0;
  };

  // Get status badge
  const getStatusBadge = (product) => {
    const stock = getStockCount(product);
    if (stock > 0) {
      return {
        text: 'In Stock',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle
      };
    } else {
      return {
        text: 'Out of Stock',
        color: 'bg-red-100 text-red-700',
        icon: XCircle
      };
    }
  };

  // Stats
  const totalCount = products?.length || 0;
  const inStockCount = products?.filter(p => getStockCount(p) > 0).length || 0;
  const outOfStockCount = products?.filter(p => getStockCount(p) === 0).length || 0;
  const trendingCount = products?.filter(p => p.trending === 1 || p.trending === true).length || 0;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Products</h1>
              <p className="text-sm text-gray-500">Manage your products inventory</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                to="/admin/products/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {/* Total Products */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-sm text-blue-100 mt-1">All Products</p>
          </div>

          {/* In Stock */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-2xl font-bold">{inStockCount}</p>
            <p className="text-sm text-green-100 mt-1">In Stock</p>
          </div>

          {/* Out of Stock */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Inactive</span>
            </div>
            <p className="text-2xl font-bold">{outOfStockCount}</p>
            <p className="text-sm text-red-100 mt-1">Out of Stock</p>
          </div>

          {/* Trending */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-yellow-200" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Popular</span>
            </div>
            <p className="text-2xl font-bold">{trendingCount}</p>
            <p className="text-sm text-yellow-100 mt-1">Trending</p>
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
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

            {/* Search Results */}
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-500">
                Found {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div id="products-table" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getCurrentPageItems().map((product) => {
                        const status = getStatusBadge(product);
                        const StatusIcon = status.icon;
                        return (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getImageUrl(product)}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/40?text=Img";
                                  }}
                                />
                                <div>
                                  <p className="font-medium text-gray-800">{product.name}</p>
                                  <p className="text-xs text-gray-500">ID: #{product.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                {product.category?.name || 'Uncategorized'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-semibold text-gray-800">{formatPrice(product.selling_price)}</p>
                                {product.original_price > 0 && (
                                  <p className="text-xs text-gray-400 line-through">{formatPrice(product.original_price)}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`font-medium ${
                                getStockCount(product) > 10 ? 'text-gray-600' :
                                getStockCount(product) > 0 ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                {getStockCount(product)} units
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.text}
                                </span>
                                {product.trending && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                                    <TrendingUp className="w-3 h-3" />
                                    Trending
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/admin/products/${product.id}`}
                                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </Link>
                                <Link
                                  to={`/admin/products/edit/${product.id}`}
                                  className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div id="products-table" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getCurrentPageItems().map((product) => {
                  const status = getStatusBadge(product);
                  const StatusIcon = status.icon;
                  return (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/200?text=No+Img";
                          }}
                        />
                        {product.trending && (
                          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                            <p className="text-xs text-gray-500">ID: #{product.id}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <p className="text-lg font-bold text-gray-800">{formatPrice(product.selling_price)}</p>
                            {product.original_price > 0 && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(product.original_price)}</p>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {getStockCount(product)} left
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Link>
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredProducts.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;