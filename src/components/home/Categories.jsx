import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Container from '../layout/Container';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const API_URL = "http://localhost:8000";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API_URL}/api/categories`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response:', res.data);
      
      // Extract categories from response
      let categoriesData = [];
      if (res.data && res.data.data) {
        categoriesData = res.data.data;
      } else if (res.data && res.data.categories) {
        categoriesData = res.data.categories;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      }
      
      // Filter only active categories for frontend
      const activeCategories = categoriesData.filter(cat => 
        cat.status === 1 || cat.status === true
      );
      
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Function to get image URL
  const getImageUrl = (category) => {
    if (!category || !category.image) {
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(category?.name || 'Category')}`;
    }

    // If image_url is provided directly
    if (category.image_url) {
      return category.image_url;
    }

    const imagePath = category.image;
    
    // If it's already a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Remove any 'public/' prefix if present
    const cleanPath = imagePath.replace('public/', '');
    
    // Return the storage path
    return `${API_URL}/storage/${cleanPath}`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Loading categories...
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-2xl">
              <p className="text-lg font-medium mb-2">Error Loading Categories</p>
              <p className="text-sm mb-4">{error}</p>
              <button 
                onClick={fetchCategories}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              No categories available at the moment
            </p>
          </div>
          
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400">Categories will appear here once added</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse through our wide range of categories to find exactly what you're looking for
          </p>
        </div>
        
        {/* Categories Slider */}
        <div className="relative px-4 md:px-10">
          {/* Custom Navigation Buttons */}
          <button 
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:text-gray-300 dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:text-gray-300 dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={categories.length > 4}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 25,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            className="categories-swiper"
          >
            {categories.map(category => (
              <SwiperSlide key={category.id}>
                <Link 
                  to={`/category/${category.slug}`} // Using slug instead of name
                  className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Category Image */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img
                      src={getImageUrl(category)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(category.name)}`;
                      }}
                    />
                    
                    {/* Overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Popular Badge */}
                    {(category.popular === 1 || category.popular === true) && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                        🔥 Popular
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="p-4 md:p-5 text-center">
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    {/* Product Count (if available) */}
                    {category.products_count > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 md:mt-3">
                        {category.products_count} Products
                      </p>
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>

      {/* Custom styles for Swiper */}
      <style jsx>{`
        .categories-swiper {
          padding: 10px 5px 40px 5px;
        }
        
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s ease;
        }
        
        .dark .swiper-pagination-bullet {
          background: #4b5563;
        }
        
        .swiper-pagination-bullet-active {
          width: 20px;
          background: #3b82f6;
          border-radius: 4px;
        }
        
        .dark .swiper-pagination-bullet-active {
          background: #60a5fa;
        }
        
        .swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 640px) {
          .categories-swiper {
            padding: 10px 5px 30px 5px;
          }
        }
      `}</style>
    </section>
  );
}