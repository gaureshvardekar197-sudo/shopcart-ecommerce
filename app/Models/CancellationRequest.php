<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CancellationRequest extends Model
{
    use HasFactory;

    protected $table = 'cancellation_requests';

    protected $fillable = [
        'order_id',
        'user_id',
        'reason',
        'reason_note',
        'status',
        'refund_status',
        'refund_amount',
        'refund_transaction_id',
        'refunded_at',
        'admin_response',
        'processed_by',
        'processed_at'
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
        'refunded_at' => 'datetime',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Constants for status values
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    // Constants for refund status
    const REFUND_PENDING = 'pending';
    const REFUND_PROCESSING = 'processing';
    const REFUND_COMPLETED = 'completed';
    const REFUND_FAILED = 'failed';

    // Constants for cancellation reasons
    const REASON_CHANGED_MIND = 'changed_mind';
    const REASON_WRONG_ITEM = 'wrong_item';
    const REASON_SHIPPING_DELAY = 'shipping_delay';
    const REASON_BETTER_PRICE = 'better_price';
    const REASON_PAYMENT_ISSUE = 'payment_issue';
    const REASON_DUPLICATE_ORDER = 'duplicate_order';
    const REASON_OTHER = 'other';

    /**
     * Get the order associated with this cancellation request
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who made this cancellation request
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who processed this cancellation request
     */
    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Scope a query to only include pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope a query to only include rejected requests
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Check if the request is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if the request is approved
     */
    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if the request is rejected
     */
    public function isRejected()
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if refund is completed
     */
    public function isRefundCompleted()
    {
        return $this->refund_status === self::REFUND_COMPLETED;
    }

    /**
     * Get reason text in readable format
     */
    public function getReasonTextAttribute()
    {
        $reasons = [
            self::REASON_CHANGED_MIND => 'Changed Mind',
            self::REASON_WRONG_ITEM => 'Wrong Item Ordered',
            self::REASON_SHIPPING_DELAY => 'Shipping Delay',
            self::REASON_BETTER_PRICE => 'Found Better Price',
            self::REASON_PAYMENT_ISSUE => 'Payment Issue',
            self::REASON_DUPLICATE_ORDER => 'Duplicate Order',
            self::REASON_OTHER => 'Other'
        ];

        return $reasons[$this->reason] ?? ucfirst(str_replace('_', ' ', $this->reason));
    }

    /**
     * Get status badge class for styling
     */
    public function getStatusBadgeClassAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'bg-yellow-100 text-yellow-800',
            self::STATUS_APPROVED => 'bg-green-100 text-green-800',
            self::STATUS_REJECTED => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    /**
     * Get refund status badge class
     */
    public function getRefundStatusBadgeClassAttribute()
    {
        return match($this->refund_status) {
            self::REFUND_PENDING => 'bg-yellow-100 text-yellow-800',
            self::REFUND_PROCESSING => 'bg-blue-100 text-blue-800',
            self::REFUND_COMPLETED => 'bg-green-100 text-green-800',
            self::REFUND_FAILED => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }
}