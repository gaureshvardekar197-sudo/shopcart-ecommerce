import ProductCard from './ProductCard'

function ProductGrid({
  products,
  formatCurrency,
  getCategoryName,
  calculateDiscount,
  isInStock,
  getOriginalPrice,
  wishlist,
  cart,
  onToggleWishlist,
  onAddToCart,
  isAuthenticated,
  addingToCart,
  isAdmin
}) {
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId)
  }

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  // Get default size price for a product
  const getDefaultSizePrice = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0]
      return defaultSize?.selling_price || defaultSize?.price || product.selling_price || product.price || 0
    }
    return product.selling_price || product.price || 0
  }

  // Get default size original price - FIXED VERSION
  const getDefaultSizeOriginalPrice = (product) => {
    // First check if product has sizes
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0]
      
      // Check size-specific original price
      if (defaultSize?.original_price && defaultSize.original_price > 0) {
        return Number(defaultSize.original_price)
      }
      if (defaultSize?.effective_original_price && defaultSize.effective_original_price > 0) {
        return Number(defaultSize.effective_original_price)
      }
    }
    
    // If no size original price, get product's original price
    const productOriginalPrice = getOriginalPrice(product)
    if (productOriginalPrice && productOriginalPrice > 0) {
      return Number(productOriginalPrice)
    }
    
    // Return 0 instead of null to ensure price comparison works
    return 0
  }

  // Calculate discount based on default size - FIXED VERSION
  const calculateDefaultSizeDiscount = (product) => {
    const price = getDefaultSizePrice(product)
    const originalPrice = getDefaultSizeOriginalPrice(product)
    
    // Only calculate discount if original price exists and is greater than selling price
    if (originalPrice && originalPrice > 0 && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100)
    }
    return 0
  }

  // Check stock based on default size
  const isDefaultSizeInStock = (product) => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.is_in_stock) || product.sizes[0]
      return defaultSize?.stock > 0
    }
    return isInStock(product)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => {
        const defaultSizePrice = getDefaultSizePrice(product)
        const defaultSizeOriginalPrice = getDefaultSizeOriginalPrice(product)
        const discount = calculateDefaultSizeDiscount(product)
        const inStock = isDefaultSizeInStock(product)
        const isInWishlist = wishlist.some(item => item.id === product.id)
        const inCart = isInCart(product.id)
        const cartQuantity = getCartQuantity(product.id)

        // Debug log to check values
        console.log(`Product: ${product.name}`, {
          price: defaultSizePrice,
          originalPrice: defaultSizeOriginalPrice,
          discount,
          inStock
        })

        return (
          <ProductCard
            key={product.id}
            product={product}
            discount={discount}
            inStock={inStock}
            price={defaultSizePrice}
            originalPrice={defaultSizeOriginalPrice}
            formatCurrency={formatCurrency}
            getCategoryName={getCategoryName}
            isInWishlist={isInWishlist}
            inCart={inCart}
            cartQuantity={cartQuantity}
            onToggleWishlist={() => onToggleWishlist(product)}
            onAddToCart={(e) => onAddToCart(product, e)}
            isAuthenticated={isAuthenticated}
            addingToCart={addingToCart[product.id]}
            isAdmin={isAdmin}
            defaultSize={product?.sizes?.[0]?.size} // Pass default size
          />
        )
      })}
    </div>
  )
}

export default ProductGrid