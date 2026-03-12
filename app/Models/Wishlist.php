<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'size_id'
    ];

    protected $with = ['product', 'size'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    public function size()
    {
        return $this->belongsTo(ProductSize::class, 'size_id');
    }
}