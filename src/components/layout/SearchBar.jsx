// components/SearchBar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  CubeIcon,
  TagIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  ChevronRightIcon,
  TrashIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { getProducts } from '../API/api-products';
import { getCategories } from '../API/api-categories';
import { toast } from 'react-toastify';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
    recent: []
  });
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const loadAttempted = useRef(false);

  // Load all products and categories once when component mounts
  useEffect(() => {
    if (!loadAttempted.current) {
      loadAttempted.current = true;
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    setIsInitialLoading(true);
    setConnectionError(false);
    
    try {
      console.log('Loading initial data for search...');
      
      // Use Promise.allSettled to handle individual failures
      const [productsResult, categoriesResult] = await Promise.allSettled([
        getProducts({ limit: 100 }).catch(err => {
          console.error('Products API failed:', err);
          return { data: [] };
        }),
        getCategories({ limit: 100 }).catch(err => {
          console.error('Categories API failed:', err);
          return { data: [] };
        })
      ]);

      // Process products response
      let products = [];
      if (productsResult.status === 'fulfilled' && productsResult.value) {
        const productsRes = productsResult.value;
        if (productsRes?.data && Array.isArray(productsRes.data)) {
          products = productsRes.data;
        } else if (Array.isArray(productsRes)) {
          products = productsRes;
        } else if (productsRes?.products && Array.isArray(productsRes.products)) {
          products = productsRes.products;
        }
      }
      setAllProducts(products);

      // Process categories response
      let categories = [];
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value) {
        const categoriesRes = categoriesResult.value;
        if (categoriesRes?.data && Array.isArray(categoriesRes.data)) {
          categories = categoriesRes.data;
        } else if (Array.isArray(categoriesRes)) {
          categories = categoriesRes;
        } else if (categoriesRes?.categories && Array.isArray(categoriesRes.categories)) {
          categories = categoriesRes.categories;
        }
      }
      setAllCategories(categories);

      // Show warning if one of the APIs failed
      if (productsResult.status === 'rejected' || categoriesResult.status === 'rejected') {
        setConnectionError(true);
        toast.warning('Some search features may be limited', {
          position: 'top-right',
          autoClose: 5000
        });
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      setConnectionError(true);
      toast.error('Failed to load search data. Please refresh the page.', {
        position: 'top-right',
        autoClose: 5000
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Retry loading data if failed
  const retryLoadData = () => {
    loadAttempted.current = false;
    loadAllData();
  };

  // Load recent searches from localStorage
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setSuggestions(prev => ({ ...prev, recent }));
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search with client-side filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        filterSuggestions();
      } else {
        setSuggestions(prev => ({ ...prev, products: [], categories: [] }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, allProducts, allCategories]);

  const filterSuggestions = () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const term = searchTerm.toLowerCase().trim();
      
      // Filter products client-side
      const filteredProducts = allProducts.filter(product => {
        const name = product.name?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const category = product.category_name?.toLowerCase() || '';
        
        return name.includes(term) || 
               description.includes(term) || 
               category.includes(term);
      });

      // Filter categories client-side
      const filteredCategories = allCategories.filter(category => {
        const name = category.name?.toLowerCase() || '';
        const description = category.description?.toLowerCase() || '';
        
        return name.includes(term) || description.includes(term);
      });

      setSuggestions(prev => ({
        ...prev,
        products: filteredProducts.slice(0, 5),
        categories: filteredCategories.slice(0, 5)
      }));

    } catch (error) {
      console.error('Filter error:', error);
      setError('Failed to filter suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecentSearch = (term) => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updated = [term, ...recent.filter(t => t !== term)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setSuggestions(prev => ({ ...prev, recent: updated }));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const removeRecentSearch = (termToRemove, e) => {
    e.stopPropagation();
    try {
      const recent = suggestions.recent.filter(term => term !== termToRemove);
      localStorage.setItem('recentSearches', JSON.stringify(recent));
      setSuggestions(prev => ({ ...prev, recent }));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const clearAllRecentSearches = () => {
    try {
      localStorage.removeItem('recentSearches');
      setSuggestions(prev => ({ ...prev, recent: [] }));
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleProductClick = (product) => {
    setShowSuggestions(false);
    setSearchTerm('');
    navigate(`/products/${product.id}`);
  };

  const handleCategoryClick = (category) => {
    setShowSuggestions(false);
    setSearchTerm('');
    const categoryPath = category.slug ? `/category/${category.slug}` : `/category/${category.id}`;
    navigate(categoryPath);
  };

  const handleRecentClick = (term) => {
    setShowSuggestions(false);
    setSearchTerm(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions(prev => ({ ...prev, products: [], categories: [] }));
    setError('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const totalItems = 
      (suggestions.products?.length || 0) + 
      (suggestions.categories?.length || 0) + 
      (suggestions.recent?.length || 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      let index = 0;
      
      // Recent searches
      if (index <= activeIndex && activeIndex < index + (suggestions.recent?.length || 0)) {
        const recentIndex = activeIndex - index;
        const recent = suggestions.recent[recentIndex];
        handleRecentClick(recent);
        return;
      }
      index += suggestions.recent?.length || 0;
      
      // Products
      if (index <= activeIndex && activeIndex < index + (suggestions.products?.length || 0)) {
        const productIndex = activeIndex - index;
        const product = suggestions.products[productIndex];
        handleProductClick(product);
        return;
      }
      index += suggestions.products?.length || 0;
      
      // Categories
      if (index <= activeIndex && activeIndex < index + (suggestions.categories?.length || 0)) {
        const categoryIndex = activeIndex - index;
        const category = suggestions.categories[categoryIndex];
        handleCategoryClick(category);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getSuggestionsCount = () => {
    return (
      (suggestions.recent?.length || 0) +
      (suggestions.products?.length || 0) +
      (suggestions.categories?.length || 0)
    );
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Highlight matching text
  const highlightText = (text, highlight) => {
    if (!highlight.trim() || !text) return text;
    try {
      const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) => 
        regex.test(part) ? 
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">{part}</span> : 
          part
      );
    } catch (error) {
      return text;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
          <ExclamationCircleIcon className="h-3 w-3" />
          <span>Search may be limited</span>
          <button 
            onClick={retryLoadData}
            className="underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSearch} className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={isInitialLoading ? "Loading search..." : "Search for products, categories..."}
          className="w-full pl-12 pr-12 py-3.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          disabled={isInitialLoading}
          autoComplete="off"
        />
        
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {isInitialLoading ? (
            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 group-focus-within:scale-110 transition-transform duration-200" />
          )}
        </div>
        
        {searchTerm && !isInitialLoading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && !isInitialLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slideDown">
          
          {/* Error Message */}
          {error && (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              
              {/* Recent Searches */}
              {suggestions.recent?.length > 0 && !searchTerm && (
                <div className="border-b border-gray-100 dark:border-gray-700">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Recent Searches
                    </span>
                    <button
                      onClick={clearAllRecentSearches}
                      className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                      title="Clear all recent searches"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Clear all
                    </button>
                  </div>
                  {suggestions.recent.map((term, idx) => (
                    <div
                      key={idx}
                      className={`group flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        activeIndex === idx ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleRecentClick(term)}
                        className="flex-1 text-left px-4 py-2.5 flex items-center gap-3"
                      >
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                      </button>
                      <button
                        onClick={(e) => removeRecentSearch(term, e)}
                        className="px-3 py-2.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Remove from recent searches"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Product Suggestions */}
              {suggestions.products?.length > 0 && (
                <div className="border-b border-gray-100 dark:border-gray-700">
                  <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 sticky top-0">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Products ({suggestions.products.length})
                    </span>
                  </div>
                  {suggestions.products.map((product, idx) => {
                    const globalIndex = (suggestions.recent?.length || 0) + idx;
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 flex items-center gap-3 transition-colors ${
                          activeIndex === globalIndex ? 'bg-green-50 dark:bg-green-900/20' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          {product.image ? (
                            <img 
                              src={`http://localhost:8000/storage/products/${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=Product';
                              }}
                            />
                          ) : (
                            <CubeIcon className="w-full h-full p-2 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {highlightText(product.name, searchTerm)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {formatPrice(product.selling_price || product.price)}
                            </p>
                            {product.discount_percent > 0 && (
                              <span className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">
                                -{product.discount_percent}%
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Category Suggestions */}
              {suggestions.categories?.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 sticky top-0">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Categories ({suggestions.categories.length})
                    </span>
                  </div>
                  {suggestions.categories.map((category, idx) => {
                    const globalIndex = (suggestions.recent?.length || 0) + 
                                       (suggestions.products?.length || 0) + idx;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 flex items-center gap-3 transition-colors ${
                          activeIndex === globalIndex ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TagIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {highlightText(category.name, searchTerm)}
                          </p>
                          {category.product_count > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {category.product_count} products
                            </p>
                          )}
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {searchTerm.trim().length >= 2 && getSuggestionsCount() === 0 && (
                <div className="p-8 text-center">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No results found for "{searchTerm}"</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try different keywords</p>
                </div>
              )}

              {/* View All Results */}
              {searchTerm.trim().length >= 2 && getSuggestionsCount() > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2.5 text-sm font-medium text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    View all results for "{searchTerm}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;