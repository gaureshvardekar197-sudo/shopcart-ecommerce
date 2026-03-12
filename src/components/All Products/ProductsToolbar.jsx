import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

function ProductsToolbar({ 
  totalProducts, 
  sortBy, 
  onSortChange, 
  onMobileFilterOpen 
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Products ({totalProducts})
        </h1>
      </div>
      
      {/* Mobile Filter Button */}
      <button
        onClick={onMobileFilterOpen}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm w-full sm:w-auto"
      >
        <FunnelIcon className="w-5 h-5" />
        <span className="font-medium">Filters</span>
      </button>
      
      {/* Sort Dropdown */}
      <div className="relative w-full sm:w-44">
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
        <ChevronDownIcon className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

export default ProductsToolbar