import FilterSidebar from './FilterSidebar'

function MobileFilterModal({ 
  isOpen, 
  onClose, 
  categories, 
  selectedCategory, 
  onCategoryChange 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto p-5">
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          onClose={onClose}
          isMobile={true}
        />
      </div>
    </div>
  )
}

export default MobileFilterModal