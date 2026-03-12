function ProductsHeader({ isAdmin }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        All Products
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400">
        Browse our collection of premium products
      </p>
      {isAdmin && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
          <span>👑</span> You are in admin mode - viewing only
        </p>
      )}
    </div>
  )
}

export default ProductsHeader