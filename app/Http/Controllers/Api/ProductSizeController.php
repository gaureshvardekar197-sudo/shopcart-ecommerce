<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductSizeController extends Controller
{
    /**
     * Get all size categories and predefined sizes
     */
    public function getSizeOptions()
    {
        $sizeOptions = [
            'clothing' => [
                'name' => 'Clothing Sizes',
                'sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
            ],
            'shoes' => [
                'name' => 'Shoe Sizes',
                'sizes' => ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
            ],
            'kids' => [
                'name' => 'Kids Sizes',
                'sizes' => ['2T', '3T', '4T', '5T', '6T', '7T', '8T', '10T', '12T']
            ],
            'numeric' => [
                'name' => 'Numeric Sizes',
                'sizes' => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
            ]
        ];

        return response()->json([
            'status' => true,
            'data' => $sizeOptions
        ]);
    }

    /**
     * Get sizes for a specific product
     */
    public function getProductSizes($productId)
    {
        $product = Product::with('sizes')->find($productId);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $sizes = $product->sizes->map(function($size) {
            return [
                'id' => $size->id,
                'size' => $size->size,
                'size_category' => $size->size_category,
                'stock' => $size->stock,
                'price' => $size->price,
                'original_price' => $size->original_price,
                'selling_price' => $size->selling_price,
                'price_adjustment' => $size->price_adjustment,
                'effective_price' => $size->effective_price,
                'effective_original_price' => $size->effective_original_price,
                'has_discount' => $size->has_discount,
                'discount_percentage' => $size->discount_percentage,
                'is_in_stock' => $size->is_in_stock
            ];
        });

        return response()->json([
            'status' => true,
            'data' => [
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'base_price' => $product->selling_price,
                    'base_original_price' => $product->original_price,
                    'total_stock' => $product->qty,
                    'has_variable_pricing' => $product->has_variable_pricing,
                    'price_range' => $product->price_range
                ],
                'sizes' => $sizes,
                'available_sizes' => $sizes->where('is_in_stock', true)->values()
            ]
        ]);
    }

    /**
     * Add sizes to a product with prices
     */
    public function addSizes(Request $request, $productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'size_category' => 'required|in:clothing,shoes,kids,numeric',
            'sizes' => 'required|array|min:1',
            'sizes.*.size' => 'required|string|max:50',
            'sizes.*.stock' => 'required|integer|min:0',
            'sizes.*.price' => 'nullable|numeric|min:0',
            'sizes.*.original_price' => 'nullable|numeric|min:0',
            'sizes.*.selling_price' => 'nullable|numeric|min:0',
            'sizes.*.price_adjustment' => 'nullable|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $totalStock = 0;
            $addedSizes = [];

            foreach ($request->sizes as $sizeData) {
                // Check if size already exists for this product
                $existingSize = ProductSize::where('product_id', $product->id)
                    ->where('size', $sizeData['size'])
                    ->first();

                if ($existingSize) {
                    return response()->json([
                        'status' => false,
                        'message' => "Size '{$sizeData['size']}' already exists for this product"
                    ], 422);
                }

                // Calculate prices
                $price = $sizeData['price'] ?? null;
                $originalPrice = $sizeData['original_price'] ?? $product->original_price;
                $sellingPrice = $sizeData['selling_price'] ?? $price ?? $product->selling_price;
                $priceAdjustment = $sizeData['price_adjustment'] ?? ($sellingPrice - $product->selling_price);

                $size = ProductSize::create([
                    'product_id' => $product->id,
                    'size_category' => $request->size_category,
                    'size' => $sizeData['size'],
                    'stock' => $sizeData['stock'],
                    'price' => $price,
                    'original_price' => $originalPrice,
                    'selling_price' => $sellingPrice,
                    'price_adjustment' => $priceAdjustment
                ]);

                $totalStock += $sizeData['stock'];
                $addedSizes[] = $size;
            }

            // Update product total quantity
            $product->qty = $product->sizes()->sum('stock');
            $product->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Sizes added successfully',
                'data' => [
                    'product_id' => $product->id,
                    'size_category' => $request->size_category,
                    'sizes' => $addedSizes,
                    'total_stock' => $product->qty,
                    'has_variable_pricing' => $product->has_variable_pricing
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to add sizes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update size price and stock
     */
    public function updateSize(Request $request, $sizeId)
    {
        $size = ProductSize::find($sizeId);

        if (!$size) {
            return response()->json([
                'status' => false,
                'message' => 'Size not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'stock' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'price_adjustment' => 'nullable|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update stock if provided
            if ($request->has('stock')) {
                $size->stock = $request->stock;
            }

            // Update prices
            if ($request->has('price')) {
                $size->price = $request->price;
            }

            if ($request->has('original_price')) {
                $size->original_price = $request->original_price;
            }

            if ($request->has('selling_price')) {
                $size->selling_price = $request->selling_price;
            }

            // Calculate price adjustment
            if ($request->has('selling_price')) {
                $size->price_adjustment = $request->selling_price - $size->product->selling_price;
            } elseif ($request->has('price_adjustment')) {
                $size->price_adjustment = $request->price_adjustment;
                $size->selling_price = $size->product->selling_price + $request->price_adjustment;
            }

            $size->save();

            // Update product total quantity
            $product = $size->product;
            $product->qty = $product->sizes()->sum('stock');
            $product->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Size updated successfully',
                'data' => [
                    'id' => $size->id,
                    'size' => $size->size,
                    'stock' => $size->stock,
                    'price' => $size->price,
                    'selling_price' => $size->selling_price,
                    'original_price' => $size->original_price,
                    'price_adjustment' => $size->price_adjustment,
                    'effective_price' => $size->effective_price,
                    'has_discount' => $size->has_discount,
                    'discount_percentage' => $size->discount_percentage
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to update size',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update multiple sizes at once
     */
    public function updateBulkSizes(Request $request, $productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'sizes' => 'required|array',
            'sizes.*.id' => 'required|exists:product_sizes,id',
            'sizes.*.stock' => 'nullable|integer|min:0',
            'sizes.*.price' => 'nullable|numeric|min:0',
            'sizes.*.selling_price' => 'nullable|numeric|min:0',
            'sizes.*.price_adjustment' => 'nullable|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $updatedSizes = [];

            foreach ($request->sizes as $sizeData) {
                $size = ProductSize::find($sizeData['id']);
                
                // Verify size belongs to the product
                if ($size->product_id != $product->id) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Size does not belong to this product'
                    ], 422);
                }

                // Update fields
                if (isset($sizeData['stock'])) {
                    $size->stock = $sizeData['stock'];
                }

                if (isset($sizeData['price'])) {
                    $size->price = $sizeData['price'];
                }

                if (isset($sizeData['selling_price'])) {
                    $size->selling_price = $sizeData['selling_price'];
                    $size->price_adjustment = $sizeData['selling_price'] - $product->selling_price;
                }

                if (isset($sizeData['price_adjustment'])) {
                    $size->price_adjustment = $sizeData['price_adjustment'];
                    $size->selling_price = $product->selling_price + $sizeData['price_adjustment'];
                }

                $size->save();
                $updatedSizes[] = $size;
            }

            // Update product total quantity
            $product->qty = $product->sizes()->sum('stock');
            $product->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Sizes updated successfully',
                'data' => [
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'total_stock' => $product->qty,
                        'has_variable_pricing' => $product->has_variable_pricing
                    ],
                    'sizes' => $updatedSizes
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to update sizes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get size details with price
     */
    public function getSizeDetails($sizeId)
    {
        $size = ProductSize::with('product')->find($sizeId);

        if (!$size) {
            return response()->json([
                'status' => false,
                'message' => 'Size not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => [
                'id' => $size->id,
                'product' => [
                    'id' => $size->product->id,
                    'name' => $size->product->name,
                    'base_price' => $size->product->selling_price
                ],
                'size' => $size->size,
                'size_category' => $size->size_category,
                'stock' => $size->stock,
                'price' => $size->price,
                'original_price' => $size->original_price,
                'selling_price' => $size->selling_price,
                'price_adjustment' => $size->price_adjustment,
                'effective_price' => $size->effective_price,
                'effective_original_price' => $size->effective_original_price,
                'has_discount' => $size->has_discount,
                'discount_percentage' => $size->discount_percentage,
                'is_in_stock' => $size->is_in_stock
            ]
        ]);
    }

    /**
     * Check size availability and price
     */
    public function checkAvailability(Request $request, $productId)
    {
        $validator = Validator::make($request->all(), [
            'size' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $size = $product->sizes()
            ->where('size', $request->size)
            ->first();

        if (!$size) {
            return response()->json([
                'status' => false,
                'message' => 'Size not available for this product'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => [
                'size' => $size->size,
                'size_category' => $size->size_category,
                'available' => $size->stock > 0,
                'stock' => $size->stock,
                'price' => $size->effective_price,
                'original_price' => $size->effective_original_price,
                'has_discount' => $size->has_discount,
                'discount_percentage' => $size->discount_percentage,
                'in_stock' => $size->is_in_stock
            ]
        ]);
    }

    /**
     * Delete a size
     */
    public function destroy($sizeId)
    {
        $size = ProductSize::find($sizeId);

        if (!$size) {
            return response()->json([
                'status' => false,
                'message' => 'Size not found'
            ], 404);
        }

        DB::beginTransaction();

        try {
            $product = $size->product;
            $size->delete();

            // Update product total quantity
            $product->qty = $product->sizes()->sum('stock');
            $product->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Size deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete size',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get price range for product sizes
     */
    public function getPriceRange($productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'base_price' => $product->selling_price,
                'min_price' => $product->min_size_price,
                'max_price' => $product->max_size_price,
                'price_range' => $product->price_range,
                'has_variable_pricing' => $product->has_variable_pricing
            ]
        ]);
    }
}