import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../admin/AdminLayout';
import { 
  Save, 
  Upload, 
  ArrowLeft,
  Info, 
  Image as ImageIcon,
  Check,
  X,
  RefreshCw,
  Edit
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategory, updateCategory } from '../../../API/api-categories';
import Swal from 'sweetalert2';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: true,
    popular: false,
    image: null,
    existing_image: ''
  });
  const [preview, setPreview] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Load category data from API - FIXED: Don't pass token
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        
        // Just pass the ID - token is handled by axios interceptor
        const response = await getCategory(id);
        
        console.log('Category data:', response);
        
        let categoryData = response.data || response;
        
        setFormData({
          name: categoryData.name || '',
          slug: categoryData.slug || '',
          status: categoryData.status === 1 || categoryData.status === true ? true : false,
          popular: categoryData.popular === 1 || categoryData.popular === true ? true : false,
          image: null,
          existing_image: categoryData.image || ''
        });
        
        // Set preview image
        if (categoryData.image) {
          const imageUrl = getImageUrl(categoryData);
          setPreview(imageUrl);
        }
        
        setError(null);
      } catch (error) {
        console.error("Fetch error:", error.response?.data || error.message);
        setError(error.response?.data?.message || 'Failed to load category');
        
        Swal.fire({
          icon: 'error',
          title: 'Loading Failed',
          text: error.response?.data?.message || 'Failed to load category data',
          confirmButtonColor: '#d33',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  // Image URL helper
  const getImageUrl = (category) => {
    if (!category || !category.image) {
      return null;
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file/image change with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size should be less than 2MB',
          timer: 3000,
          showConfirmButton: true
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload JPG, JPEG, PNG, GIF or WEBP images only',
          timer: 3000,
          showConfirmButton: true
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null, existing_image: '' }));
    setPreview(null);
  };

  const generateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    setFormData(prev => ({ ...prev, slug }));
    setSlugManuallyEdited(false);
  };

  useEffect(() => {
    if (formData.name && !slugManuallyEdited) {
      generateSlug();
    }
  }, [formData.name]);

  const handleSlugInputChange = (e) => {
    handleInputChange(e);
    setSlugManuallyEdited(true);
  };

  const handleManualSlugRegenerate = () => {
    generateSlug();
  };

  // Show success message
  const showSuccessMessage = (categoryName) => {
    Swal.fire({
      icon: 'success',
      title: 'Category Updated!',
      html: `
        <div class="text-center">
          <p class="mb-2">Category <strong>"${categoryName}"</strong> has been updated successfully.</p>
          <p class="text-sm text-gray-500">Changes have been saved to the database.</p>
        </div>
      `,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'View Categories',
      showCancelButton: true,
      cancelButtonColor: '#6c757d',
      cancelButtonText: 'Stay Here',
      background: '#f8f9fa',
      backdrop: `
        rgba(0,0,123,0.4)
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/categories');
      } else if (result.dismiss === Swal.DismissReason.timer) {
        navigate('/admin/categories');
      }
      // If cancel (Stay Here), just close the modal and stay on page
    });
  };

  // Show error message
  const showErrorMessage = (errors) => {
    let errorHtml = '';
    if (typeof errors === 'object') {
      errorHtml = Object.values(errors).flat().map(err => 
        `<p class="mb-1">• ${err}</p>`
      ).join('');
    } else {
      errorHtml = `<p>${errors}</p>`;
    }

    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      html: `
        <div class="text-left">
          <p class="mb-2 font-semibold">Failed to update category:</p>
          ${errorHtml}
        </div>
      `,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Try Again',
      background: '#f8f9fa'
    });
  };

  // Show loading message
  const showLoadingMessage = () => {
    Swal.fire({
      title: 'Updating Category',
      html: 'Please wait while we save your changes...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#f8f9fa'
    });
  };

  // Show confirmation before leaving with unsaved changes
  const handleCancel = () => {
    if (formData.name || formData.image || formData.slug !== formData.existing_image) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to leave?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, leave',
        cancelButtonText: 'Stay'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/admin/categories');
        }
      });
    } else {
      navigate('/admin/categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      showLoadingMessage();

      const formPayload = new FormData();
      formPayload.append('name', formData.name.trim());
      formPayload.append('slug', formData.slug || '');
      formPayload.append('status', formData.status ? '1' : '0');
      formPayload.append('popular', formData.popular ? '1' : '0');
      
      // Only append image if a new one is selected
      if (formData.image) {
        formPayload.append('image', formData.image);
      }

      // Add _method field for Laravel to handle as PUT
      formPayload.append('_method', 'PUT');

      console.log('Submitting form data:', Object.fromEntries(formPayload));
      
      // FIXED: Don't pass token separately
      await updateCategory(id, formPayload);

      // Close loading
      Swal.close();
      
      // Show success message
      showSuccessMessage(formData.name);

    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      
      // Close loading if open
      Swal.close();
      
      // Show error message
      if (error.response?.status === 422) {
        // Validation errors
        showErrorMessage(error.response.data.errors || 'Validation failed');
      } else if (error.response?.status === 401) {
        showErrorMessage('Unauthorized. Please login again.');
      } else if (error.response?.status === 404) {
        showErrorMessage('Category not found.');
      } else {
        showErrorMessage(error.response?.data?.message || 'Failed to update category. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto pt-5">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading category data...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto pt-5">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/admin/categories')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-center">Edit Category</h1>
            <p className="text-xs text-blue-100 text-center">ID: #{id}</p>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-5 lg:pt-5">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Edit Category</h1>
                <p className="text-sm text-blue-100">ID: #{id} • Update category information</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden lg:mt-0 -mt-4">
          <form onSubmit={handleSubmit} className="p-4 lg:p-6">
            <div className="space-y-6 lg:space-y-8">
              {/* Basic Information */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Info className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {/* Name Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter category name"
                    />
                  </div>

                  {/* Slug Field */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleSlugInputChange}
                        className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                        placeholder="Auto-generated from category name"
                      />
                      <button
                        type="button"
                        onClick={handleManualSlugRegenerate}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Regenerate slug"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Slug will be auto-generated from category name
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Popular */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Status Options</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      id="status"
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="status" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        Active Status
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Category will be visible to customers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      id="popular"
                      name="popular"
                      checked={formData.popular}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <label htmlFor="popular" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        Mark as Popular
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Featured on homepage</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Image */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Category Image</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Image
                    </label>
                    {preview ? (
                      <div className="relative max-w-md mx-auto lg:mx-0">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Click X to remove and upload new image
                        </p>
                      </div>
                    ) : (
                      <label className="block cursor-pointer max-w-md mx-auto lg:mx-0">
                        <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-gray-50/50 hover:bg-blue-50/30">
                          <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mb-4" />
                          <div className="text-sm text-gray-600 text-center">
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                              Click to upload new image
                            </span>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 2MB</p>
                            <p className="text-xs text-gray-400 mt-1 italic">
                              Leave empty to keep existing image
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="sr-only"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-6 lg:pt-8 border-t border-gray-200 mt-6 lg:mt-8">
              <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 lg:px-8 py-3 text-sm lg:text-base border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 lg:gap-3 px-6 lg:px-8 py-3 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                      Update Category
                    </>
                  )}
                </button>
              </div>
              <p className="text-center text-xs lg:text-sm text-gray-500 mt-3 lg:mt-4">
                Fields marked with <span className="text-red-500">*</span> are required
              </p>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditCategory;