import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Star,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Clock
} from "lucide-react";
import { getCategory, deleteCategory } from "../../../API/api-categories";

const ShowCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch single category - FIXED: Don't pass token as separate parameter
  const fetchCategory = async () => {
    try {
      setLoading(true);
      
      // Just pass the ID - token is handled by axios interceptor
      const response = await getCategory(id);
      
      console.log('Category Response:', response); // Debug log
      
      if (response && response.data) {
        setCategory(response.data);
      } else if (response) {
        setCategory(response);
      } else {
        setError('Category not found');
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  // Handle delete - FIXED: Don't pass token as separate parameter
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      setDeleteLoading(true);
      await deleteCategory(id);
      alert('Category deleted successfully');
      navigate('/admin/categories');
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      alert("Delete failed: " + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Image URL helper
  const getImageUrl = (category) => {
    if (!category || !category.image) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }
    
    if (category.image.startsWith('http')) {
      return category.image;
    }
    
    let imagePath = category.image.replace(/^public\//, '').replace(/^storage\//, '');
    
    if (!imagePath.includes('/')) {
      return `http://localhost:8000/storage/categories/${imagePath}`;
    }
    
    return `http://localhost:8000/storage/${imagePath}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Category not found'}</p>
          <Link
            to="/admin/categories"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/categories"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Category Details</h1>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            to={`/admin/categories/edit/${category.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4" />
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Image Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-4 bg-gray-50 border-b">
              <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <ImageIcon className="w-4 h-4" />
                Image
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <img
                src={getImageUrl(category)}
                alt={category.name}
                className="w-full h-48 sm:h-56 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-4 bg-gray-50 border-b">
              <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Tag className="w-4 h-4" />
                Basic Information
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500 block mb-1">ID</label>
                  <p className="font-medium text-sm sm:text-base">#{category.id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500 block mb-1">Name</label>
                  <p className="font-medium text-sm sm:text-base">{category.name}</p>
                </div>
                <div className="sm:col-span-2 bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500 block mb-1">Slug</label>
                  <p className="font-medium text-gray-700 text-sm sm:text-base break-all">{category.slug}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-4 bg-gray-50 border-b">
              <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="w-4 h-4" />
                Status
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Status Card */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="flex-shrink-0">
                    {category.status === 1 || category.status === true ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className="text-xs text-gray-500 block">Status</label>
                    <p className={`font-medium text-sm sm:text-base truncate ${
                      category.status === 1 || category.status === true
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {category.status === 1 || category.status === true ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {/* Popular Card */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="flex-shrink-0">
                    <Star className={`w-6 h-6 ${
                      category.popular === 1 || category.popular === true
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <label className="text-xs text-gray-500 block">Popular</label>
                    <p className="font-medium text-sm sm:text-base truncate">
                      {category.popular === 1 || category.popular === true ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-4 bg-gray-50 border-b">
              <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-4 h-4" />
                Timeline
              </h2>
            </div>
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    Created
                  </label>
                  <p className="font-medium text-sm sm:text-base">{formatDate(category.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    Updated
                  </label>
                  <p className="font-medium text-sm sm:text-base">{formatDate(category.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCategory;