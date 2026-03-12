<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    /**
     * Helper method to check user role
     */
    private function checkUserRole($user)
    {
        if ($user->role == 1) {
            return response()->json([
                'status' => false,
                'message' => 'Admin cannot modify wishlist - You are in view-only mode'
            ], 403);
        }
        return null;
    }

    // GET /api/wishlist - Get all wishlist items with size details
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $wishlistItems = Wishlist::with(['product.category', 'size'])
                ->where('user_id', $user->id)
                ->latest()
                ->get()
                ->map(function($wishlist) {
                    $product = $wishlist->product;
                    
                    if (!$product) {
                        return null;
                    }
                    
                    // Clone the product to avoid modifying the original
                    $productData = clone $product;
                    
                    // Add category name
                    if ($productData->category) {
                        $productData->category_name = $productData->category->name;
                    }
                    
                    // CRITICAL FIX: Add size information in pivot format
                    if ($wishlist->size) {
                        // This is a size-specific wishlist item
                        $productData->pivot = [
                            'size' => $wishlist->size->size,
                            'size_id' => $wishlist->size->id,
                            'price' => $wishlist->size->price,
                            'selling_price' => $wishlist->size->selling_price ?? $wishlist->size->price,
                            'original_price' => $wishlist->size->original_price,
                            'stock' => $wishlist->size->stock
                        ];
                        
                        // Also set these fields for easier access in frontend
                        $productData->selected_size = $wishlist->size->size;
                        $productData->selected_size_id = $wishlist->size->id;
                        $productData->size_price = $wishlist->size->selling_price ?? $wishlist->size->price;
                        $productData->size_original_price = $wishlist->size->original_price;
                        $productData->size_stock = $wishlist->size->stock;
                        
                        // Log for debugging
                        Log::info('Size-specific wishlist item:', [
                            'product_id' => $productData->id,
                            'size_id' => $wishlist->size->id,
                            'size' => $wishlist->size->size,
                            'price' => $wishlist->size->selling_price ?? $wishlist->size->price
                        ]);
                        
                    } else {
                        // For products without size selection
                        $productData->pivot = [
                            'size' => null,
                            'size_id' => null,
                            'price' => $productData->selling_price ?? $productData->price,
                            'selling_price' => $productData->selling_price ?? $productData->price,
                            'original_price' => $productData->original_price,
                            'stock' => $productData->stock ?? $productData->qty
                        ];
                        
                        // Set these for consistency
                        $productData->selected_size = null;
                        $productData->selected_size_id = null;
                        $productData->size_price = null;
                        $productData->size_original_price = null;
                        $productData->size_stock = null;
                    }
                    
                    return $productData;
                })
                ->filter()
                ->values();

            return response()->json([
                'status' => true,
                'data' => $wishlistItems,
                'message' => 'Wishlist retrieved successfully',
                'user_role' => $user->role,
                'is_admin' => $user->role == 1
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error loading wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // POST /api/wishlist - Add to wishlist with size
    public function store(Request $request)
    {
        try {
            Log::info('Wishlist store request:', $request->all());

            // Check if user has role 1 - prevent adding to wishlist
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            $request->validate([
                'product_id' => 'required|exists:products,id',
                'size_id' => 'nullable|exists:product_sizes,id'
            ]);

            $userId = $request->user()->id;
            $productId = $request->product_id;
            $sizeId = $request->size_id;

            // Check if product exists
            $product = Product::find($productId);
            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Check if size exists when provided
            if ($sizeId) {
                $size = ProductSize::find($sizeId);
                if (!$size) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Size not found'
                    ], 404);
                }
                
                // Verify size belongs to product
                if ($size->product_id != $productId) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Size does not belong to this product'
                    ], 400);
                }
            }

            // Check if already in wishlist with same product and size
            $existingWishlist = Wishlist::where('user_id', $userId)
                ->where('product_id', $productId)
                ->when($sizeId, function($query) use ($sizeId) {
                    return $query->where('size_id', $sizeId);
                }, function($query) {
                    return $query->whereNull('size_id');
                })
                ->first();

            if ($existingWishlist) {
                return response()->json([
                    'status' => false,
                    'message' => $sizeId ? 'Product with this size already in wishlist' : 'Product already in wishlist'
                ], 409);
            }

            // Create wishlist item with size
            $wishlist = Wishlist::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'size_id' => $sizeId
            ]);

            // Load relationships
            $wishlist->load(['product.category', 'size']);

            // Prepare response data
            $product = $wishlist->product;
            if ($product && $product->category) {
                $product->category_name = $product->category->name;
            }

            // Add size information in pivot format
            if ($wishlist->size) {
                $product->pivot = [
                    'size' => $wishlist->size->size,
                    'size_id' => $wishlist->size->id,
                    'price' => $wishlist->size->price,
                    'selling_price' => $wishlist->size->selling_price ?? $wishlist->size->price,
                    'original_price' => $wishlist->size->original_price,
                    'stock' => $wishlist->size->stock
                ];
                
                // Add direct fields for easier access
                $product->selected_size = $wishlist->size->size;
                $product->selected_size_id = $wishlist->size->id;
                $product->size_price = $wishlist->size->selling_price ?? $wishlist->size->price;
                $product->size_original_price = $wishlist->size->original_price;
                $product->size_stock = $wishlist->size->stock;
            } else {
                // For products without size
                $product->pivot = [
                    'size' => null,
                    'size_id' => null,
                    'price' => $product->selling_price ?? $product->price,
                    'selling_price' => $product->selling_price ?? $product->price,
                    'original_price' => $product->original_price,
                    'stock' => $product->stock ?? $product->qty
                ];
                
                // Set these for consistency
                $product->selected_size = null;
                $product->selected_size_id = null;
                $product->size_price = null;
                $product->size_original_price = null;
                $product->size_stock = null;
            }

            $wishlistCount = Wishlist::where('user_id', $userId)->count();

            return response()->json([
                'status' => true,
                'message' => 'Product added to wishlist',
                'data' => $product,
                'wishlist_count' => $wishlistCount
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Wishlist store error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error adding to wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // DELETE /api/wishlist/{product_id}?size_id= - Remove from wishlist
    public function destroy(Request $request, $product_id)
    {
        try {
            // Check if user has role 1 - prevent removing from wishlist
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            $userId = $request->user()->id;
            $sizeId = $request->query('size_id');

            $query = Wishlist::where('user_id', $userId)
                ->where('product_id', $product_id);

            if ($sizeId && $sizeId !== 'null' && $sizeId !== '') {
                $query->where('size_id', $sizeId);
            } else {
                $query->whereNull('size_id');
            }

            $deleted = $query->delete();

            if ($deleted) {
                $wishlistCount = Wishlist::where('user_id', $userId)->count();

                return response()->json([
                    'status' => true,
                    'message' => 'Product removed from wishlist',
                    'wishlist_count' => $wishlistCount
                ]);
            }

            return response()->json([
                'status' => false,
                'message' => 'Product not found in wishlist'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Wishlist delete error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error removing from wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // DELETE /api/wishlist/clear - Clear entire wishlist
    public function clear(Request $request)
    {
        try {
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            $deleted = Wishlist::where('user_id', $request->user()->id)->delete();

            return response()->json([
                'status' => true,
                'message' => 'Wishlist cleared successfully',
                'wishlist_count' => 0
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist clear error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error clearing wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/wishlist/check/{product_id}?size_id= - Check if in wishlist
    public function check(Request $request, $product_id)
    {
        try {
            $user = $request->user();
            $sizeId = $request->query('size_id');

            $query = Wishlist::where('user_id', $user->id)
                ->where('product_id', $product_id);

            if ($sizeId && $sizeId !== 'null' && $sizeId !== '') {
                $query->where('size_id', $sizeId);
            } else {
                $query->whereNull('size_id');
            }

            $exists = $query->exists();

            return response()->json([
                'status' => true,
                'data' => [
                    'in_wishlist' => $exists,
                    'size_id' => $sizeId
                ],
                'is_admin' => $user->role == 1
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist check error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error checking wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/wishlist/count - Get wishlist count
    public function count(Request $request)
    {
        try {
            $user = $request->user();
            $count = Wishlist::where('user_id', $user->id)->count();

            return response()->json([
                'status' => true,
                'data' => [
                    'count' => $count,
                    'is_admin' => $user->role == 1
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Wishlist count error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error getting wishlist count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin: Get all wishlists
    public function adminIndex(Request $request)
    {
        try {
            if ($request->user()->role != 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $wishlists = Wishlist::with(['user', 'product', 'size'])
                ->latest()
                ->paginate(20);

            return response()->json([
                'status' => true,
                'data' => $wishlists
            ]);
        } catch (\Exception $e) {
            Log::error('Admin wishlist index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error loading wishlists'
            ], 500);
        }
    }

    // Admin: Get user's wishlist
    public function getUserWishlist(Request $request, $userId)
    {
        try {
            if ($request->user()->role != 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $wishlists = Wishlist::with(['product', 'size'])
                ->where('user_id', $userId)
                ->latest()
                ->get();

            return response()->json([
                'status' => true,
                'data' => $wishlists
            ]);
        } catch (\Exception $e) {
            Log::error('Admin user wishlist error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error loading user wishlist'
            ], 500);
        }
    }
}