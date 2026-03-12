import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

function FilterSidebar({ categories, selectedCategory, onCategoryChange, onClose, isMobile }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 sticky top-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FunnelIcon className="w-4 h-4" />
          Filters
        </h3>
        {isMobile && (
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 text-sm">Categories</h4>
        <div className="space-y-1.5">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                onCategoryChange(category)
                if (isMobile) onClose()
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border-l-3 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterSidebar