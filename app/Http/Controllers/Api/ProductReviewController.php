<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ProductReviewController extends Controller
{
    /**
     * Helper method to check if user is customer (role 0)
     */
    private function checkIsCustomer($user)
    {
        if ($user->role != 0) {
            return response()->json([
                'success' => false,
                'message' => 'Only customers can write reviews'
            ], 403);
        }
        return null;
    }

    /**
     * Helper method to check if user is admin (role 1)
     */
    private function checkIsAdmin($user)
    {
        if ($user->role != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Admin access required'
            ], 403);
        }
        return null;
    }

/**
 * Get single review details (admin only)
 */
public function adminShow($id)
{
    try {
        $user = auth()->user();
        
        // Check if user is admin (role = 1)
        $adminCheck = $this->checkIsAdmin($user);
        if ($adminCheck) {
            return $adminCheck;
        }

        // Load review with ALL fields and relationships
        $review = ProductReview::with(['user', 'product'])->find($id);
        
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        // Return ALL review data including all fields
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $review->id,
                'user_id' => $review->user_id,
                'product_id' => $review->product_id,
                'order_id' => $review->order_id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'is_approved' => $review->is_approved,
                'created_at' => $review->created_at,
                'updated_at' => $review->updated_at,
                'user' => $review->user, // Includes user details
                'product' => $review->product // Includes product details
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Error in adminShow: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch review details'
        ], 500);
    }
}

    /**
     * Get reviews for a specific product (public)
     */
/**
 * Get reviews for a specific product (public)
 */
public function index($productId)
{
    $product = Product::findOrFail($productId);
    
    $reviews = ProductReview::with('user:id,name')
        ->where('product_id', $productId)
        ->where('is_approved', true)
        ->latest()
        ->paginate(10);

    // Transform reviews to add Carbon formatted dates
    $reviews->getCollection()->transform(function ($review) {
        $createdAt = \Carbon\Carbon::parse($review->created_at);
        $now = \Carbon\Carbon::now();
        
        // Add relative date (Today, Yesterday, etc.)
        if ($createdAt->isToday()) {
            $review->formatted_date = 'Today';
        } elseif ($createdAt->isYesterday()) {
            $review->formatted_date = 'Yesterday';
        } elseif ($createdAt->diffInDays($now) < 7) {
            $review->formatted_date = $createdAt->diffInDays($now) . ' days ago';
        } elseif ($createdAt->diffInWeeks($now) < 4) {
            $weeks = $createdAt->diffInWeeks($now);
            $review->formatted_date = $weeks . ' ' . ($weeks == 1 ? 'week' : 'weeks') . ' ago';
        } else {
            $review->formatted_date = $createdAt->format('M d, Y');
        }
        
        // Also add human readable format as alternative
        $review->human_date = $createdAt->diffForHumans();
        
        // Add full formatted date
        $review->full_date = $createdAt->format('F j, Y');
        
        return $review;
    });

    $averageRating = ProductReview::where('product_id', $productId)
        ->where('is_approved', true)
        ->avg('rating') ?? 0;
        
    $totalReviews = ProductReview::where('product_id', $productId)
        ->where('is_approved', true)
        ->count();
        
    $ratingDistribution = [
        5 => ProductReview::where('product_id', $productId)->where('is_approved', true)->where('rating', 5)->count(),
        4 => ProductReview::where('product_id', $productId)->where('is_approved', true)->where('rating', 4)->count(),
        3 => ProductReview::where('product_id', $productId)->where('is_approved', true)->where('rating', 3)->count(),
        2 => ProductReview::where('product_id', $productId)->where('is_approved', true)->where('rating', 2)->count(),
        1 => ProductReview::where('product_id', $productId)->where('is_approved', true)->where('rating', 1)->count(),
    ];

    return response()->json([
        'success' => true,
        'data' => [
            'reviews' => $reviews,
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $totalReviews,
            'rating_distribution' => $ratingDistribution
        ]
    ]);
}

    /**
     * Store a new review (only for customers - role 0)
     */
    public function store(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Check if user is customer (role 0)
            $customerCheck = $this->checkIsCustomer($user);
            if ($customerCheck) {
                return $customerCheck;
            }

            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|min:10|max:1000',
                'order_id' => 'nullable|exists:orders,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if user has already reviewed this product
            $existingReview = ProductReview::where('user_id', auth()->id())
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product'
                ], 409);
            }

            // Verify that the user has purchased and received this product
            $hasPurchasedAndDelivered = Order::where('user_id', $user->id)
                ->whereHas('items', function($query) use ($request) {
                    $query->where('product_id', $request->product_id);
                })
                ->where('status', 'delivered')
                ->exists();

            if (!$hasPurchasedAndDelivered) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only review products that have been delivered to you'
                ], 403);
            }

            // If order_id is provided, verify it belongs to the user and is delivered
            if ($request->order_id) {
                $order = Order::where('id', $request->order_id)
                    ->where('user_id', auth()->id())
                    ->where('status', 'delivered')
                    ->first();

                if (!$order) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid order or order not delivered'
                    ], 403);
                }
            }

            $review = ProductReview::create([
                'user_id' => auth()->id(),
                'product_id' => $request->product_id,
                'order_id' => $request->order_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'is_approved' => false // Requires admin approval
            ]);

            Log::info("New review submitted by customer {$user->id} for product {$request->product_id}");

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully and awaiting approval',
                'data' => $review->load('user:id,name')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error in store review: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a review (only for customers - role 0)
     */
    public function update(Request $request, $id)
    {
        try {
            $user = auth()->user();
            
            // Check if user is customer (role 0)
            $customerCheck = $this->checkIsCustomer($user);
            if ($customerCheck) {
                return $customerCheck;
            }

            $review = ProductReview::findOrFail($id);

            // Check if review belongs to the user
            if ($review->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You can only update your own reviews'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'rating' => 'sometimes|integer|min:1|max:5',
                'comment' => 'nullable|string|min:10|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $review->update([
                'rating' => $request->rating ?? $review->rating,
                'comment' => $request->comment,
                'is_approved' => false // Needs re-approval after update
            ]);

            Log::info("Review {$id} updated by customer {$user->id}");

            return response()->json([
                'success' => true,
                'message' => 'Review updated successfully and awaiting approval',
                'data' => $review
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating review: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a review (for users to delete their own reviews)
     */
    public function destroy($id)
    {
        try {
            $user = auth()->user();
            $review = ProductReview::findOrFail($id);

            // Check if review belongs to the user
            if ($review->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You can only delete your own reviews'
                ], 403);
            }

            $review->delete();

            Log::info("Review {$id} deleted by user {$user->id}");

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting review: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user can review a product (only for customers)
     */
    public function canReview($productId)
    {
        try {
            $user = auth()->user();
            
            // If not authenticated or not customer, return false
            if (!$user || $user->role != 0) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'can_review' => false,
                        'already_reviewed' => false,
                        'has_purchased' => false,
                        'order_id' => null,
                        'message' => 'Only customers can write reviews'
                    ]
                ]);
            }
            
            $hasPurchased = Order::where('user_id', $user->id)
                ->whereHas('items', function($query) use ($productId) {
                    $query->where('product_id', $productId);
                })
                ->where('status', 'delivered')
                ->exists();

            $alreadyReviewed = ProductReview::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->exists();

            $order = null;
            if ($hasPurchased && !$alreadyReviewed) {
                $order = Order::where('user_id', $user->id)
                    ->whereHas('items', function($query) use ($productId) {
                        $query->where('product_id', $productId);
                    })
                    ->where('status', 'delivered')
                    ->first();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'can_review' => $hasPurchased && !$alreadyReviewed,
                    'already_reviewed' => $alreadyReviewed,
                    'has_purchased' => $hasPurchased,
                    'order_id' => $order?->id
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in canReview: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to check review status'
            ], 500);
        }
    }

    /**
     * ============ ADMIN METHODS (Role 1 only) ============
     */

    /**
     * Get all reviews with filters (admin only)
     */
    public function adminIndex(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Check if user is admin (role = 1)
            $adminCheck = $this->checkIsAdmin($user);
            if ($adminCheck) {
                return $adminCheck;
            }

            $query = ProductReview::with(['user', 'product']);

            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'approved') {
                    $query->where('is_approved', true);
                } elseif ($request->status === 'pending') {
                    $query->where('is_approved', false);
                }
            }

            if ($request->has('rating') && $request->rating) {
                $query->where('rating', $request->rating);
            }

            if ($request->has('product_id') && $request->product_id) {
                $query->where('product_id', $request->product_id);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('comment', 'like', "%{$search}%")
                      ->orWhereHas('user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            switch ($request->get('sort', 'latest')) {
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'highest':
                    $query->orderBy('rating', 'desc');
                    break;
                case 'lowest':
                    $query->orderBy('rating', 'asc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }

            $perPage = $request->get('per_page', 10);
            $reviews = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'reviews' => $reviews
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in adminIndex: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews'
            ], 500);
        }
    }

    /**
     * Get review statistics (admin only)
     */
    public function adminStats()
    {
        try {
            $user = auth()->user();
            
            // Check if user is admin (role = 1)
            $adminCheck = $this->checkIsAdmin($user);
            if ($adminCheck) {
                return $adminCheck;
            }

            $total = ProductReview::count();
            $pending = ProductReview::where('is_approved', false)->count();
            $approved = ProductReview::where('is_approved', true)->count();
            $rejected = 0; // You can add a rejected field if needed
            
            $average = ProductReview::where('is_approved', true)->avg('rating') ?? 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'pending' => $pending,
                    'approved' => $approved,
                    'rejected' => $rejected,
                    'average' => round($average, 1)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching review stats: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch review statistics',
                'data' => [
                    'total' => 0,
                    'pending' => 0,
                    'approved' => 0,
                    'rejected' => 0,
                    'average' => 0
                ]
            ]);
        }
    }

    /**
     * Update review status (approve/reject) - admin only
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $user = auth()->user();
            
            // Check if user is admin (role = 1)
            $adminCheck = $this->checkIsAdmin($user);
            if ($adminCheck) {
                return $adminCheck;
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:approved,rejected,pending'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $review = ProductReview::with('product')->find($id);
            
            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Review not found'
                ], 404);
            }

            if ($request->status === 'approved') {
                $review->is_approved = true;
            } elseif ($request->status === 'rejected' || $request->status === 'pending') {
                $review->is_approved = false;
            }
            
            $review->save();

            Log::info("Review {$id} status updated to {$request->status} by admin {$user->id}");

            return response()->json([
                'success' => true,
                'message' => "Review {$request->status} successfully",
                'data' => $review->load('user', 'product')
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating review status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update review status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete reviews - admin only
     */
    public function bulkDelete(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Check if user is admin (role = 1)
            $adminCheck = $this->checkIsAdmin($user);
            if ($adminCheck) {
                return $adminCheck;
            }

            $validator = Validator::make($request->all(), [
                'review_ids' => 'required|array',
                'review_ids.*' => 'exists:product_reviews,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            ProductReview::whereIn('id', $request->review_ids)->delete();

            Log::info("Bulk delete: " . count($request->review_ids) . " reviews deleted by admin {$user->id}");

            return response()->json([
                'success' => true,
                'message' => count($request->review_ids) . ' reviews deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in bulk delete: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk delete reviews'
            ], 500);
        }
    }

    /**
     * Admin delete a review (admin only)
     */
    public function adminDestroy($id)
    {
        try {
            $user = auth()->user();
            
            Log::info('Admin delete review attempt - User:', [
                'user_id' => $user?->id,
                'email' => $user?->email,
                'role' => $user?->role,
                'review_id' => $id
            ]);

            // Check if user is admin using role field (role = 1)
            $adminCheck = $this->checkIsAdmin($user);
            if ($adminCheck) {
                return $adminCheck;
            }

            $review = ProductReview::findOrFail($id);
            $review->delete();

            Log::info("Review {$id} deleted successfully by admin {$user->id}");

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in admin delete review: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update status - admin only
     */
    public function bulkUpdateStatus(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Check if user is admin (role = 1)
            $adminCheck = $this->checkIsAdmin($user);
            if ($adminCheck) {
                return $adminCheck;
            }

            $validator = Validator::make($request->all(), [
                'review_ids' => 'required|array',
                'review_ids.*' => 'exists:product_reviews,id',
                'status' => 'required|in:approved,rejected,pending'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $isApproved = $request->status === 'approved';
            
            ProductReview::whereIn('id', $request->review_ids)
                ->update(['is_approved' => $isApproved]);

            Log::info("Bulk status update: " . count($request->review_ids) . " reviews set to {$request->status} by admin {$user->id}");

            return response()->json([
                'success' => true,
                'message' => count($request->review_ids) . ' reviews updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in bulk update status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update reviews'
            ], 500);
        }
    }
}