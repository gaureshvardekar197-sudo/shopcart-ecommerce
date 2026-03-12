<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'cate_id',
        'name',
        'slug',
        'original_price',
        'selling_price',
        'qty',
        'tax',
        'status',
        'trending',
        'small_description',
        'description',
        'meta_title',
        'meta_keywords',
        'meta_description',
        'image',
        'product_images',
    ];

    protected $casts = [
        'status' => 'boolean',
        'trending' => 'boolean',
        'product_images' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'cate_id');
    }

    // Relationship with product sizes
    public function sizes()
    {
        return $this->hasMany(ProductSize::class);
    }

    // Check if product has sizes
    public function hasSizes()
    {
        return $this->sizes()->exists();
    }

    // Get available sizes with stock and prices
    public function getAvailableSizesAttribute()
    {
        return $this->sizes()
            ->where('stock', '>', 0)
            ->get()
            ->map(function($size) {
                return [
                    'id' => $size->id,
                    'size' => $size->size,
                    'stock' => $size->stock,
                    'size_category' => $size->size_category,
                    'price' => $size->effective_price,
                    'original_price' => $size->effective_original_price,
                    'price_adjustment' => $size->price_adjustment,
                    'has_discount' => $size->has_discount,
                    'discount_percentage' => $size->discount_percentage
                ];
            });
    }

    // Get size details by size value
    public function getSizeDetails($size)
    {
        return $this->sizes()->where('size', $size)->first();
    }

    // Get total stock from all sizes
    public function getTotalStockAttribute()
    {
        return $this->sizes()->sum('stock');
    }

    // Update product quantity based on sizes
    public function updateTotalQuantity()
    {
        $this->qty = $this->total_stock;
        $this->save();
    }

    // Get minimum price among sizes
    public function getMinSizePriceAttribute()
    {
        return $this->sizes()->min('selling_price') ?? $this->selling_price;
    }

    // Get maximum price among sizes
    public function getMaxSizePriceAttribute()
    {
        return $this->sizes()->max('selling_price') ?? $this->selling_price;
    }

    // Check if product has variable pricing
    public function getHasVariablePricingAttribute()
    {
        if (!$this->hasSizes()) {
            return false;
        }
        
        $prices = $this->sizes()->pluck('selling_price')->filter()->values();
        
        if ($prices->isEmpty()) {
            return false;
        }
        
        return $prices->unique()->count() > 1;
    }

    // Get price range text
    public function getPriceRangeAttribute()
    {
        if (!$this->has_variable_pricing) {
            return null;
        }
        
        return [
            'min' => $this->min_size_price,
            'max' => $this->max_size_price,
            'text' => '₹' . $this->min_size_price . ' - ₹' . $this->max_size_price
        ];
    }
}