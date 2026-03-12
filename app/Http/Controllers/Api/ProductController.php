<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Helper function to extract numeric ID from various formats
     * Handles URLs like: 33%7CM5hxoWsutTUS4X0GX71eLnead2yw9oBltB2SFhtr75635668
     */
    private function extractNumericId($id)
    {
        if (!$id) return null;
        
        $idString = (string) $id;
        
        // Check if it contains URL-encoded pipe (%7C)
        if (strpos($idString, '%7C') !== false) {
            $parts = explode('%7C', $idString);
            $possibleId = $parts[0];
            if (is_numeric($possibleId)) {
                return (int) $possibleId;
            }
        }
        
        // Check if it contains a regular pipe
        if (strpos($idString, '|') !== false) {
            $parts = explode('|', $idString);
            $possibleId = $parts[0];
            if (is_numeric($possibleId)) {
                return (int) $possibleId;
            }
        }
        
        // Try to extract numbers from the beginning
        if (preg_match('/^(\d+)/', $idString, $matches)) {
            return (int) $matches[1];
        }
        
        // If it's a pure number
        if (is_numeric($idString)) {
            return (int) $idString;
        }
        
        return null;
    }

    /**
     * Get all products
     */
    public function index()
    {
        try {
            $products = Product::with(['category', 'sizes'])->latest()->get();
            
            // Transform to add image URLs
            $products->transform(function($product) {
                $product->image_url = $product->image ? asset('storage/products/' . $product->image) : null;
                
                // Check if product_images exists and is an array
                if ($product->product_images) {
                    $images = is_array($product->product_images) 
                        ? $product->product_images 
                        : json_decode($product->product_images, true) ?? [];
                    
                    if (!empty($images)) {
                        $product->product_images_urls = array_map(function($image) {
                            return asset('storage/products/additional/' . $image);
                        }, $images);
                    } else {
                        $product->product_images_urls = [];
                    }
                } else {
                    $product->product_images_urls = [];
                }
                
                return $product;
            });

            return response()->json([
                'status' => true,
                'data' => $products
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        try {
            // Extract numeric ID from the complex string
            $numericId = $this->extractNumericId($id);
            
            if (!$numericId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid product ID format'
                ], 400);
            }
            
            \Log::info('Original ID: ' . $id . ' | Extracted ID: ' . $numericId);
            
            $product = Product::with(['category', 'sizes'])->find($numericId);

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product not found with ID: ' . $numericId
                ], 404);
            }

            // Add image URLs
            $product->image_url = $product->image ? asset('storage/products/' . $product->image) : null;
            
            // Check if product_images exists and is an array
            if ($product->product_images) {
                $images = is_array($product->product_images) 
                    ? $product->product_images 
                    : json_decode($product->product_images, true) ?? [];
                
                if (!empty($images)) {
                    $product->product_images_urls = array_map(function($image) {
                        return asset('storage/products/additional/' . $image);
                    }, $images);
                } else {
                    $product->product_images_urls = [];
                }
            } else {
                $product->product_images_urls = [];
            }

            return response()->json([
                'status' => true,
                'data' => $product
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching product: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create product
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'cate_id' => 'required|exists:categories,id',
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:products,slug',
                'original_price' => 'required|numeric|min:0',
                'selling_price' => 'required|numeric|min:0',
                'qty' => 'nullable|integer|min:0',
                'tax' => 'nullable|numeric|min:0|max:100',
                'status' => 'nullable|boolean',
                'trending' => 'nullable|boolean',
                'small_description' => 'nullable|string',
                'description' => 'required|string',
                'meta_title' => 'nullable|string|max:255',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
                'product_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                
                // Size validation
                'has_sizes' => 'sometimes|string|in:0,1',
                'size_category' => 'required_if:has_sizes,1|in:clothing,shoes,kids,numeric',
                'selected_sizes' => 'required_if:has_sizes,1|json',
                'size_stocks' => 'required_if:has_sizes,1|json',
                'size_prices' => 'nullable|json'
            ]);

            // Generate slug if empty
            $slug = $request->slug ?: Str::slug($request->name);

            // Handle main image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $imagePath = time() . '_main_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $file->storeAs('products', $imagePath, 'public');
            }

            // Handle additional images
            $additionalImages = [];
            if ($request->hasFile('product_images')) {
                foreach ($request->file('product_images') as $index => $file) {
                    $filename = time() . '_' . ($index + 1) . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                    $file->storeAs('products/additional', $filename, 'public');
                    $additionalImages[] = $filename;
                }
            }

            // Calculate total quantity
            $totalQty = 0;
            $hasSizes = $request->has_sizes === '1';
            
            if ($hasSizes) {
                $sizeStocks = json_decode($request->size_stocks, true);
                $totalQty = is_array($sizeStocks) ? array_sum($sizeStocks) : 0;
            }

            // Create product
            $product = Product::create([
                'cate_id' => $request->cate_id,
                'name' => $request->name,
                'slug' => $slug,
                'original_price' => $request->original_price,
                'selling_price' => $request->selling_price,
                'qty' => $hasSizes ? $totalQty : ($request->qty ?? 0),
                'tax' => $request->tax,
                'status' => $request->boolean('status', true),
                'trending' => $request->boolean('trending', false),
                'small_description' => $request->small_description,
                'description' => $request->description,
                'meta_title' => $request->meta_title,
                'meta_keywords' => $request->meta_keywords,
                'meta_description' => $request->meta_description,
                'image' => $imagePath,
                'product_images' => !empty($additionalImages) ? $additionalImages : null
            ]);

            // Save sizes if enabled
            if ($hasSizes) {
                $selectedSizes = json_decode($request->selected_sizes, true);
                $sizeStocks = json_decode($request->size_stocks, true);
                $sizePrices = $request->has('size_prices') ? json_decode($request->size_prices, true) : [];

                if (is_array($selectedSizes) && is_array($sizeStocks)) {
                    foreach ($selectedSizes as $index => $size) {
                        $stock = isset($sizeStocks[$index]) ? (int)$sizeStocks[$index] : 0;
                        
                        // Get price for this size if available
                        $price = null;
                        $sellingPrice = $request->selling_price;
                        $priceAdjustment = 0;
                        
                        if (isset($sizePrices[$index]) && $sizePrices[$index] !== null) {
                            $price = (float)$sizePrices[$index];
                            $sellingPrice = $price;
                            $priceAdjustment = $price - $request->selling_price;
                        }

                        ProductSize::create([
                            'product_id' => $product->id,
                            'size_category' => $request->size_category,
                            'size' => $size,
                            'stock' => $stock,
                            'price' => $price,
                            'original_price' => $request->original_price,
                            'selling_price' => $sellingPrice,
                            'price_adjustment' => $priceAdjustment
                        ]);
                    }
                }
            }

            DB::commit();

            // Load relationships
            $product->load(['category', 'sizes']);

            // Add image URLs to response
            $product->image_url = $product->image ? asset('storage/products/' . $product->image) : null;
            
            if ($product->product_images) {
                $product->product_images_urls = array_map(function($img) {
                    return asset('storage/products/additional/' . $img);
                }, $product->product_images);
            } else {
                $product->product_images_urls = [];
            }

            return response()->json([
                'status' => true,
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        try {
            // Extract numeric ID
            $numericId = $this->extractNumericId($id);
            
            if (!$numericId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid product ID format'
                ], 400);
            }
            
            DB::beginTransaction();
            
            $product = Product::findOrFail($numericId);

            // Handle JSON strings
            if ($request->has('existing_images')) {
                $existingImages = json_decode($request->existing_images, true);
                $request->merge(['existing_images' => $existingImages]);
            }

            if ($request->has('images_to_remove')) {
                $imagesToRemove = json_decode($request->images_to_remove, true);
                $request->merge(['images_to_remove' => $imagesToRemove]);
            }

            // Convert string boolean values
            $request->merge([
                'status' => filter_var($request->status, FILTER_VALIDATE_BOOLEAN),
                'trending' => filter_var($request->trending, FILTER_VALIDATE_BOOLEAN),
            ]);

            $validatedData = $request->validate([
                'cate_id' => 'required|exists:categories,id',
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:products,slug,' . $numericId,
                'original_price' => 'required|numeric|min:0',
                'selling_price' => 'required|numeric|min:0',
                'qty' => 'nullable|integer|min:0',
                'tax' => 'nullable|numeric|min:0|max:100',
                'status' => 'nullable|boolean',
                'trending' => 'nullable|boolean',
                'small_description' => 'nullable|string',
                'description' => 'required|string',
                'meta_title' => 'nullable|string|max:255',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'product_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                
                // Size validation
                'has_sizes' => 'sometimes|string|in:0,1',
                'size_category' => 'required_if:has_sizes,1|in:clothing,shoes,kids,numeric',
                'selected_sizes' => 'required_if:has_sizes,1|json',
                'size_stocks' => 'required_if:has_sizes,1|json',
                'size_prices' => 'nullable|json'
            ]);

            // Generate slug if empty
            $slug = $request->slug ?: Str::slug($request->name);

            // Handle main image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($product->image) {
                    Storage::disk('public')->delete('products/' . $product->image);
                }
                
                $file = $request->file('image');
                $imageName = time() . '_main_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $file->storeAs('products', $imageName, 'public');
                $product->image = $imageName;
            }

            // Handle images to remove
            if ($request->has('images_to_remove') && !empty($request->images_to_remove)) {
                foreach ($request->images_to_remove as $imageToRemove) {
                    Storage::disk('public')->delete('products/additional/' . $imageToRemove);
                }
            }

            // Handle additional images
            $additionalImages = $request->has('existing_images') ? $request->existing_images : [];
            
            if ($request->hasFile('product_images')) {
                foreach ($request->file('product_images') as $index => $file) {
                    $filename = time() . '_' . ($index + 1) . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                    $file->storeAs('products/additional', $filename, 'public');
                    $additionalImages[] = $filename;
                }
            }
            
            $product->product_images = $additionalImages;

            // Handle sizes
            $hasSizes = $request->has_sizes === '1';
            
            if ($hasSizes) {
                // Delete existing sizes
                $product->sizes()->delete();
                
                // Add new sizes
                $selectedSizes = json_decode($request->selected_sizes, true);
                $sizeStocks = json_decode($request->size_stocks, true);
                $sizePrices = $request->has('size_prices') ? json_decode($request->size_prices, true) : [];

                if (is_array($selectedSizes) && is_array($sizeStocks)) {
                    $totalQty = 0;
                    
                    foreach ($selectedSizes as $index => $size) {
                        $stock = isset($sizeStocks[$index]) ? (int)$sizeStocks[$index] : 0;
                        $totalQty += $stock;
                        
                        // Get price for this size if available
                        $price = null;
                        $sellingPrice = $request->selling_price;
                        $priceAdjustment = 0;
                        
                        if (isset($sizePrices[$index]) && $sizePrices[$index] !== null) {
                            $price = (float)$sizePrices[$index];
                            $sellingPrice = $price;
                            $priceAdjustment = $price - $request->selling_price;
                        }

                        ProductSize::create([
                            'product_id' => $product->id,
                            'size_category' => $request->size_category,
                            'size' => $size,
                            'stock' => $stock,
                            'price' => $price,
                            'original_price' => $request->original_price,
                            'selling_price' => $sellingPrice,
                            'price_adjustment' => $priceAdjustment
                        ]);
                    }
                    
                    $product->qty = $totalQty;
                }
            } else {
                $product->qty = $request->qty ?? $product->qty;
                // Delete any existing sizes if sizes are disabled
                $product->sizes()->delete();
            }

            // Update other fields
            $product->cate_id = $request->cate_id;
            $product->name = $request->name;
            $product->slug = $slug;
            $product->original_price = $request->original_price;
            $product->selling_price = $request->selling_price;
            $product->tax = $request->tax;
            $product->status = $request->status;
            $product->trending = $request->trending;
            $product->small_description = $request->small_description;
            $product->description = $request->description;
            $product->meta_title = $request->meta_title;
            $product->meta_keywords = $request->meta_keywords;
            $product->meta_description = $request->meta_description;
            
            $product->save();

            DB::commit();

            // Load category relationship
            $product->load(['category', 'sizes']);

            // Add image URLs to response
            $product->image_url = $product->image ? asset('storage/products/' . $product->image) : null;
            
            if ($product->product_images) {
                $product->product_images_urls = array_map(function($img) {
                    return asset('storage/products/additional/' . $img);
                }, $product->product_images);
            } else {
                $product->product_images_urls = [];
            }

            return response()->json([
                'status' => true,
                'message' => 'Product updated successfully',
                'data' => $product
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        try {
            // Extract numeric ID
            $numericId = $this->extractNumericId($id);
            
            if (!$numericId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid product ID format'
                ], 400);
            }
            
            $product = Product::findOrFail($numericId);
            
            // Delete main image
            if ($product->image) {
                Storage::disk('public')->delete('products/' . $product->image);
            }
            
            // Delete additional images
            if ($product->product_images) {
                $images = is_array($product->product_images) 
                    ? $product->product_images 
                    : json_decode($product->product_images, true) ?? [];
                    
                foreach ($images as $image) {
                    Storage::disk('public')->delete('products/additional/' . $image);
                }
            }
            
            // Sizes will be deleted automatically due to foreign key constraint
            $product->delete();

            return response()->json([
                'status' => true,
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products by category
     */
    public function getByCategory($categoryId)
    {
        try {
            // Extract numeric ID if needed
            $numericId = $this->extractNumericId($categoryId) ?? $categoryId;
            
            $products = Product::where('cate_id', $numericId)
                ->with(['category', 'sizes'])
                ->latest()
                ->get();
                
            // Transform to add image URLs
            $products->transform(function($product) {
                $product->image_url = $product->image ? asset('storage/products/' . $product->image) : null;
                
                if ($product->product_images) {
                    $images = is_array($product->product_images) 
                        ? $product->product_images 
                        : json_decode($product->product_images, true) ?? [];
                    
                    $product->product_images_urls = !empty($images) 
                        ? array_map(function($image) {
                            return asset('storage/products/additional/' . $image);
                        }, $images)
                        : [];
                } else {
                    $product->product_images_urls = [];
                }
                
                return $product;
            });
            
            return response()->json([
                'status' => true,
                'data' => $products
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch products by category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}