// src/pages/ProductDetails.jsx
import { useState, useEffect, Fragment } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import Container from '../layout/Container'
import {
  StarIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowPathIcon,
  ClockIcon,
  GiftIcon,
  FireIcon,
  PlusIcon,
  MinusIcon,
  UserCircleIcon,
  XMarkIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { getProduct, getProducts } from '../API/api-products'
import { addToWishlist, removeFromWishlist, getWishlist } from '../API/api-wishlist'
import { addToCart as apiAddToCart } from '../API/api-cart'
import reviewApi from '../API/api-review'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Review states
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [reviewError, setReviewError] = useState(null)

  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Can review state
  const [canReview, setCanReview] = useState({
    can_review: false,
    has_purchased: false,
    order_id: null
  })

  useEffect(() => {
    checkAuth()
    fetchProductDetails()
  }, [id])

  useEffect(() => {
    if (product && id) {
      checkIfInWishlist()
      fetchReviews()
      if (isAuthenticated) {
        checkCanReview()
      }
    }
  }, [product, id, isAuthenticated])

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

  // Check if user can review (product delivered)
  const checkCanReview = async () => {
    if (!isAuthenticated || !id) return

    try {
      const response = await reviewApi.canReview(id)
      console.log('Can review response:', response)

      if (response?.success && response?.data) {
        setCanReview({
          can_review: response.data.can_review || false,
          has_purchased: response.data.has_purchased || false,
          order_id: response.data.order_id || null
        })
      } else {
        setCanReview({
          can_review: false,
          has_purchased: false,
          order_id: null
        })
      }
    } catch (error) {
      console.error('Error checking review status:', error)
      setCanReview({
        can_review: false,
        has_purchased: false,
        order_id: null
      })
    }
  }

  // Open review modal
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
      }
      return
    }

    setIsReviewModalOpen(true)
  }

  // Close review modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false)
    setReviewFormData({ rating: 0, comment: '' })
  }

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (reviewFormData.rating === 0) {
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
        rating: reviewFormData.rating,
        comment: reviewFormData.comment || ''
      }

      console.log('Submitting review data:', reviewData)

      const response = await reviewApi.createReview(reviewData)
      console.log('Review submitted:', response)

      if (response?.success) {
        toast.success('Review submitted successfully! It will be visible after approval.', {
          position: "top-right",
          autoClose: 3000
        })

        closeReviewModal()
        fetchReviews()
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

  // Helper function to render interactive stars for review form
  const renderInteractiveStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setReviewFormData({ ...reviewFormData, rating: i })}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          {i <= reviewFormData.rating ? (
            <StarIconSolid className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
          ) : (
            <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 dark:text-gray-600 hover:text-yellow-200" />
          )}
        </button>
      )
    }
    return stars
  }

  const checkIfInWishlist = () => {
    const token = localStorage.getItem('token')

    if (token) {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          const wishlist = JSON.parse(savedWishlist)
          const exists = wishlist.some(item => item.id === Number(id))
          setIsInWishlist(exists)
        } catch (error) {
          console.error('Error checking wishlist:', error)
        }
      }
    } else {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          const wishlist = JSON.parse(savedWishlist)
          const exists = wishlist.some(item => item.id === Number(id))
          setIsInWishlist(exists)
        } catch (error) {
          console.error('Error checking wishlist:', error)
        }
      }
    }
  }

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') // Get token if exists, but don't require it

      const response = await getProduct(token, id) // Pass token (can be null)
      const productData = response?.data || response

      if (productData) {
        setProduct(productData)

        // Set default selections
        const colors = getColors(productData)
        if (colors.length > 0) setSelectedColor(colors[0])

        const sizes = getSizes(productData)
        if (sizes.length > 0) setSelectedSize(sizes[0])

        // Fetch related products - also don't require token
        const productsResponse = await getProducts(token) // Pass token (can be null)
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

  // Update the fetchReviews function to properly handle the response
  const fetchReviews = async () => {
    if (!id) {
      console.log('No product ID available')
      return
    }

    console.log('Fetching reviews for product ID:', id)
    setReviewsLoading(true)
    setReviewError(null)

    try {
      const response = await reviewApi.getReviews(id)
      console.log('Reviews API response:', response)

      // Check if response has the expected structure from your API
      if (response?.success === true && response?.data) {
        const { data } = response

        // Extract reviews data based on your API structure
        // Your API returns paginated data in data.reviews.data
        let reviewsData = []
        
        if (data.reviews && data.reviews.data) {
          reviewsData = data.reviews.data
        } else if (Array.isArray(data)) {
          reviewsData = data
        } else if (data.data && Array.isArray(data.data)) {
          reviewsData = data.data
        }

        console.log('Processed reviews data:', reviewsData)

        // Set reviews with user data
        setReviews(reviewsData)

        // Set review stats
        setReviewStats({
          average: data.average_rating || 0,
          total: data.total_reviews || reviewsData.length || 0,
          distribution: data.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      } else {
        console.log('Unexpected response format:', response)
        setReviews([])
        setReviewStats({
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviewError(error.message || 'Failed to load reviews')
      toast.error('Failed to load reviews', {
        position: "top-right",
        autoClose: 2000
      })
    } finally {
      setReviewsLoading(false)
    }
  }

  // Helper function to render stars with different sizes
  const renderStars = (rating, size = 'default') => {
    const stars = []
    const sizeClasses = {
      small: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
      default: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
      large: 'w-4 h-4 sm:w-5 sm:h-5',
      xlarge: 'w-5 h-5 sm:w-6 sm:h-6'
    }
    const starSize = sizeClasses[size] || sizeClasses.default
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarIconSolid key={i} className={`${starSize} text-yellow-400`} />
        ) : (
          <StarIcon key={i} className={`${starSize} text-gray-300 dark:text-gray-600`} />
        )
      )
    }
    return stars
  }

  // Helper function to format date with relative time
  const formatReviewDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    } else {
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Helper function to get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Handle wishlist toggle with user-friendly alerts
  const handleWishlistToggle = async () => {
    // Check if user is not logged in
    if (!isAuthenticated) {
      toast.warning('🔐 Please login to add items to wishlist', {
        position: "top-right",
        autoClose: 2000,
        icon: "🔐"
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is admin (role 1)
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
      const savedWishlist = localStorage.getItem('wishlist')
      let wishlist = savedWishlist ? JSON.parse(savedWishlist) : []

      if (isInWishlist) {
        wishlist = wishlist.filter(item => item.id !== Number(id))
        toast.success(`❤️ ${product.name} removed from wishlist`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      } else {
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.selling_price || product.price,
          image: product.image_url || product.image,
          category: getCategoryName(product)
        }
        wishlist.push(wishlistItem)
        toast.success(`❤️ ${product.name} added to wishlist`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist))
      setIsInWishlist(!isInWishlist)

      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { count: wishlist.length }
      }))
      return
    }

    try {
      if (isInWishlist) {
        const response = await removeFromWishlist(product.id)
        
        // Check for admin error in response
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You are in view-only mode', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          });
          return
        }
        
        toast.success(`❤️ ${product.name} removed from wishlist`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      } else {
        const response = await addToWishlist(product.id)
        
        // Check for admin error in response
        if (response && response.is_admin_error) {
          toast.info('👑 Admin: You are in view-only mode', {
            position: "top-right",
            autoClose: 3000,
            icon: "👑"
          });
          return
        }
        
        toast.success(`❤️ ${product.name} added to wishlist`, {
          position: "top-right",
          autoClose: 2000,
          icon: "❤️"
        });
      }
      setIsInWishlist(!isInWishlist)

      const wishlistResponse = await getWishlist()
      const wishlistData = wishlistResponse?.data || wishlistResponse || []
      const count = Array.isArray(wishlistData) ? wishlistData.length : 0

      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { count }
      }))
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You are in view-only mode', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        });
      } else {
        toast.error('Failed to update wishlist', {
          position: "top-right",
          autoClose: 2000
        });
      }
    }
  }

  // Handle add to cart with user-friendly alerts
  const handleAddToCart = async () => {
    if (!product) return

    // Check if user is not logged in
    if (!isAuthenticated) {
      toast.warning('🛒 Please login to add items to cart', {
        position: "top-right",
        autoClose: 2000,
        icon: "🛒"
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is admin (role 1)
    if (isAdmin) {
      toast.info('👑 Admin: You are in view-only mode', {
        position: "top-right",
        autoClose: 3000,
        icon: "👑"
      });
      return
    }

    setAddingToCart(true)

    try {
      const cartItem = {
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.selling_price || product.price,
        selling_price: product.selling_price || product.price,
        quantity: quantity,
        image: product.image_url || product.image,
        image_url: product.image_url || product.image,
        color: selectedColor,
        size: selectedSize,
        stock: product.stock || product.qty || 0
      }

      if (isAuthenticated) {
        try {
          const response = await apiAddToCart(product.id, quantity)
          console.log('Add to cart API response:', response)

          // Check for admin error in response
          if (response && response.is_admin_error) {
            toast.info('👑 Admin: You are in view-only mode', {
              position: "top-right",
              autoClose: 3000,
              icon: "👑"
            });
            return
          }

          if (response?.status) {
            const savedCart = localStorage.getItem('cart')
            let cart = savedCart ? JSON.parse(savedCart) : []

            const existingItemIndex = cart.findIndex(item =>
              item.id === product.id &&
              item.color === selectedColor &&
              item.size === selectedSize
            )

            if (existingItemIndex >= 0) {
              cart[existingItemIndex].quantity += quantity
              toast.success(`🛒 ${product.name} quantity updated in cart`, {
                position: "top-right",
                autoClose: 2000,
                icon: "🛒"
              });
            } else {
              cart.push(cartItem)
              toast.success(`🛒 ${product.name} added to cart`, {
                position: "top-right",
                autoClose: 2000,
                icon: "🛒"
              });
            }

            localStorage.setItem('cart', JSON.stringify(cart))

            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

            window.dispatchEvent(new CustomEvent('cartUpdated', {
              detail: {
                cart: cart,
                count: totalQuantity
              }
            }))
          } else {
            toast.error('Failed to add to cart', {
              position: "top-right",
              autoClose: 2000
            })
          }
        } catch (apiError) {
          console.error('API add to cart error:', apiError)

          // Check for admin error in error response
          if (apiError.response?.status === 403) {
            toast.info('👑 Admin: You are in view-only mode', {
              position: "top-right",
              autoClose: 3000,
              icon: "👑"
            });
            return
          }

          const savedCart = localStorage.getItem('cart')
          let cart = savedCart ? JSON.parse(savedCart) : []

          const existingItemIndex = cart.findIndex(item =>
            item.id === product.id &&
            item.color === selectedColor &&
            item.size === selectedSize
          )

          if (existingItemIndex >= 0) {
            cart[existingItemIndex].quantity += quantity
            toast.success(`🛒 ${product.name} quantity updated in cart (offline)`, {
              position: "top-right",
              autoClose: 2000,
              icon: "🛒"
            });
          } else {
            cart.push(cartItem)
            toast.success(`🛒 ${product.name} added to cart (offline)`, {
              position: "top-right",
              autoClose: 2000,
              icon: "🛒"
            });
          }

          localStorage.setItem('cart', JSON.stringify(cart))

          const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

          window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
              cart: cart,
              count: totalQuantity
            }
          }))
        }
      } else {
        const savedCart = localStorage.getItem('cart')
        let cart = savedCart ? JSON.parse(savedCart) : []

        const existingItemIndex = cart.findIndex(item =>
          item.id === product.id &&
          item.color === selectedColor &&
          item.size === selectedSize
        )

        if (existingItemIndex >= 0) {
          cart[existingItemIndex].quantity += quantity
          toast.success(`🛒 ${product.name} quantity updated in cart`, {
            position: "top-right",
            autoClose: 2000,
            icon: "🛒"
          });
        } else {
          cart.push(cartItem)
          toast.success(`🛒 ${product.name} added to cart`, {
            position: "top-right",
            autoClose: 2000,
            icon: "🛒"
          });
        }

        localStorage.setItem('cart', JSON.stringify(cart))

        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: {
            cart: cart,
            count: totalQuantity
          }
        }))
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You are in view-only mode', {
          position: "top-right",
          autoClose: 3000,
          icon: "👑"
        });
      } else {
        toast.error('Failed to add to cart', {
          position: "top-right",
          autoClose: 2000
        });
      }
    } finally {
      setAddingToCart(false)
    }
  }

  // Updated handleBuyNow with admin check and login check
  const handleBuyNow = async () => {
    if (!product) return

    // Check if user is not logged in
    if (!isAuthenticated) {
      toast.warning('🛒 Please login to proceed to checkout', {
        position: "top-right",
        autoClose: 2000,
        icon: "🛒"
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if user is admin (role 1)
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
      const cartItem = {
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.selling_price || product.price,
        selling_price: product.selling_price || product.price,
        quantity: quantity,
        image: product.image_url || product.image,
        image_url: product.image_url || product.image,
        color: selectedColor,
        size: selectedSize,
        stock: product.stock || product.qty || 0
      }

      if (isAuthenticated) {
        try {
          const response = await apiAddToCart(product.id, quantity)
          console.log('Buy now API response:', response)

          // Check for admin error in response
          if (response && response.is_admin_error) {
            toast.info('👑 Admin: You cannot proceed to checkout - You are checking the website, not making a purchase', {
              position: "top-right",
              autoClose: 5000,
              icon: "👑"
            })
            return
          }

          const savedCart = localStorage.getItem('cart')
          let cart = savedCart ? JSON.parse(savedCart) : []

          const existingItemIndex = cart.findIndex(item =>
            item.id === product.id &&
            item.color === selectedColor &&
            item.size === selectedSize
          )

          if (existingItemIndex >= 0) {
            cart[existingItemIndex].quantity += quantity
          } else {
            cart.push(cartItem)
          }

          localStorage.setItem('cart', JSON.stringify(cart))

          const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

          window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
              cart: cart,
              count: totalQuantity
            }
          }))

          navigate('/checkout')

        } catch (apiError) {
          console.error('API buy now error:', apiError)

          // Check for admin error in error response
          if (apiError.response?.status === 403) {
            toast.info('👑 Admin: You cannot proceed to checkout - You are checking the website, not making a purchase', {
              position: "top-right",
              autoClose: 5000,
              icon: "👑"
            })
            return
          }

          const savedCart = localStorage.getItem('cart')
          let cart = savedCart ? JSON.parse(savedCart) : []

          const existingItemIndex = cart.findIndex(item =>
            item.id === product.id &&
            item.color === selectedColor &&
            item.size === selectedSize
          )

          if (existingItemIndex >= 0) {
            cart[existingItemIndex].quantity += quantity
          } else {
            cart.push(cartItem)
          }

          localStorage.setItem('cart', JSON.stringify(cart))

          navigate('/checkout')
        }
      } else {
        const savedCart = localStorage.getItem('cart')
        let cart = savedCart ? JSON.parse(savedCart) : []

        const existingItemIndex = cart.findIndex(item =>
          item.id === product.id &&
          item.color === selectedColor &&
          item.size === selectedSize
        )

        if (existingItemIndex >= 0) {
          cart[existingItemIndex].quantity += quantity
        } else {
          cart.push(cartItem)
        }

        localStorage.setItem('cart', JSON.stringify(cart))

        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)

        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: {
            cart: cart,
            count: totalQuantity
          }
        }))

        navigate('/checkout')
      }
    } catch (error) {
      console.error('Error in buy now:', error)
      
      if (error.response?.status === 403) {
        toast.info('👑 Admin: You cannot proceed to checkout - You are checking the website, not making a purchase', {
          position: "top-right",
          autoClose: 5000,
          icon: "👑"
        })
      } else {
        toast.error('Failed to process buy now', {
          position: "top-right",
          autoClose: 2000
        })
      }
    } finally {
      setAddingToCart(false)
    }
  }

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
    if (product.sizes && Array.isArray(product.sizes)) {
      return product.sizes
    }
    if (product.size) {
      if (typeof product.size === 'string') {
        return product.size.split(',').map(s => s.trim())
      }
      if (Array.isArray(product.size)) {
        return product.size
      }
    }
    return []
  }

  const getFeatures = (product) => {
    const features = []
    if (product.features && Array.isArray(product.features)) {
      features.push(...product.features)
    }
    if (product.material) features.push(`Material: ${product.material}`)
    if (product.weight) features.push(`Weight: ${product.weight}`)
    if (product.warranty) features.push(`Warranty: ${product.warranty}`)

    return features.length > 0 ? features : ['Premium quality', '100% genuine', 'Secure packaging']
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

  // Loader component
  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading product details...</p>
        </div>
      </Container>
    )
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

  const price = product.selling_price || product.price || 0
  const originalPrice = getOriginalPrice(product)
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null
  const inStock = (product.stock > 0 || product.qty > 0)
  const images = getProductImages(product)
  const colors = getColors(product)
  const sizes = getSizes(product)
  const features = getFeatures(product)
  const categoryName = getCategoryName(product)
  const deliveryDate = calculateDeliveryDate()

  // Get descriptions
  const smallDescription = product.small_description || product.short_description || ''
  const fullDescription = product.description || product.long_description || product.details || ''

  return (
    <Container>
      <div className="py-4 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs sm:text-sm mb-4 sm:mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm dark:shadow-gray-900/20 overflow-x-auto whitespace-nowrap scrollbar-hide border border-gray-200 dark:border-gray-700">
          <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            Home
          </Link>
          <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400 dark:text-gray-600 flex-shrink-0" />
          <Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Products</Link>
          <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400 dark:text-gray-600 flex-shrink-0" />
          <Link to={`/products?category=${categoryName.toLowerCase()}`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {categoryName}
          </Link>
          <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400 dark:text-gray-600 flex-shrink-0" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[120px] sm:max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Badges */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 flex gap-1 sm:gap-2">
                {discount && !isAdmin && (
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-lg flex items-center gap-0.5 sm:gap-1">
                    <FireIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {discount}% OFF
                  </div>
                )}
                {!inStock && (
                  <div className="bg-gray-900/90 dark:bg-black/90 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm">
                    Out of Stock
                  </div>
                )}
                {isAdmin && (
                  <div className="bg-yellow-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-lg flex items-center gap-0.5 sm:gap-1">
                    <span>👑</span>
                    Admin View
                  </div>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-2 sm:top-4 right-2 sm:right-4 z-10 p-2 sm:p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-gray-700 ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isAdmin}
                title={!isAuthenticated ? "Login to add to wishlist" : (isAdmin ? "Admins cannot add to wishlist" : "")}
              >
                {isInWishlist ? (
                  <HeartIconSolid className={`w-4 h-4 sm:w-5 sm:h-5 ${isAdmin ? 'text-gray-400' : 'text-red-500'}`} />
                ) : (
                  <HeartIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isAdmin ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`} />
                )}
              </button>

              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[380px] lg:h-[440px] flex items-center justify-center p-4 sm:p-8">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className={`max-w-full max-h-full object-contain transition-all duration-500 hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=3B82F6&color=fff&size=400&length=2&font-size=0.4`
                    setImageLoaded(true)
                  }}
                />
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index)
                      setImageLoaded(false)
                    }}
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 border ${selectedImage === index
                      ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900 scale-105 border-transparent'
                      : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover dark:bg-gray-800"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title & Category */}
            <div>
              {product.brand && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-2">
                  <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{product.brand}</span>
                </div>
              )}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Category Display */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs sm:text-sm font-medium shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-600">
                  {categoryName}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs sm:text-sm font-medium">
                    👑 Admin View Only
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className={`bg-gradient-to-r ${isAdmin ? 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' : 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'} p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${isAdmin ? 'border-yellow-200 dark:border-yellow-800/30' : 'border-blue-100 dark:border-blue-800/30'}`}>
              <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(price)}
                </span>
                {originalPrice && originalPrice > price && !isAdmin && (
                  <>
                    <span className="text-base sm:text-lg lg:text-xl text-gray-400 dark:text-gray-500 line-through">
                      {formatCurrency(originalPrice)}
                    </span>
                    <span className="bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md">
                      Save {formatCurrency(originalPrice - price)}
                    </span>
                  </>
                )}
              </div>
              {!isAdmin ? (
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1.5 sm:mt-2 flex items-center gap-1">
                  <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Inclusive of all taxes
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 mt-1.5 sm:mt-2 flex items-center gap-1">
                  <span>👑</span>
                  Admin viewing mode - no purchases allowed
                </p>
              )}
            </div>

            {/* Small Description */}
            {smallDescription && !isAdmin && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-start gap-2 sm:gap-3">
                  <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-purple-800 dark:text-purple-300">{smallDescription}</p>
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  Available Colors
                </h3>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => !isAdmin && setSelectedColor(color)}
                      className={`group relative w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 border-2 ${selectedColor === color
                        ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900 scale-110 border-white dark:border-gray-900'
                        : 'border-gray-200 dark:border-gray-700 hover:scale-105'
                        } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      disabled={isAdmin}
                    >
                      {selectedColor === color && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <CheckBadgeIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-lg" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  Select Size
                </h3>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => !isAdmin && setSelectedSize(size)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${selectedSize === size
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isAdmin}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl w-full sm:w-auto border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => !isAdmin && setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-xl transition-colors disabled:opacity-50 text-lg sm:text-xl"
                    disabled={!inStock || addingToCart || isAdmin}
                  >
                    <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="w-12 sm:w-14 text-center font-medium text-gray-900 dark:text-white text-base sm:text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => !isAdmin && setQuantity(q => q + 1)}
                    className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-xl transition-colors disabled:opacity-50 text-lg sm:text-xl"
                    disabled={!inStock || addingToCart || (product.stock && quantity >= product.stock) || isAdmin}
                  >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart || isAdmin}
                  className={`flex-1 h-10 sm:h-12 rounded-xl font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 text-sm sm:text-base ${inStock && !isAdmin
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                      : isAdmin
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed border border-gray-400 dark:border-gray-600'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-gray-700'
                    }`}
                  title={!isAuthenticated ? "Login to add to cart" : (isAdmin ? "Admins cannot add to cart" : "")}
                >
                  {addingToCart ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Adding...
                    </>
                  ) : isAdmin ? (
                    'Admin View Only'
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-4 h-[32px] sm:w-5 sm:h-9" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!inStock || addingToCart || isAdmin}
                className={`w-full h-10 sm:h-12 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${inStock && !isAdmin
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-xl border-2 border-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    : isAdmin
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed border border-gray-400 dark:border-gray-600'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-gray-700'
                  }`}
                title={!isAuthenticated ? "Login to buy" : (isAdmin ? "Admins cannot make purchases" : "")}
              >
                {isAdmin ? 'Admin View Only' : 'Buy Now'}
              </button>
            </div>

            {/* Delivery & Services */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
                  <TruckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs sm:text-sm font-medium">Delivery</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{deliveryDate}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
                  <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs sm:text-sm font-medium">Returns</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">7 days</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs sm:text-sm font-medium">Warranty</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">1 year</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">
                  <GiftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs sm:text-sm font-medium">Gift</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Available</p>
              </div>
            </div>

            {/* Stock Status */}
            <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border ${inStock
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${inStock
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                  }`} />
                <span className={`text-xs sm:text-sm font-medium ${inStock
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                  }`}>
                  {inStock
                    ? `✓ In Stock (${product.stock || 'Available'})`
                    : '× Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-10 sm:mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 scrollbar-hide">
              {['description', 'features', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium capitalize whitespace-nowrap transition-all relative ${activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {tab}
                  {tab === 'reviews' && reviewStats.total > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px]">
                      {reviewStats.total}
                    </span>
                  )}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <>
                  {fullDescription ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className={`prose max-w-none text-sm sm:text-base transition-all duration-500 ${showFullDescription ? 'max-h-[1000px]' : 'max-h-[150px] sm:max-h-[200px] overflow-hidden'
                        }`}>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {fullDescription}
                        </p>
                      </div>
                      {fullDescription.length > 200 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1.5 sm:gap-2 transition-all hover:gap-2 sm:hover:gap-3 text-xs sm:text-sm"
                        >
                          {showFullDescription ? 'Show Less' : 'Read More'}
                          <ChevronRightIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFullDescription ? 'rotate-90' : ''
                            }`} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No description available.</p>
                  )}
                </>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                        <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === 'specifications' && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Category</span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">{categoryName}</span>
                  </div>
                  {product.brand && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Brand</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">{product.brand}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Material</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">{product.material}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-32">Weight</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mt-0.5 sm:mt-0">{product.weight}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab - Professional & Attractive Version */}
              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {/* Header with Gradient Background */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10"></div>
                    
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                          <StarIcon className="w-6 h-6 text-yellow-300" />
                          Customer Reviews
                        </h3>
                        <p className="text-blue-100 mt-1">What our customers say about this product</p>
                      </div>
                      
                      {/* Review Button */}
                      {!isAdmin && isAuthenticated && canReview.can_review && (
                        <button
                          onClick={openReviewModal}
                          className="group relative px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <PencilSquareIcon className="w-4 h-4" />
                            Write a Review
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Average Rating Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                          {reviewStats.average}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {renderStars(Math.round(reviewStats.average), 'large')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Based on {reviewStats.total} {reviewStats.total === 1 ? 'review' : 'reviews'}
                        </div>
                      </div>
                    </div>

                    {/* Rating Distribution Card */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Rating Distribution</h4>
                      <div className="space-y-3">
                        {[5,4,3,2,1].map((rating) => {
                          const count = reviewStats.distribution[rating] || 0
                          const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-16">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating}</span>
                                <StarIconSolid className="w-4 h-4 text-yellow-400" />
                              </div>
                              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-2 w-20">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                                <span className="text-xs text-gray-500">({Math.round(percentage)}%)</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Reviews
                      <span className="ml-2 text-sm font-normal text-gray-500">({reviews.length})</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Sorted by latest</span>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <>
                      <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                        {reviews.map((review) => (
                          <div key={review.id} className="pt-4 first:pt-0">
                            {/* Name at the TOP */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
                                  {review.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {review.user?.name || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatReviewDate(review.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Rating in the MIDDLE (below name) */}
                            <div className="ml-10 mt-2">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating, 'small')}
                              </div>
                            </div>
                            
                            {/* Comment at the BOTTOM */}
                            {review.comment && (
                              <div className="ml-10 mt-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {review.comment}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* View All Reviews Link */}
                      {reviews.length > 5 && (
                        <div className="text-center pt-4">
                          <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group">
                            View All Reviews
                            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Reviews Yet
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Be the first to share your experience with this product and help others make an informed decision.
                      </p>
                      {isAuthenticated && canReview.can_review && !isAdmin && (
                        <button
                          onClick={openReviewModal}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          Write Your Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                You might also like
              </h2>
              <Link
                to={`/products?category=${categoryName.toLowerCase()}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5 sm:gap-1 group text-xs sm:text-sm"
              >
                View All
                <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map(related => {
                const relatedPrice = related.selling_price || related.price || 0
                const relatedOriginal = getOriginalPrice(related)
                const relatedDiscount = relatedOriginal && relatedOriginal > relatedPrice
                  ? Math.round(((relatedOriginal - relatedPrice) / relatedOriginal) * 100)
                  : null

                return (
                  <Link
                    to={`/products/${related.id}`}
                    key={related.id}
                    className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-2 sm:p-4">
                      {relatedDiscount && !isAdmin && (
                        <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
                          -{relatedDiscount}%
                        </span>
                      )}
                      <img
                        src={related.image_url || related.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(related.name)}&background=3B82F6&color=fff&size=200`}
                        alt={related.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 dark:brightness-90"
                      />
                    </div>
                    <div className="p-2 sm:p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {related.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {formatCurrency(relatedPrice)}
                        </span>
                        {relatedOriginal && relatedOriginal > relatedPrice && !isAdmin && (
                          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 line-through">
                            {formatCurrency(relatedOriginal)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Review Modal - Hide for admin */}
        {!isAdmin && (
          <Transition appear show={isReviewModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeReviewModal}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Write a Review
                        </Dialog.Title>
                        <button
                          onClick={closeReviewModal}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Not eligible to review message */}
                      {isAuthenticated && !canReview.can_review && (
                        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                            <TruckIcon className="w-5 h-5" />
                            {!canReview.has_purchased
                              ? 'You can only review this product after it has been delivered.'
                              : 'You have already reviewed this product.'}
                          </p>
                        </div>
                      )}

                      {/* Login required message */}
                      {!isAuthenticated && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                            <UserCircleIcon className="w-5 h-5" />
                            Please login to write a review.
                          </p>
                          <button
                            onClick={() => {
                              closeReviewModal()
                              navigate('/login')
                            }}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Go to Login
                          </button>
                        </div>
                      )}

                      {/* Review Form */}
                      {isAuthenticated && canReview.can_review && (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Your Rating <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 justify-center">
                              {renderInteractiveStars()}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Your Review
                            </label>
                            <textarea
                              value={reviewFormData.comment}
                              onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                              placeholder="Share your experience with this product... (optional)"
                              maxLength={1000}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                              {reviewFormData.comment.length}/1000
                            </p>
                          </div>

                          <div className="flex gap-3 mt-6">
                            <button
                              type="submit"
                              disabled={submittingReview || reviewFormData.rating === 0}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {submittingReview ? (
                                <span className="flex items-center justify-center gap-2">
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                  Submitting...
                                </span>
                              ) : (
                                'Submit Review'
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={closeReviewModal}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        )}
      </div>
    </Container>
  )
}

export default ProductDetails