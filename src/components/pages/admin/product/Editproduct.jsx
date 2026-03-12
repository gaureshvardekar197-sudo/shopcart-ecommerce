import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../admin/AdminLayout';
import { 
  Save, 
  Upload, 
  ArrowLeft,
  Info, 
  Tag, 
  Package, 
  Search,
  Image as ImageIcon,
  RefreshCw,
  Check,
  X,
  Edit,
  Ruler
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, updateProduct } from '../../../API/api-products';
import { getCategories } from '../../../API/api-categories';
import sizeApi from '../../../API/api-Product_sizes';
import Swal from 'sweetalert2';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Size related states
  const [hasSizes, setHasSizes] = useState(false);
  const [sizeCategory, setSizeCategory] = useState('clothing');
  const [sizeOptions, setSizeOptions] = useState({});
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeStocks, setSizeStocks] = useState({});
  const [sizePrices, setSizePrices] = useState({});
  const [existingSizes, setExistingSizes] = useState([]);
  const [showSizeSection, setShowSizeSection] = useState(false);

  const [formData, setFormData] = useState({
    cate_id: '',
    name: '',
    slug: '',
    original_price: '',
    selling_price: '',
    qty: '',
    tax: '',
    status: true,
    trending: false,
    small_description: '',
    description: '',
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
    image: null,
    existing_image: '',
    product_images: [],
    existing_product_images: []
  });
  const [preview, setPreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  // Fetch categories and size options
  useEffect(() => {
    fetchCategories();
    fetchSizeOptions();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await getCategories(token);
      if (response && response.data) {
        const activeCategories = response.data.filter(
          category => category.status === 1 || category.status === true
        );
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSizeOptions = async () => {
    try {
      const response = await sizeApi.getSizeOptions();
      if (response.status) {
        setSizeOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching size options:', error);
    }
  };

  // Fetch product data
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'No authentication token found'
        });
        return;
      }

      const response = await getProduct(token, id);
      console.log('Product data:', response);
      
      let productData = response.data || response;
      
      // Parse product_images
      let existingImages = [];
      if (productData.product_images) {
        if (typeof productData.product_images === 'string') {
          try {
            existingImages = JSON.parse(productData.product_images);
          } catch {
            existingImages = [];
          }
        } else if (Array.isArray(productData.product_images)) {
          existingImages = productData.product_images;
        }
      }

      // Check if product has sizes
      const hasSizesData = productData.sizes && productData.sizes.length > 0;
      setHasSizes(hasSizesData);
      setShowSizeSection(hasSizesData);

      // If has sizes, set size data
      if (hasSizesData && productData.sizes) {
        setExistingSizes(productData.sizes);
        
        // Determine size category from first size
        if (productData.sizes[0]?.size_category) {
          setSizeCategory(productData.sizes[0].size_category);
        }

        // Populate selected sizes and stocks/prices
        const sizes = [];
        const stocks = {};
        const prices = {};
        
        productData.sizes.forEach(size => {
          sizes.push(size.size);
          stocks[size.size] = size.stock || 0;
          if (size.price && parseFloat(size.price) !== parseFloat(productData.selling_price)) {
            prices[size.size] = size.price;
          }
        });
        
        setSelectedSizes(sizes);
        setSizeStocks(stocks);
        setSizePrices(prices);
      }
      
      setFormData({
        cate_id: productData.cate_id?.toString() || '',
        name: productData.name || '',
        slug: productData.slug || '',
        original_price: productData.original_price?.toString() || '',
        selling_price: productData.selling_price?.toString() || '',
        qty: productData.qty?.toString() || '',
        tax: productData.tax?.toString() || '',
        status: productData.status === 1 || productData.status === true ? true : false,
        trending: productData.trending === 1 || productData.trending === true ? true : false,
        small_description: productData.small_description || '',
        description: productData.description || '',
        meta_title: productData.meta_title || '',
        meta_keywords: productData.meta_keywords || '',
        meta_description: productData.meta_description || '',
        image: null,
        existing_image: productData.image || '',
        product_images: [],
        existing_product_images: existingImages
      });
      
      // Set main image preview
      if (productData.image_url) {
        setPreview(productData.image_url);
      } else if (productData.image) {
        const imageUrl = `http://localhost:8000/storage/products/${productData.image}`;
        setPreview(imageUrl);
      }
      
      // Set additional images previews
      if (productData.product_images_urls && Array.isArray(productData.product_images_urls)) {
        setAdditionalPreviews(productData.product_images_urls);
      } else if (existingImages.length > 0) {
        const imageUrls = existingImages.map(img => 
          `http://localhost:8000/storage/products/additional/${img}`
        );
        setAdditionalPreviews(imageUrls);
      }
      
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Loading Failed',
        text: error.response?.data?.message || 'Failed to load product data',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size should be less than 5MB',
          timer: 3000
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload JPG, JPEG, PNG, GIF or WEBP images only',
          timer: 3000
        });
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const maxAdditional = 5 - (formData.existing_product_images.length - imagesToRemove.length) - formData.product_images.length;
    
    if (files.length > maxAdditional) {
      Swal.fire({
        icon: 'warning',
        title: 'Too Many Images',
        text: `You can only add ${maxAdditional} more image(s). Total images cannot exceed 5.`,
        timer: 3000
      });
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Each image should be less than 5MB',
          timer: 3000
        });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload JPG, JPEG, PNG, GIF or WEBP images only',
          timer: 3000
        });
        return;
      }
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    
    setFormData(prev => ({ 
      ...prev, 
      product_images: [...prev.product_images, ...files] 
    }));
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, image: null, existing_image: '' }));
    setPreview(null);
  };

  const removeAdditionalImage = (index) => {
    const totalExisting = formData.existing_product_images.length;
    
    if (index < totalExisting) {
      const imageToRemove = formData.existing_product_images[index];
      setImagesToRemove(prev => [...prev, imageToRemove]);
      
      const newExistingImages = [...formData.existing_product_images];
      newExistingImages.splice(index, 1);
      setFormData(prev => ({ ...prev, existing_product_images: newExistingImages }));
      
      const newPreviews = [...additionalPreviews];
      newPreviews.splice(index, 1);
      setAdditionalPreviews(newPreviews);
    } else {
      const newImageIndex = index - totalExisting;
      
      const newFiles = [...formData.product_images];
      newFiles.splice(newImageIndex, 1);
      setFormData(prev => ({ ...prev, product_images: newFiles }));
      
      const newPreviews = [...additionalPreviews];
      newPreviews.splice(index, 1);
      setAdditionalPreviews(newPreviews);
    }
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

  // Size Management Functions
  const handleSizeToggle = (e) => {
    const checked = e.target.checked;
    setHasSizes(checked);
    setShowSizeSection(checked);
    if (!checked) {
      setSelectedSizes([]);
      setSizeStocks({});
      setSizePrices({});
    }
  };

  const handleSizeSelect = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
      const newStocks = { ...sizeStocks };
      const newPrices = { ...sizePrices };
      delete newStocks[size];
      delete newPrices[size];
      setSizeStocks(newStocks);
      setSizePrices(newPrices);
    } else {
      setSelectedSizes([...selectedSizes, size]);
      setSizeStocks({ ...sizeStocks, [size]: 0 });
      
      if (formData.selling_price) {
        setSizePrices({ ...sizePrices, [size]: formData.selling_price });
      }
    }
  };

  const handleSizeStockChange = (size, value) => {
    setSizeStocks({
      ...sizeStocks,
      [size]: parseInt(value) || 0
    });
  };

  const handleSizePriceChange = (size, value) => {
    setSizePrices({
      ...sizePrices,
      [size]: parseFloat(value) || 0
    });
  };

  const calculateTotalStock = () => {
    return Object.values(sizeStocks).reduce((sum, stock) => sum + (stock || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.cate_id) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a category'
      });
      return;
    }
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Product name is required'
      });
      return;
    }
    if (!formData.original_price) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Original price is required'
      });
      return;
    }
    if (!formData.selling_price) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Selling price is required'
      });
      return;
    }
    
    // Validate quantity or sizes
    if (!hasSizes && !formData.qty) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Quantity is required'
      });
      return;
    }

    if (hasSizes && selectedSizes.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select at least one size'
      });
      return;
    }

    if (hasSizes) {
      for (const size of selectedSizes) {
        if (!sizeStocks[size] || sizeStocks[size] <= 0) {
          Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: `Please enter stock for size ${size}`
          });
          return;
        }
      }
    }

    if (!formData.description.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Description is required'
      });
      return;
    }

    try {
      setIsSaving(true);
      
      Swal.fire({
        title: 'Updating Product',
        html: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const token = localStorage.getItem('token');
      if (!token) {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'No authentication token found'
        });
        return;
      }

      const formPayload = new FormData();
      
      // Append all fields
      formPayload.append('cate_id', String(formData.cate_id));
      formPayload.append('name', formData.name.trim());
      formPayload.append('slug', formData.slug || '');
      formPayload.append('original_price', String(formData.original_price));
      formPayload.append('selling_price', String(formData.selling_price));
      
      // Handle sizes
      if (hasSizes) {
        formPayload.append('has_sizes', '1');
        formPayload.append('size_category', sizeCategory);
        formPayload.append('selected_sizes', JSON.stringify(selectedSizes));
        formPayload.append('size_stocks', JSON.stringify(selectedSizes.map(size => sizeStocks[size] || 0)));
        
        const prices = selectedSizes.map(size => {
          const price = sizePrices[size];
          return price && parseFloat(price) !== parseFloat(formData.selling_price) ? price : null;
        });
        
        if (prices.some(p => p !== null)) {
          formPayload.append('size_prices', JSON.stringify(prices));
        }
      } else {
        formPayload.append('has_sizes', '0');
        formPayload.append('qty', String(formData.qty));
      }
      
      if (formData.tax) {
        formPayload.append('tax', String(formData.tax));
      }
      
      formPayload.append('status', formData.status ? '1' : '0');
      formPayload.append('trending', formData.trending ? '1' : '0');
      
      if (formData.small_description) {
        formPayload.append('small_description', formData.small_description);
      }
      
      formPayload.append('description', formData.description);
      
      if (formData.meta_title) {
        formPayload.append('meta_title', formData.meta_title);
      }
      
      if (formData.meta_keywords) {
        formPayload.append('meta_keywords', formData.meta_keywords);
      }
      
      if (formData.meta_description) {
        formPayload.append('meta_description', formData.meta_description);
      }
      
      // Handle images
      if (formData.image) {
        formPayload.append('image', formData.image);
      }
      
      if (formData.existing_product_images && formData.existing_product_images.length > 0) {
        formPayload.append('existing_images', JSON.stringify(formData.existing_product_images));
      } else {
        formPayload.append('existing_images', JSON.stringify([]));
      }
      
      if (imagesToRemove && imagesToRemove.length > 0) {
        formPayload.append('images_to_remove', JSON.stringify(imagesToRemove));
      }
      
      if (formData.product_images && formData.product_images.length > 0) {
        formData.product_images.forEach(file => {
          formPayload.append('product_images[]', file);
        });
      }

      formPayload.append('_method', 'PUT');

      console.log('Sending FormData:');
      for (let pair of formPayload.entries()) {
        if (pair[0].includes('image') && pair[1] instanceof File) {
          console.log(pair[0] + ':', pair[1].name);
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      const response = await updateProduct(token, id, formPayload);
      
      Swal.close();
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        html: `<p>Product <strong>"${formData.name}"</strong> has been updated successfully.</p>`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'View Products',
        showCancelButton: false,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          navigate('/admin/products');
        }
      });

    } catch (error) {
      console.error('Error updating product:', error.response?.data || error);
      
      Swal.close();
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Swal.fire({
          icon: 'error',
          title: 'Validation Failed',
          text: errorMessages
        });
      } else if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'Please login again'
        });
      } else if (error.response?.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: 'Product not found'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to update product'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto pt-5">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading product data...</p>
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
            <h1 className="text-lg font-bold text-center">Edit Product</h1>
            <p className="text-xs text-blue-100 text-center">ID: #{id}</p>
          </div>
          
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-5 lg:pt-5">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Edit Product</h1>
                <p className="text-sm text-blue-100">ID: #{id} • Update product information</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
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
                  {/* Category */}
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="cate_id"
                      value={formData.cate_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Slug */}
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
                        placeholder="Auto-generated from product name"
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
                      Slug will be auto-generated from product name
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Pricing & Inventory</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {/* Original Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Original Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        name="original_price"
                        value={formData.original_price}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Selling Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        name="selling_price"
                        value={formData.selling_price}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Size Toggle */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        id="hasSizes"
                        checked={hasSizes}
                        onChange={handleSizeToggle}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="hasSizes" className="text-sm font-semibold text-gray-700 cursor-pointer">
                          This product has sizes (Clothing, Shoes, etc.)
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Enable size variants for this product
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity - Only show if no sizes */}
                  {!hasSizes && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="qty"
                        value={formData.qty}
                        onChange={handleInputChange}
                        required={!hasSizes}
                        className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter quantity"
                        min="0"
                      />
                    </div>
                  )}

                  {/* Tax */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tax (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        name="tax"
                        value={formData.tax}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-12 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Tax percentage"
                        min="0"
                        max="100"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Management Section */}
              {showSizeSection && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Ruler className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                    </div>
                    <h2 className="text-base lg:text-lg font-bold text-gray-800">Size Management</h2>
                  </div>

                  {/* Size Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Size Category
                    </label>
                    <select
                      value={sizeCategory}
                      onChange={(e) => setSizeCategory(e.target.value)}
                      className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    >
                      <option value="clothing">Clothing Sizes (XS, S, M, L, XL, XXL)</option>
                      <option value="shoes">Shoe Sizes (36-46)</option>
                      <option value="kids">Kids Sizes (2T-12T)</option>
                      <option value="numeric">Numeric Sizes (0-12)</option>
                    </select>
                  </div>

                  {/* Available Sizes */}
                  {sizeOptions[sizeCategory] && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Available Sizes
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {sizeOptions[sizeCategory]?.sizes?.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeSelect(size)}
                            className={`
                              px-4 py-2 text-sm font-medium rounded-lg border transition-all
                              ${selectedSizes.includes(size)
                                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }
                            `}
                          >
                            {size}
                            {selectedSizes.includes(size) && (
                              <Check className="inline-block w-3 h-3 ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Sizes with Stock and Price */}
                  {selectedSizes.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Configure Sizes
                      </label>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-xl">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock *</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (Optional)</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedSizes.map((size) => (
                              <tr key={size}>
                                <td className="px-4 py-3">
                                  <span className="font-medium text-gray-900">{size}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    value={sizeStocks[size] || ''}
                                    onChange={(e) => handleSizeStockChange(size, e.target.value)}
                                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Stock"
                                    min="0"
                                    required
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                      ₹
                                    </div>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={sizePrices[size] || ''}
                                      onChange={(e) => handleSizePriceChange(size, e.target.value)}
                                      className="w-32 pl-8 pr-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                      placeholder={formData.selling_price}
                                      min="0"
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleSizeSelect(size)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td className="px-4 py-3 font-medium">Total</td>
                              <td className="px-4 py-3 font-medium">
                                {calculateTotalStock()} units
                              </td>
                              <td className="px-4 py-3" colSpan="2"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * Stock is required for each size. Leave price empty to use base selling price (₹{formData.selling_price || '0'})
                      </p>
                    </div>
                  )}

                  {/* Existing Sizes Summary */}
                  {existingSizes.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium mb-2">Existing Sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingSizes.map((size, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {size.size} (Stock: {size.stock})
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        Note: Updating sizes will replace all existing size configurations
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status & Trending */}
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
                      <p className="text-xs text-gray-500 mt-1">Product will be visible to customers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      id="trending"
                      name="trending"
                      checked={formData.trending}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <label htmlFor="trending" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        Mark as Trending
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Featured on homepage and trending sections</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Description</h2>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    name="small_description"
                    value={formData.small_description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Brief description of the product"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Detailed description of the product"
                  />
                </div>
              </div>

              {/* SEO Information */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Search className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">SEO Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="SEO meta title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Keywords
                    </label>
                    <textarea
                      name="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Comma-separated keywords"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="SEO meta description"
                    />
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-800">Product Images</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Main Product Image
                    </label>
                    {preview ? (
                      <div className="relative">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeMainImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="block cursor-pointer">
                          <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-gray-50/50 hover:bg-blue-50/30">
                            <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mb-4" />
                            <div className="text-sm text-gray-600 text-center">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Click to upload new main image
                              </span>
                              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                              <p className="text-xs text-gray-400 mt-1 italic">
                                Leave empty to keep existing image
                              </p>
                            </div>
                          </div>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="sr-only"
                            accept="image/*"
                          />
                        </label>
                      </>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Images (Max 5 total)
                    </label>
                    <label className="block cursor-pointer">
                      <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-purple-400 transition-colors bg-gray-50/50 hover:bg-purple-50/30">
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        <div className="text-sm text-gray-600 text-center">
                          <span className="font-medium text-purple-600 hover:text-purple-500">
                            Click to upload additional images
                          </span>
                          <p className="text-xs text-gray-500 mt-2">Select multiple images</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formData.existing_product_images.length + formData.product_images.length} of 5 images used
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        onChange={handleMultipleFilesChange}
                        className="sr-only"
                        accept="image/*"
                        multiple
                      />
                    </label>

                    {/* Existing and New Images Preview */}
                    {additionalPreviews.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Product Images ({additionalPreviews.length})
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {additionalPreviews.map((previewImg, index) => {
                            const isExisting = index < formData.existing_product_images.length;
                            return (
                              <div key={index} className="relative group">
                                <img
                                  src={previewImg}
                                  alt={`Additional preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                />
                                {isExisting && (
                                  <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    Existing
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Click the X button to remove images. Removed images will be deleted when you save.
                        </p>
                      </div>
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
                    if (formData.name || formData.image || formData.cate_id) {
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
                          navigate('/admin/products');
                        }
                      });
                    } else {
                      navigate('/admin/products');
                    }
                  }}
                  disabled={isSaving}
                  className="px-6 lg:px-8 py-3 text-sm lg:text-base border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 lg:gap-3 px-6 lg:px-8 py-3 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                      Update Product
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

export default EditProduct;