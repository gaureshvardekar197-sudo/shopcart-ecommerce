<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    /**
     * Constructor - Remove middleware from here since it's defined in routes
     */
    public function __construct()
    {
        // Don't call middleware here - it's already in routes/api.php
    }

    /**
     * Helper method to check user role
     */
    private function checkUserRole($user)
    {
        if ($user->role == 1) {
            return response()->json([
                'status' => false,
                'message' => 'Admin not allowed to add to cart'
            ], 403);
        }
        return null;
    }

    // Get cart items
    public function index(Request $request)
    {
        try {
            // Check role - allow viewing but not modifying
            // If you want to prevent role 1 from even viewing cart, uncomment below:
            /*
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }
            */

            $cartItems = Cart::with('product.category')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get()
                ->map(function ($cart) {
                    $product = $cart->product;
                    if ($product) {
                        $product->quantity = $cart->quantity;
                        $product->cart_id = $cart->id;
                    }
                    return $product;
                })
                ->filter() // Remove null products
                ->values();

            return response()->json([
                'status' => true,
                'data' => $cartItems,
                'count' => $cartItems->count(),
                'message' => 'Cart retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Cart index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error loading cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Add to cart
    public function store(Request $request)
    {
        try {
            // Check if user has role 1 - prevent adding to cart
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'sometimes|integer|min:1'
            ]);

            $quantity = $request->quantity ?? 1;

            // Check if product exists in cart
            $existingCart = Cart::where('user_id', $request->user()->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingCart) {
                // Update quantity
                $existingCart->update([
                    'quantity' => $existingCart->quantity + $quantity
                ]);
                $cart = $existingCart;
            } else {
                // Create new cart item
                $cart = Cart::create([
                    'user_id' => $request->user()->id,
                    'product_id' => $request->product_id,
                    'quantity' => $quantity
                ]);
            }

            $cart->load('product.category');

            // Get updated cart count
            $cartCount = Cart::where('user_id', $request->user()->id)->count();
            $totalQuantity = Cart::where('user_id', $request->user()->id)->sum('quantity');

            return response()->json([
                'status' => true,
                'message' => 'Product added to cart',
                'data' => [
                    'cart_id' => $cart->id,
                    'product' => $cart->product,
                    'quantity' => $cart->quantity
                ],
                'cart_count' => $cartCount,
                'total_quantity' => $totalQuantity
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Cart store error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error adding to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update quantity - Handle by product_id
    public function update(Request $request, $product_id)
    {
        try {
            // Check if user has role 1 - prevent updating cart
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            Log::info('Updating cart item:', [
                'user_id' => $request->user()->id,
                'product_id' => $product_id,
                'quantity' => $request->quantity
            ]);

            $cart = Cart::where('user_id', $request->user()->id)
                ->where('product_id', $product_id)
                ->first();

            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product not found in cart'
                ], 404);
            }

            $cart->update([
                'quantity' => $request->quantity
            ]);

            $cart->load('product.category');

            // Get updated cart total quantity
            $totalQuantity = Cart::where('user_id', $request->user()->id)->sum('quantity');

            // Format the response to match frontend expectations
            $product = $cart->product;
            $product->quantity = $cart->quantity;
            $product->cart_id = $cart->id;

            return response()->json([
                'status' => true,
                'message' => 'Cart updated successfully',
                'data' => $product,
                'total_quantity' => (int) $totalQuantity
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Cart update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error updating cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Remove from cart - Handle by product_id
    public function destroy(Request $request, $product_id)
    {
        try {
            // Check if user has role 1 - prevent removing from cart
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            Log::info('Removing cart item:', [
                'user_id' => $request->user()->id,
                'product_id' => $product_id
            ]);

            $deleted = Cart::where('user_id', $request->user()->id)
                ->where('product_id', $product_id)
                ->delete();

            if ($deleted) {
                // Get updated cart total quantity
                $totalQuantity = Cart::where('user_id', $request->user()->id)->sum('quantity');
                
                return response()->json([
                    'status' => true,
                    'message' => 'Product removed from cart',
                    'total_quantity' => $totalQuantity
                ]);
            }

            return response()->json([
                'status' => false,
                'message' => 'Product not found in cart'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Cart delete error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error removing from cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Clear cart
    public function clear(Request $request)
    {
        try {
            // Check if user has role 1 - prevent clearing cart
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }

            Cart::where('user_id', $request->user()->id)->delete();

            return response()->json([
                'status' => true,
                'message' => 'Cart cleared successfully',
                'total_quantity' => 0
            ]);
        } catch (\Exception $e) {
            Log::error('Cart clear error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error clearing cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get cart count
    public function count(Request $request)
    {
        try {
            // Check role - allow viewing count but not modifying
            // If you want to prevent role 1 from even viewing cart count, uncomment below:
            /*
            $roleCheck = $this->checkUserRole($request->user());
            if ($roleCheck) {
                return $roleCheck;
            }
            */

            $count = Cart::where('user_id', $request->user()->id)->count();
            $totalQuantity = Cart::where('user_id', $request->user()->id)->sum('quantity');

            return response()->json([
                'status' => true,
                'data' => [
                    'count' => $count,
                    'total_quantity' => $totalQuantity
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Cart count error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error getting cart count',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}