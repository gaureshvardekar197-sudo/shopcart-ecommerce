<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSize extends Model
{
    use HasFactory;

    protected $table = 'product_sizes';

    protected $fillable = [
        'product_id',
        'size_category',
        'size',
        'stock',
        'price',
        'original_price',
        'selling_price',
        'price_adjustment'
    ];

    protected $casts = [
        'stock' => 'integer',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'price_adjustment' => 'decimal:2'
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Scope for available sizes
    public function scopeAvailable($query)
    {
        return $query->where('stock', '>', 0);
    }

    // Scope by size category
    public function scopeByCategory($query, $category)
    {
        return $query->where('size_category', $category);
    }

    // Check if size is in stock
    public function getIsInStockAttribute()
    {
        return $this->stock > 0;
    }

    // Get size category label
    public function getSizeCategoryLabelAttribute()
    {
        $categories = [
            'clothing' => 'Clothing',
            'shoes' => 'Shoes',
            'kids' => 'Kids',
            'numeric' => 'Numeric'
        ];
        
        return $categories[$this->size_category] ?? $this->size_category;
    }

    // Get effective price (size-specific price or product base price)
    public function getEffectivePriceAttribute()
    {
        if ($this->selling_price !== null) {
            return $this->selling_price;
        }
        
        if ($this->price !== null) {
            return $this->price;
        }
        
        if ($this->price_adjustment != 0) {
            return $this->product->selling_price + $this->price_adjustment;
        }
        
        return $this->product->selling_price;
    }

    // Get effective original price
    public function getEffectiveOriginalPriceAttribute()
    {
        if ($this->original_price !== null) {
            return $this->original_price;
        }
        
        if ($this->price_adjustment != 0) {
            return $this->product->original_price + $this->price_adjustment;
        }
        
        return $this->product->original_price;
    }

    // Check if size has discount
    public function getHasDiscountAttribute()
    {
        return $this->effective_original_price > $this->effective_price;
    }

    // Get discount percentage
    public function getDiscountPercentageAttribute()
    {
        if (!$this->has_discount || $this->effective_original_price == 0) {
            return 0;
        }
        
        return round((($this->effective_original_price - $this->effective_price) / $this->effective_original_price) * 100);
    }

    // Decrease stock
    public function decreaseStock($quantity)
    {
        if ($this->stock >= $quantity) {
            $this->stock -= $quantity;
            $this->save();
            
            // Update parent product total stock
            if (method_exists($this->product, 'updateTotalQuantity')) {
                $this->product->updateTotalQuantity();
            }
            
            return true;
        }
        return false;
    }

    // Increase stock
    public function increaseStock($quantity)
    {
        $this->stock += $quantity;
        $this->save();
        
        // Update parent product total stock
        if (method_exists($this->product, 'updateTotalQuantity')) {
            $this->product->updateTotalQuantity();
        }
        
        return true;
    }
}