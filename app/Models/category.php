<?php
// app/Models/Category.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'status',
        'popular',
        'image'
    ];

    protected $casts = [
        'status' => 'boolean',
        'popular' => 'boolean'
    ];

    // Relationship with products (if needed)
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Accessor for image URL
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}