import { useState, useEffect } from 'react';
import sizeApi from '../API/api-Product_sizes';

export const useProductSizes = (productId) => {
  const [sizes, setSizes] = useState([]);
  const [sizeDetails, setSizeDetails] = useState({});
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSizeData, setSelectedSizeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productSizeInfo, setProductSizeInfo] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductSizes();
    }
  }, [productId]);

  useEffect(() => {
    if (selectedSize && sizes.length > 0) {
      const sizeData = sizes.find(s => s.size === selectedSize);
      if (sizeData) {
        setSelectedSizeData(sizeData);
      }
    }
  }, [selectedSize, sizes]);

  const fetchProductSizes = async () => {
    setLoading(true);
    try {
      const response = await sizeApi.getProductSizes(productId);
      
      if (response?.status && response?.data) {
        setProductSizeInfo(response.data.product);
        
        const sizesData = response.data.sizes || [];
        setSizes(sizesData);
        
        const details = {};
        sizesData.forEach(item => {
          details[item.size] = {
            id: item.id,
            size_category: item.size_category,
            price: item.price,
            selling_price: item.selling_price,
            original_price: item.original_price,
            stock: item.stock,
            price_adjustment: item.price_adjustment,
            effective_price: item.effective_price,
            effective_original_price: item.effective_original_price,
            has_discount: item.has_discount,
            discount_percentage: item.discount_percentage,
            is_in_stock: item.is_in_stock
          };
        });
        setSizeDetails(details);
        
        // Auto-select first available size by default
        if (sizesData.length > 0) {
          // Find first size that is in stock
          const firstAvailableSize = sizesData.find(s => s.is_in_stock) || sizesData[0];
          setSelectedSize(firstAvailableSize.size);
          setSelectedSizeData(firstAvailableSize);
        } else {
          setSelectedSize('');
          setSelectedSizeData(null);
        }
      }
    } catch (error) {
      console.error('Error fetching product sizes:', error);
      setSizes([]);
      setSizeDetails({});
      setSelectedSize('');
      setSelectedSizeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const sizeData = sizes.find(s => s.size === size);
    if (sizeData) {
      setSelectedSizeData(sizeData);
    }
  };

  const getPriceForSize = (basePrice) => {
    if (selectedSizeData) {
      return selectedSizeData.selling_price || selectedSizeData.price || basePrice;
    }
    return basePrice;
  };

  const getOriginalPriceForSize = (baseOriginalPrice) => {
    if (selectedSizeData) {
      return selectedSizeData.original_price || selectedSizeData.effective_original_price || baseOriginalPrice;
    }
    return baseOriginalPrice;
  };

  const getStockForSize = () => {
    if (selectedSizeData && selectedSizeData.stock !== undefined) {
      return selectedSizeData.stock;
    }
    return null;
  };

  const hasSizeDiscount = () => {
    return selectedSizeData?.has_discount || false;
  };

  const getSizeDiscountPercentage = () => {
    return selectedSizeData?.discount_percentage || 0;
  };

  const isSizeInStock = () => {
    return selectedSizeData?.is_in_stock || false;
  };

  // Helper to check if product has sizes
  const hasSizes = sizes.length > 0;

  return {
    sizes,
    sizeDetails,
    selectedSize,
    selectedSizeData,
    productSizeInfo,
    hasSizes,
    setSelectedSize: handleSizeSelect,
    getPriceForSize,
    getOriginalPriceForSize,
    getStockForSize,
    hasSizeDiscount,
    getSizeDiscountPercentage,
    isSizeInStock,
    loadingSizes: loading,
    refreshSizes: fetchProductSizes
  };
};