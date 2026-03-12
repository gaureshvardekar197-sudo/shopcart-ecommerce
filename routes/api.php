<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CancellationRequestController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\ProductSizeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;



/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/forgot-password/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);

// Public route for contact form
Route::post('/contact', [ContactController::class, 'store']);

// Products - Public read-only
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/category/{categoryId}', [ProductController::class, 'getByCategory']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Public Reviews
Route::get('/products/{productId}/reviews', [ProductReviewController::class, 'index']);

// Public Size Routes (No Authentication Required)
Route::prefix('sizes')->group(function () {
    Route::get('/options', [ProductSizeController::class, 'getSizeOptions']);
    Route::get('/category/{category}', [ProductSizeController::class, 'getSizesByCategory']);
    Route::get('/price-range/{productId}', [ProductSizeController::class, 'getPriceRange']);
});

Route::prefix('products/{productId}/sizes')->group(function () {
    Route::get('/', [ProductSizeController::class, 'getProductSizes']);
    Route::post('/check-availability', [ProductSizeController::class, 'checkAvailability']);
});

Route::prefix('sizes')->group(function () {
    Route::get('/{sizeId}', [ProductSizeController::class, 'getSizeDetails']);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Require Login)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // User
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

     // ===== NEW: User Profile Routes =====
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/profile', [UserController::class, 'updateProfile']); // For POST requests with _method
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    
    // Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::get('/addresses/{id}', [AddressController::class, 'show']); // NEW
    Route::put('/addresses/{id}', [AddressController::class, 'update']); // NEW
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);
    
    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::get('/wishlist/count', [WishlistController::class, 'count']);
    Route::get('/wishlist/check/{product_id}', [WishlistController::class, 'check']);
    Route::delete('/wishlist/clear', [WishlistController::class, 'clear']);
    Route::delete('/wishlist/{product_id}', [WishlistController::class, 'destroy']);
    
    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::get('/cart/count', [CartController::class, 'count']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::put('/cart/{product_id}', [CartController::class, 'update']);
    Route::delete('/cart/{product_id}', [CartController::class, 'destroy']);
    
    // Orders
    Route::get('/orders', [OrderController::class, 'myOrders']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    
    // Reviews (Customer actions)
    Route::post('/reviews', [ProductReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ProductReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ProductReviewController::class, 'destroy']);
    Route::get('/products/{productId}/can-review', [ProductReviewController::class, 'canReview']);

       // Check if order can be cancelled
    Route::get('/cancellation/check/{orderId}', [CancellationRequestController::class, 'checkEligibility']);
    
    // CRUD operations for cancellation requests
    Route::apiResource('cancellations', CancellationRequestController::class)->only([
        'index', 'store', 'show'
    ]);
    
    // Cancel a pending cancellation request
    Route::delete('/cancellations/{id}/cancel', [CancellationRequestController::class, 'cancel']);

});

/*
|--------------------------------------------------------------------------
| Admin Routes (Role 1 only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', function () {
        return response()->json(['message' => 'Admin Dashboard']);
    });
    
    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    // Order Management
    Route::get('/orders', [OrderController::class, 'adminIndex']);
    Route::get('/orders/{id}', [OrderController::class, 'adminShow']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    
    // Category Management
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    
    // Product Management - Admin only
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Review Management (Admin only)
    Route::get('/reviews/stats', [ProductReviewController::class, 'adminStats']);
    Route::get('/reviews', [ProductReviewController::class, 'adminIndex']);
    Route::get('/reviews/user/{userId}', [ProductReviewController::class, 'getReviewsByUser']);
    Route::get('/reviews/product/{productId}', [ProductReviewController::class, 'getReviewsByProduct']);
    Route::get('/reviews/{id}', [ProductReviewController::class, 'adminShow']);
    Route::patch('/reviews/{id}/status', [ProductReviewController::class, 'updateStatus']);
    Route::delete('/reviews/{id}', [ProductReviewController::class, 'adminDestroy']);
    Route::post('/reviews/bulk-delete', [ProductReviewController::class, 'bulkDelete']);
    Route::post('/reviews/bulk-status', [ProductReviewController::class, 'bulkUpdateStatus']);

    // Admin Size Management Routes
    Route::prefix('products/{productId}/sizes')->group(function () {
        Route::post('/', [ProductSizeController::class, 'addSizes']);
        Route::put('/bulk', [ProductSizeController::class, 'updateBulkSizes']);
    });

    Route::prefix('sizes')->group(function () {
        Route::put('/{sizeId}', [ProductSizeController::class, 'updateSize']);
        Route::delete('/{sizeId}', [ProductSizeController::class, 'destroy']);
    });
    Route::get('/cancellations', [CancellationRequestController::class, 'all']); // ADD THIS
    Route::get('/cancellations/pending', [CancellationRequestController::class, 'pending']);
    Route::get('/cancellations/{id}', [CancellationRequestController::class, 'adminshow']);
    Route::post('/cancellations/{id}/approve', [CancellationRequestController::class, 'approve']);
    Route::post('/cancellations/{id}/reject', [CancellationRequestController::class, 'reject']);
    Route::get('/cancellations/stats', [CancellationRequestController::class, 'stats']);
});