<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
                'message' => 'Admin cannot add to wishlist - You are checking the website, not making a purchase'
            ], 403);
        }
        return null;
    }

    // Get all wishlist items
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $wishlist = Wishlist::with(['product.category'])
                ->where('user_id', $user->id)
                ->latest()
                ->get()
                ->map(function($wishlist) {
                    $product = $wishlist->product;
                    if ($product && $product->category) {
                        $product->category_name = $product->category->name;
                    }
                    return $product;
                });

            return response()->json([
                'status' => true,
                'data' => $wishlist,
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

    // Add to wishlist
    public function store(Request $request)
    {
        try {
            // Check if user has role 1 - prevent adding to wishlist
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            $request->validate([
                'product_id' => 'required|exists:products,id'
            ]);

            // Check if already in wishlist
            $existingWishlist = Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingWishlist) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product already in wishlist'
                ], 409);
            }

            $wishlist = Wishlist::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id
            ]);

            $wishlist->load('product.category');
            
            $product = $wishlist->product;
            if ($product && $product->category) {
                $product->category_name = $product->category->name;
            }

            $wishlistCount = Wishlist::where('user_id', $request->user()->id)->count();

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

    // Remove from wishlist
    public function destroy(Request $request, $product_id)
    {
        try {
            // Check if user has role 1 - prevent removing from wishlist
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            Log::info('Removing wishlist item:', [
                'user_id' => $request->user()->id,
                'product_id' => $product_id
            ]);

            $deleted = Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $product_id)
                ->delete();

            if ($deleted) {
                $wishlistCount = Wishlist::where('user_id', $request->user()->id)->count();

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

    // Clear wishlist
    public function clear(Request $request)
    {
        try {
            // Check if user has role 1 - prevent clearing wishlist
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

    // Check if product is in wishlist
    public function check(Request $request, $product_id)
    {
        try {
            $user = $request->user();

            $exists = Wishlist::where('user_id', $user->id)
                ->where('product_id', $product_id)
                ->exists();

            return response()->json([
                'status' => true,
                'data' => [
                    'in_wishlist' => $exists
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

    // Get wishlist count
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
}