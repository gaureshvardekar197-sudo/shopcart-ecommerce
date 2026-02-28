<?php
// app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'user_id',
        'shipping_address',
        'billing_address',
        'subtotal',
        'delivery_charge',
        'total',
        'payment_method',
        'status',
        'delivery_instructions'
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'subtotal' => 'float',
        'delivery_charge' => 'float',
        'total' => 'float'
    ];

    protected $attributes = [
        'status' => 'pending',
        'delivery_charge' => 0
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}