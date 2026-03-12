import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Container from '../layout/Container'
import {
  getProduct, getProducts
} from '../API/api-products'
import { addToWishlist, removeFromWishlist, getWishlist } from '../API/api-wishlist'
import { addToCart as apiAddToCart, getCart } from '../API/api-cart'
import reviewApi from '../API/api-review'
import { toast } from 'react-toastify'

// Import custom hook
import { useProductSizes } from '../hooks/useProductSizes'

// Import components
import Loader from '../Common/Loader'
import Breadcrumb from '../Common/Breadcrumb'
import ReviewModal from '../Common/ReviewModal'
import ProductImages from '../product/ProductImages'
import ProductInfo from '../product/ProductInfo'
import ProductActions from '../product/ProductActions'
import ProductTabs from '../product/ProductTabs'
import RelatedProducts from '../product/RelatedProducts'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // State declarations
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [wishlistItems, setWishlistItems] = useState([])

  // Use the custom hook for sizes
  const {
    sizes: productSizes,
    selectedSize,
    selectedSizeData,
    setSelectedSize: handleSizeSelect,
    loadingSizes,
    hasSizes
  } = useProductSizes(id);

  // Review states
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)

  // Can review state
  const [canReview, setCanReview] = useState({
    can_review: false,
    has_purchased: false,
    order_id: null
  })

  // Effects
  useEffect(() => {
    checkAuth()
    fetchProductDetails()
  }, [id])

  useEffect(() => {
    if (product && id) {
      fetchWishlistItems()
      fetchReviews()
      if (isAuthenticated) {
        checkCanReview()
      }
    }
  }, [product, id, isAuthenticated])

  useEffect(() => {
    if (product && wishlistItems.length > 0) {
      checkIfInWishlist()
    }
  }, [selectedSize, wishlistItems, product])

  // Helper Functions
  const checkIfUserReviewed = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email;
      const userReview = reviews.find(review => review.user?.email === userEmail);
      return !!userReview;
    } catch (error) {
      console.error('Error checking if user reviewed:', error);
      return false;
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    setIsAuthenticated(!!token)

    if (token && user) {
      try {
        const userData = JSON.parse(user)
        setUserRole(userData.role)
        setIsAdmin(userData.role === 1)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setUserRole(null)
        setIsAdmin(false)
      }
    } else {
      setUserRole(null)
      setIsAdmin(false)
    }
  }

  const fetchWishlistItems = async () => {
    if (isAuthenticated) {
      try {
        const response = await getWishlist()
        if (response && response.data) {
          setWishlistItems(response.data)
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      }
    } else {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          setWishlistItems(JSON.parse(savedWishlist))
        } catch (error) {
          console.error('Error parsing wishlist:', error)
        }
      }
    }
  }

  const checkCanReview = async () => {
    if (!isAuthenticated || !id) return;

    try {
      const response = await reviewApi.canReview(id);

      if (response?.success && response?.data) {
        const hasUserReviewed = checkIfUserReviewed();
        const finalCanReview = hasUserReviewed ? false : (response.data.can_review || false);

        setCanReview({
          can_review: finalCanReview,
          has_purchased: response.data.has_purchased || false,
          order_id: response.data.order_id || null
        });
      } else {
        setCanReview({
          can_review: false,
          has_purchased: false,
          order_id: null
        });
      }
    } catch (error) {
      console.error('Error checking review status:', error);
      setCanReview({
        can_review: false,
        has_purchased: false,
        order_id: null
      });
    }
  };

  const checkIfInWishlist = () => {
    if (!product) return;

    if (isAuthenticated) {
      const exists = wishlistItems.some(item => {
        if (item.id !== Number(id)) return false;
        
        if (selectedSize && selectedSizeData) {
          const itemSizeId = item.pivot?.size_id || item.selected_size_id;
          return itemSizeId === selectedSizeData.id;
        } else {
          return !item.pivot?.size_id && !item.selected_size_id;
        }
      });
      
      setIsInWishlist(exists);
      return;
    }
    
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist)
        const exists = wishlist.some(item => {
          if (item.id !== Number(id)) return false;
          
          if (selectedSize && selectedSizeData) {
            return item.selected_size_id === selectedSizeData.id;
          } else {
            return !item.selected_size_id;
          }
        })
        setIsInWishlist(exists)
      } catch (error) {
        console.error('Error checking wishlist:', error)
        setIsInWishlist(false)
      }
    } else {
      setIsInWishlist(false)
    }
  }

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await getProduct(token, id)
      const productData = response?.data || response

      if (productData) {
        setProduct(productData)

        const colors = getColors(productData)
        if (colors.length > 0) setSelectedColor(colors[0])

        const productsResponse = await getProducts(token)
        const allProducts = productsResponse?.data || productsResponse || []

        const categoryName = getCategoryName(productData)

        const related = allProducts
          .filter(p => {
            if (p.id === Number(id)) return false
            const pCategory = getCategoryName(p)
            return pCategory === categoryName
          })
          .slice(0, 4)

        setRelatedProducts(related)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product details', {
        position: "top-right",
        autoClose: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!id) return

    setReviewsLoading(true)

    try {
      const response = await reviewApi.getReviews(id)

      if (response?.success === true && response?.data) {
        const { data } = response

        let reviewsData = []

        if (data.reviews && data.reviews.data) {
          reviewsData = data.reviews.data
        } else if (Array.isArray(data)) {
          reviewsData = data
        } else if (data.data && Array.isArray(data.data)) {
          reviewsData = data.data
        }

        setReviews(reviewsData)

        setReviewStats({
          average: data.average_rating || 0,
          total: data.total_reviews || reviewsData.length || 0,
          distribution: data.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      } else {
        setReviews([])
        setReviewStats({
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews', {
        position: "top-right",
        autoClose: 2000
      })
    } finally {
      setReviewsLoading(false)
    }
  }

  // Review Modal Functions
  const openReviewModal = () => {
    if (!isAuthenticated) {
      toast.info('Please login to write a review', {
        position: "top-right",
        autoClose: 2000
      })
      navigate('/login')
      return
    }

    if (!canReview.can_review) {
      if (!canReview.has_purchased) {
        toast.info('You can only review this product after it has been delivered', {
          position: "top-right",
          autoClose: 3000
        })
      } else {
        toast.info('You have already reviewed this product', {
          position: "top-right",
          autoClose: 3000
        })
      }
      return
    }

    setIsReviewModalOpen(true)
  }

  const closeReviewModal = () => {
    setIsReviewModalOpen(false)
  }

  const handleSubmitReview = async (formData) => {
    if (formData.rating === 0) {
      toast.error('Please select a rating', {
        position: "top-right",
        autoClose: 2000
      })
      return
    }

    setSubmittingReview(true)

    try {
      const reviewData = {
        product_id: parseInt(id),
        order_id: canReview.order_id,
        rating: formData.rating,
        comment: formData.comment || ''
      }

      const response = await reviewApi.createReview(reviewData)

      if (response?.success) {
        toast.success('Review submitted successfully! It will be visible after approval.', {
          position: "top-right",
          autoClose: 3000
        })

        closeReviewModal()
        await fetchReviews()
        checkCanReview()
      } else {
        toast.error(response?.message || 'Failed to submit review', {
          position: "top-right",
          autoClose: 2000
        })
      }
    } catch (error) {
      console.error('Error submitting review:', error)

      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat()
        toast.error(errorMessages.join('\n'), {
          position: "top-right",
          autoClose: 5000
        })
      } else {
        toast.error(error.message || 'Failed to submit review', {
          position: "top-right",
          autoClose: 2000
        })
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  // Wishlist Functions
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.warning('🔐 Please login to add items to wishlist', {
        position: "top-right",
        autoClose: 2000,
        icon: "🔐"
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isAdmin) {
      toast.info('👑 Admin: You are in view-only mode', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      });
      return;
    }

    const token = localStorage.getItem('token')

    if (!token) {
      // Guest wishlist
      const savedWishlist = localStorage.getItem('wishlist')
      let wishlist = savedWishlist ? JSON.parse(savedWishlist) : []

      const existingItemIndex = wishlist.findIndex(item => {
        if (item.id !== Number(id)) return false;
        
        if (selectedSize && selectedSizeData) {
          return item.selected_size_id === selectedSizeData.id;
        } else {
          return !item.selected_size_id;
        }
      });

      if (existingItemIndex !== -1) {
        wishlist.splice(existingItemIndex, 1);
        toast.success(`❤️ ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} removed from wishlist`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      } else {
        let priceToUse = product.selling_price || product.price || 0;
        let sizeInfo = null;
        let originalPriceToUse = getOriginalPrice(product) || priceToUse;

        if (selectedSize && selectedSizeData) {
          sizeInfo = {
            size: selectedSize,
            size_id: selectedSizeData.id,
            size_price: selectedSizeData.selling_price || selectedSizeData.price,
            size_original_price: selectedSizeData.original_price || selectedSizeData.effective_original_price
          };
          priceToUse = sizeInfo.size_price || priceToUse;
          originalPriceToUse = sizeInfo.size_original_price || originalPriceToUse;
        }

        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: priceToUse,
          original_price: originalPriceToUse,
          selling_price: priceToUse,
          image: product.image_url || product.image,
          image_url: product.image_url || product.image,
          category: getCategoryName(product),
          category_name: getCategoryName(product),
          ...(sizeInfo && {
            selected_size: sizeInfo.size,
            selected_size_id: sizeInfo.size_id,
            size_price: sizeInfo.size_price,
            size_original_price: sizeInfo.size_original_price
          })
        }
        wishlist.push(wishlistItem)
        toast.success(`❤️ ${product.name} added to wishlist${selectedSize ? ` (Size: ${selectedSize})` : ''}`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist))
      setWishlistItems(wishlist)
      checkIfInWishlist()

      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { count: wishlist.length }
      }))
      return
    }

    // Authenticated wishlist
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id, selectedSizeData?.id)
        toast.success(`❤️ ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} removed from wishlist`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      } else {
        await addToWishlist(product.id, selectedSize, selectedSizeData?.id)
        toast.success(`❤️ ${product.name} added to wishlist${selectedSize ? ` (Size: ${selectedSize})` : ''}`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      }

      await fetchWishlistItems()
      
    } catch (error) {
      console.error('Error toggling wishlist:', error)

      if (error.response?.status === 403) {
        toast.info('👑 Admin: You are in view-only mode', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        });
      } else if (error.response?.status === 409) {
        toast.info('Product already in wishlist', {
          position: "top-right",
          autoClose: 2000
        });
      } else {
        toast.error('Failed to update wishlist', {
          position: "top-right",
          autoClose: 2000
        });
      }
    }
  }

  // Cart Functions
  const handleAddToCart = async () => {
    if (!product) return

    if (!isAuthenticated) {
      toast.warning('Please login to add items to cart', {
        position: "top-right",
        autoClose: 2000
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (isAdmin) {
      toast.info('Admin cannot add to cart', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    // Check size selection
    if (hasSizes) {
      if (!selectedSize) {
        toast.warning('Please select a size', {
          position: "top-right",
          autoClose: 2000
        });
        return;
      }
      
      if (selectedSizeData && selectedSizeData.stock < quantity) {
        toast.error(`Only ${selectedSizeData.stock} items available in size ${selectedSize}`, {
          position: "top-right",
          autoClose: 3000
        });
        return;
      }
    }

    setAddingToCart(true);

    try {
      let sizeIdToSend = null;
      
      if (selectedSize && selectedSizeData?.id) {
        sizeIdToSend = parseInt(selectedSizeData.id);
      }

      const response = await apiAddToCart(
        product.id, 
        quantity, 
        selectedSize, 
        sizeIdToSend
      );

      if (!response) {
        toast.error('No response from server', {
          position: "top-right",
          autoClose: 2000
        });
        return;
      }

      if (response.status === true) {
        // Fetch updated cart
        try {
          const cartResponse = await getCart();
          
          if (cartResponse?.status && cartResponse?.data) {
            localStorage.setItem('cart', JSON.stringify(cartResponse.data));
            
            const totalQuantity = cartResponse.data.reduce((sum, item) => 
              sum + (item.quantity || 1), 0
            );
            
            window.dispatchEvent(new CustomEvent('cartUpdated', {
              detail: { count: totalQuantity }
            }));
          }
        } catch (cartError) {
          console.error('Error fetching updated cart:', cartError);
        }
        
        // Show success message
        const message = response.is_update 
          ? `Updated quantity for ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''}`
          : `Added ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} to cart`;
        
        toast.success(message, {
          position: "top-right",
          autoClose: 2000
        });
        
        setQuantity(1);
        
      } else if (response.role_error) {
        toast.info('Admin cannot add to cart', {
          position: "top-right",
          autoClose: 3000
        });
      } else if (response.validation_error) {
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat().join(', ');
          toast.error(errorMessages, {
            position: "top-right",
            autoClose: 4000
          });
        } else {
          toast.error('Validation failed', {
            position: "top-right",
            autoClose: 2000
          });
        }
      } else if (response.duplicate_error) {
        toast.info('This item is already in your cart', {
          position: "top-right",
          autoClose: 2000
        });
      } else if (response.message) {
        toast.error(response.message, {
          position: "top-right",
          autoClose: 2000
        });
      } else {
        toast.error('Failed to add to cart', {
          position: "top-right",
          autoClose: 2000
        });
      }
      
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error('Session expired. Please login again.', {
              position: "top-right",
              autoClose: 2000
            });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(() => navigate('/login'), 1500);
            break;
          case 403:
            toast.info('You do not have permission to add items to cart', {
              position: "top-right",
              autoClose: 2000
            });
            break;
          case 404:
            toast.error('Product not found', {
              position: "top-right",
              autoClose: 2000
            });
            break;
          case 409:
            toast.info('This item is already in your cart', {
              position: "top-right",
              autoClose: 2000
            });
            break;
          case 422:
            if (error.response.data.errors) {
              const messages = Object.values(error.response.data.errors).flat();
              toast.error(messages.join('\n'), {
                position: "top-right",
                autoClose: 4000
              });
            } else {
              toast.error('Validation error', {
                position: "top-right",
                autoClose: 2000
              });
            }
            break;
          case 500:
            toast.error('Server error. Please try again later.', {
              position: "top-right",
              autoClose: 2000
            });
            break;
          default:
            toast.error(error.response.data?.message || 'Failed to add to cart', {
              position: "top-right",
              autoClose: 2000
            });
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection.', {
          position: "top-right",
          autoClose: 2000
        });
      } else {
        toast.error('An unexpected error occurred', {
          position: "top-right",
          autoClose: 2000
        });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return

    if (!isAuthenticated) {
      toast.warning('🛒 Please login to proceed to checkout', {
        position: "top-right",
        autoClose: 2000,
        icon: "🛒"
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isAdmin) {
      toast.info('👑 Admin: You cannot proceed to checkout because you are checking the website, not making a purchase', {
        position: "top-right",
        autoClose: 5000,
        icon: "👑"
      })
      return
    }

    setAddingToCart(true)

    try {
      const response = await apiAddToCart(product.id, quantity, selectedSize, selectedSizeData?.id)

      if (response?.status === true) {
        navigate('/checkout');
      } else if (response?.role_error) {
        toast.info('👑 Admin: You cannot proceed to checkout - You are checking the website, not making a purchase', {
          position: "top-right",
          autoClose: 5000,
          icon: "👑"
        });
      } else {
        toast.error(response?.message || 'Failed to process buy now', {
          position: "top-right",
          autoClose: 2000
        });
      }
      
    } catch (error) {
      console.error('Error in buy now:', error)
      toast.error('Failed to process buy now', {
        position: "top-right",
        autoClose: 2000
      })
    } finally {
      setAddingToCart(false)
    }
  }

  // Utility Functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const getCategoryName = (product) => {
    if (!product) return 'Uncategorized'
    if (product.category && typeof product.category === 'object') {
      return product.category.name || 'Uncategorized'
    }
    if (product.category_name && typeof product.category_name === 'object') {
      return product.category_name.name || 'Uncategorized'
    }
    return product.category_name || product.category || 'Uncategorized'
  }

  const getOriginalPrice = (product) => {
    if (!product) return null
    const possibleFields = [
      'original_price', 'mrp', 'compare_at_price', 'regular_price',
      'old_price', 'list_price', 'retail_price', 'originalPrice'
    ]
    for (const field of possibleFields) {
      const value = product[field]
      if (value && !isNaN(value) && Number(value) > 0) {
        return Number(value)
      }
    }
    return null
  }

  const getProductImages = (product) => {
    const images = []
    if (product.image_url) {
      images.push(product.image_url)
    } else if (product.image) {
      images.push(product.image)
    }
    const additionalImages = getAdditionalImages(product)
    if (additionalImages.length > 0) {
      const uniqueAdditional = additionalImages.filter(img =>
        !images.includes(img) && img !== images[0]
      )
      images.push(...uniqueAdditional)
    }
    if (images.length === 0) {
      images.push(`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=400&length=2&font-size=0.4`)
    }
    return images
  }

  const getAdditionalImages = (product) => {
    if (!product) return []
    if (product.product_images_urls && Array.isArray(product.product_images_urls)) {
      return product.product_images_urls
    }
    if (product.product_images && Array.isArray(product.product_images)) {
      return product.product_images.map(img => {
        if (img.startsWith('http')) return img
        return `http://localhost:8000/storage/products/additional/${img}`
      })
    }
    return []
  }

  const getColors = (product) => {
    if (product.colors && Array.isArray(product.colors)) {
      return product.colors
    }
    if (product.color) {
      if (typeof product.color === 'string') {
        return product.color.split(',').map(c => c.trim())
      }
      if (Array.isArray(product.color)) {
        return product.color
      }
    }
    return []
  }

  const getSizes = (product) => {
    if (productSizes && productSizes.length > 0) {
      return productSizes;
    }
    
    if (product?.sizes && Array.isArray(product.sizes)) {
      return product.sizes;
    }
    
    if (product?.size_options && Array.isArray(product.size_options)) {
      return product.size_options;
    }
    
    if (product?.available_sizes && Array.isArray(product.available_sizes)) {
      return product.available_sizes;
    }
    
    if (product?.size) {
      if (typeof product.size === 'string') {
        return product.size.split(',').map(s => s.trim()).map(size => ({
          size: size,
          stock: product.stock || 0,
          price: product.selling_price || product.price || 0
        }));
      }
      if (Array.isArray(product.size)) {
        return product.size;
      }
    }
    
    return [];
  }

  const calculateDeliveryDate = () => {
    const today = new Date()
    const deliveryDate = new Date(today.setDate(today.getDate() + 5))
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatReviewDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    }
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Loading and Error States
  if (loading) {
    return <Loader message="Loading product details..." />
  }

  if (!product) {
    return (
      <Container>
        <div className="py-12 sm:py-16 text-center px-4">
          <div className="max-w-md mx-auto">
            <div className="text-5xl sm:text-6xl mb-4">😕</div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all hover:shadow-lg text-sm sm:text-base"
            >
              Browse Products
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Container>
    )
  }

  // Derived state
  const productPrice = product.selling_price || product.price || 0;
  const productOriginalPrice = getOriginalPrice(product) || productPrice;
  
  const sizePrice = selectedSizeData?.selling_price || selectedSizeData?.price || null;
  const sizeOriginalPrice = selectedSizeData?.original_price || selectedSizeData?.effective_original_price || null;
  
  const currentPrice = selectedSize ? (sizePrice || productPrice) : productPrice;
  const currentOriginalPrice = selectedSize ? (sizeOriginalPrice || productOriginalPrice) : productOriginalPrice;
  
  const discount = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : null;

  const currentStock = selectedSizeData?.stock || product.stock || product.qty || 0;
  const inStock = selectedSizeData ? (selectedSizeData.stock > 0) : (currentStock > 0);
  
  const images = getProductImages(product)
  const colors = getColors(product)
  const sizes = getSizes(product)
  const categoryName = getCategoryName(product)
  const deliveryDate = calculateDeliveryDate()

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: categoryName, to: `/products?category=${categoryName.toLowerCase()}` },
    { label: product.name }
  ]

  // Render
  return (
    <Container>
      <div className="py-4 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12">
          <ProductImages
            images={images}
            name={product.name}
            discount={discount}
            inStock={inStock}
            isAdmin={isAdmin}
            isInWishlist={isInWishlist}
            onWishlistToggle={handleWishlistToggle}
            isAuthenticated={isAuthenticated}
            disabled={isAdmin}
          />

          <div className="space-y-4 sm:space-y-6">
            <ProductInfo
              product={product}
              categoryName={categoryName}
              isAdmin={isAdmin}
              selectedSize={selectedSize}
              sizePrice={selectedSizeData?.selling_price || selectedSizeData?.price}
              sizeOriginalPrice={selectedSizeData?.original_price || selectedSizeData?.effective_original_price}
              formatCurrency={formatCurrency}
            />

            <ProductActions
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              inStock={inStock}
              addingToCart={addingToCart}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              colors={colors}
              sizes={sizes}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              selectedSize={selectedSize}
              onSizeSelect={handleSizeSelect}
              stock={currentStock}
              deliveryDate={deliveryDate}
              loadingSizes={loadingSizes}
            />
          </div>
        </div>

        <ProductTabs
          product={product}
          reviews={reviews}
          reviewStats={reviewStats}
          reviewsLoading={reviewsLoading}
          canReview={canReview}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onOpenReviewModal={openReviewModal}
          formatDate={formatReviewDate}
        />

        <RelatedProducts
          products={relatedProducts}
          categoryName={categoryName}
          formatCurrency={formatCurrency}
          getOriginalPrice={getOriginalPrice}
          isAdmin={isAdmin}
        />

        {!isAdmin && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={closeReviewModal}
            onSubmit={handleSubmitReview}
            isAuthenticated={isAuthenticated}
            canReview={canReview}
            submitting={submittingReview}
          />
        )}
      </div>
    </Container>
  )
}

export default ProductDetails