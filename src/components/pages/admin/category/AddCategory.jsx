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
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../../../API/api-categories';
import Swal from 'sweetalert2';

const AddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: true,
    popular: false,
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file/image change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size should be less than 5MB',
          timer: 3000,
          showConfirmButton: true
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload JPG, JPEG, PNG or GIF images only',
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
    setFormData(prev => ({ ...prev, image: null }));
    setPreview(null);
  };

  // Slug generation
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
      title: 'Category Created!',
      html: `
        <div class="text-center">
          <p class="mb-2">Category <strong>"${categoryName}"</strong> has been added successfully.</p>
          <p class="text-sm text-gray-500">You can now use this category for your products.</p>
        </div>
      `,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'View Categories',
      showCancelButton: true,
      cancelButtonColor: '#6c757d',
      cancelButtonText: 'Add Another',
      background: '#f8f9fa',
      backdrop: `
        rgba(0,0,123,0.4)
        left top
        no-repeat
      `
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/categories');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Reset form for another entry
        setFormData({
          name: '',
          slug: '',
          status: true,
          popular: false,
          image: null
        });
        setPreview(null);
        setSlugManuallyEdited(false);
      } else if (result.dismiss === Swal.DismissReason.timer) {
        navigate('/admin/categories');
      }
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
      title: 'Oops...',
      html: `
        <div class="text-left">
          <p class="mb-2 font-semibold">Failed to create category:</p>
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
      title: 'Creating Category',
      html: 'Please wait while we save your category...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#f8f9fa'
    });
  };

  // === Submit form and call API ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      showErrorMessage('Category name is required');
      return;
    }
    
    if (!formData.image) {
      showErrorMessage('Category image is required');
      return;
    }

    try {
      setIsSubmitting(true);
      showLoadingMessage();

      const token = localStorage.getItem('token');
      if (!token) {
        Swal.close();
        showErrorMessage('User not authenticated');
        return;
      }

      const formPayload = new FormData();
      formPayload.append('name', formData.name.trim());
      formPayload.append('slug', formData.slug || '');
      formPayload.append('status', formData.status ? '1' : '0');
      formPayload.append('popular', formData.popular ? '1' : '0');
      formPayload.append('image', formData.image);

      // Log FormData for debugging
      for (let pair of formPayload.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Call API
      const response = await createCategory(token, formPayload);
      
      // Close loading
      Swal.close();
      
      // Show success message
      showSuccessMessage(formData.name);

    } catch (error) {
      console.error('Error creating category:', error.response?.data || error);
      
      // Close loading if open
      Swal.close();
      
      // Show error message
      if (error.response?.status === 422) {
        // Validation errors
        showErrorMessage(error.response.data.errors || 'Validation failed');
      } else if (error.response?.status === 401) {
        showErrorMessage('Unauthorized. Please login again.');
      } else {
        showErrorMessage(error.response?.data?.message || 'Failed to add category. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/categories')}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-center">Add Category</h1>
            <p className="text-xs text-blue-100 text-center">Create new category</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-5 lg:pt-5">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Add New Category</h1>
                <p className="text-sm text-blue-100">Fill in all required fields</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/categories')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden lg:mt-0 -mt-4">
          <form onSubmit={handleSubmit} className="p-4 lg:p-6">
            {/* Basic Info */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Info className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
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

              {/* Image Upload */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Category Image</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Image <span className="text-red-500">*</span>
                    </label>
                    {preview ? (
                      <div className="relative max-w-md mx-auto lg:mx-0">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                          <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="block cursor-pointer max-w-md mx-auto lg:mx-0">
                        <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-gray-50/50 hover:bg-blue-50/30">
                          <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mb-4" />
                          <div className="text-sm text-gray-600 text-center">
                            <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload category image</span>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        </div>
                        <input type="file" onChange={handleFileChange} className="sr-only" accept="image/*" required />
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
                  onClick={() => {
                    if (formData.name || formData.image) {
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
                  }} 
                  className="px-6 lg:px-8 py-3 text-sm lg:text-base border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex items-center justify-center gap-2 lg:gap-3 px-6 lg:px-8 py-3 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                      Create Category
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

export default AddCategory;