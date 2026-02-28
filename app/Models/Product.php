<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

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
        'product_images'
    ];

    protected $casts = [
        'status' => 'boolean',
        'trending' => 'boolean',
        'product_images' => 'array' // Cast JSON to array
    ];

    // Relationship with Category
    public function category()
    {
        return $this->belongsTo(Category::class, 'cate_id');
    }
     public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function approvedReviews()
    {
        return $this->hasMany(ProductReview::class)->where('is_approved', true);
    }

    public function getAverageRatingAttribute()
    {
        return $this->approvedReviews()->avg('rating') ?? 0;
    }

    public function getReviewsCountAttribute()
    {
        return $this->approvedReviews()->count();
    }

    // Get rating distribution
    public function getRatingDistributionAttribute()
    {
        $ratings = [];
        for ($i = 1; $i <= 5; $i++) {
            $ratings[$i] = $this->approvedReviews()->where('rating', $i)->count();
        }
        return $ratings;
    }
}