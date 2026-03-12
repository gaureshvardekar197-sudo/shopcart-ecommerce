<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    private function isAdmin($user)
    {
        return $user && $user->role == 1;
    }

    private function adminErrorResponse()
    {
        return response()->json([
            'status' => false,
            'role_error' => true,
            'message' => 'Admin cannot modify cart - You are in view-only mode'
        ], 403);
    }

    private function formatCartItem($cart)
    {
        if (!$cart || !$cart->product) {
            return null;
        }
        
        $product = $cart->product;
        
        $item = [
            'id' => $product->id,
            'product_id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'image' => $product->image,
            'image_url' => $product->image_url,
            'category' => $product->category,
            'category_name' => $product->category ? $product->category->name : null,
            'quantity' => $cart->quantity,
            'stock' => 0,
            'price' => 0,
            'selling_price' => 0,
            'original_price' => 0,
            'size' => null,
            'size_id' => null,
            'selected_size' => null,
            'selected_size_id' => null,
            'cart_item_id' => $cart->id
        ];
        
        if ($cart->size) {
            $item['size'] = $cart->size->size;
            $item['size_id'] = $cart->size->id;
            $item['selected_size'] = $cart->size->size;
            $item['selected_size_id'] = $cart->size->id;
            $item['price'] = $cart->size->selling_price ?? $cart->size->price;
            $item['selling_price'] = $cart->size->selling_price ?? $cart->size->price;
            $item['original_price'] = $cart->size->original_price ?? $cart->size->price;
            $item['stock'] = $cart->size->stock;
        } else {
            $item['price'] = $product->selling_price ?? $product->price ?? 0;
            $item['selling_price'] = $product->selling_price ?? $product->price ?? 0;
            $item['original_price'] = $product->original_price ?? $product->mrp ?? $item['price'];
            $item['stock'] = $product->stock ?? $product->qty ?? 0;
        }
        
        return $item;
    }

    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $cartItems = Cart::with(['product.category', 'size'])
                ->where('user_id', $user->id)
                ->latest()
                ->get()
                ->map(fn($cart) => $this->formatCartItem($cart))
                ->filter()
                ->values();

            return response()->json([
                'status' => true,
                'data' => $cartItems,
                'message' => 'Cart retrieved successfully',
                'total_items' => $cartItems->count(),
                'total_quantity' => $cartItems->sum('quantity')
            ]);
            
        } catch (\Exception $e) {
            Log::error('Cart index error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to load cart'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Cart store called:', $request->all());
            
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Please login to add items to cart'
                ], 401);
            }

            if ($this->isAdmin($user)) {
                return $this->adminErrorResponse();
            }

            $validated = $request->validate([
                'product_id' => 'required|integer|exists:products,id',
                'quantity' => 'required|integer|min:1|max:99',
                'size_id' => 'nullable|integer|exists:product_sizes,id'
            ]);

            $userId = $user->id;
            $productId = $validated['product_id'];
            $quantity = $validated['quantity'];
            $sizeId = $validated['size_id'] ?? null;

            $product = Product::find($productId);
            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Stock validation
            if ($sizeId) {
                $sizeModel = ProductSize::where('id', $sizeId)
                    ->where('product_id', $productId)
                    ->first();
                    
                if (!$sizeModel) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Size not found for this product'
                    ], 404);
                }
                
                if ($sizeModel->stock < $quantity) {
                    return response()->json([
                        'status' => false,
                        'message' => "Only {$sizeModel->stock} items available in this size"
                    ], 400);
                }
            } else {
                $productStock = $product->stock ?? $product->qty ?? 0;
                if ($productStock < $quantity) {
                    return response()->json([
                        'status' => false,
                        'message' => "Only {$productStock} items available"
                    ], 400);
                }
            }

            // Amazon-style: Check for exact product + size combination
            $existingCart = Cart::where('user_id', $userId)
                ->where('product_id', $productId);

            if ($sizeId) {
                $existingCart = $existingCart->where('size_id', $sizeId);
            } else {
                $existingCart = $existingCart->whereNull('size_id');
            }

            $existingCart = $existingCart->first();

            DB::beginTransaction();

            try {
                if ($existingCart) {
                    // Same product + same size = update quantity
                    $existingCart->quantity += $quantity;
                    $existingCart->save();
                    $cartItem = $existingCart;
                    $message = 'Cart updated successfully';
                } else {
                    // Different size = new cart item
                    $cartItem = Cart::create([
                        'user_id' => $userId,
                        'product_id' => $productId,
                        'size_id' => $sizeId,
                        'quantity' => $quantity
                    ]);
                    $message = 'Product added to cart';
                }

                DB::commit();

                $cartItem->load(['product', 'size']);

                $cartCount = Cart::where('user_id', $userId)->count();
                $totalQuantity = Cart::where('user_id', $userId)->sum('quantity');

                return response()->json([
                    'status' => true,
                    'message' => $message,
                    'data' => $this->formatCartItem($cartItem),
                    'cart_count' => $cartCount,
                    'total_quantity' => $totalQuantity,
                    'is_update' => $existingCart ? true : false
                ], 201);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Cart store error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to add to cart'
            ], 500);
        }
    }

    public function update(Request $request, $productId)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            if ($this->isAdmin($user)) {
                return $this->adminErrorResponse();
            }

            $validated = $request->validate([
                'quantity' => 'required|integer|min:1|max:99'
            ]);

            $sizeId = $request->query('size_id');
            $quantity = $validated['quantity'];

            $query = Cart::with(['product', 'size'])
                ->where('user_id', $user->id)
                ->where('product_id', $productId);

            if ($sizeId && $sizeId !== 'null') {
                $query->where('size_id', $sizeId);
            } else {
                $query->whereNull('size_id');
            }

            $cartItem = $query->first();

            if (!$cartItem) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            // Stock validation
            if ($cartItem->size) {
                if ($cartItem->size->stock < $quantity) {
                    return response()->json([
                        'status' => false,
                        'message' => "Only {$cartItem->size->stock} items available"
                    ], 400);
                }
            } else {
                $product = $cartItem->product;
                $productStock = $product->stock ?? $product->qty ?? 0;
                if ($productStock < $quantity) {
                    return response()->json([
                        'status' => false,
                        'message' => "Only {$productStock} items available"
                    ], 400);
                }
            }

            $cartItem->quantity = $quantity;
            $cartItem->save();

            $totalQuantity = Cart::where('user_id', $user->id)->sum('quantity');

            return response()->json([
                'status' => true,
                'message' => 'Cart updated successfully',
                'data' => $this->formatCartItem($cartItem),
                'total_quantity' => $totalQuantity
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Cart update error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to update cart'
            ], 500);
        }
    }

    public function destroy(Request $request, $productId)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            if ($this->isAdmin($user)) {
                return $this->adminErrorResponse();
            }

            $sizeId = $request->query('size_id');

            $query = Cart::where('user_id', $user->id)
                ->where('product_id', $productId);

            if ($sizeId && $sizeId !== 'null') {
                $query->where('size_id', $sizeId);
            } else {
                $query->whereNull('size_id');
            }

            $cartItem = $query->first();

            if (!$cartItem) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            $cartItem->delete();

            $totalQuantity = Cart::where('user_id', $user->id)->sum('quantity');

            return response()->json([
                'status' => true,
                'message' => 'Item removed from cart',
                'total_quantity' => $totalQuantity
            ]);
            
        } catch (\Exception $e) {
            Log::error('Cart delete error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to remove item'
            ], 500);
        }
    }

    public function clear(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            if ($this->isAdmin($user)) {
                return $this->adminErrorResponse();
            }

            Cart::where('user_id', $user->id)->delete();

            return response()->json([
                'status' => true,
                'message' => 'Cart cleared successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Cart clear error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to clear cart'
            ], 500);
        }
    }

    public function count(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $count = Cart::where('user_id', $user->id)->count();
            $totalQuantity = Cart::where('user_id', $user->id)->sum('quantity');

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
                'message' => 'Failed to get cart count'
            ], 500);
        }
    }
}