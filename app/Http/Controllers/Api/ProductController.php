<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // Get all products
    public function index()
    {
        $products = Product::with('category')->latest()->get();
        
        // Transform to add image URLs
        $products->transform(function($product) {
            $product->image_url = $product->image ? asset('storage/products/' . $product->image) : null;
            
            // Check if product_images exists and is an array
            if ($product->product_images) {
                // Ensure it's an array (the cast should handle this, but let's be safe)
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
    }

    // Get single product
    public function show($id)
    {
        $product = Product::with('category')->find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Add image URLs
        $product->image_url = $product->image ? asset('storage/products/' . $product->image) : null;
        
        // Check if product_images exists and is an array
        if ($product->product_images) {
            // Ensure it's an array
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
    }

    // Create product
    public function store(Request $request)
    {
        try {
            $request->validate([
                'cate_id' => 'required|exists:categories,id',
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:products,slug',
                'original_price' => 'required|numeric|min:0',
                'selling_price' => 'required|numeric|min:0',
                'qty' => 'required|integer|min:0',
                'tax' => 'nullable|numeric|min:0|max:100',
                'status' => 'nullable|boolean',
                'trending' => 'nullable|boolean',
                'small_description' => 'nullable|string',
                'description' => 'required|string',
                'meta_title' => 'nullable|string|max:255',
                'meta_keywords' => 'nullable|string',
                'meta_description' => 'nullable|string',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
                'product_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
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

            $product = Product::create([
                'cate_id' => $request->cate_id,
                'name' => $request->name,
                'slug' => $slug,
                'original_price' => $request->original_price,
                'selling_price' => $request->selling_price,
                'qty' => $request->qty,
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

            // Load category relationship
            $product->load('category');

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
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update product
    public function update(Request $request, $id)
    {
    try {
        $product = Product::findOrFail($id);

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
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $id,
            'original_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'qty' => 'required|integer|min:0',
            'tax' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|boolean',
            'trending' => 'nullable|boolean',
            'small_description' => 'nullable|string',
            'description' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'product_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
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

        // Update other fields
        $product->cate_id = $request->cate_id;
        $product->name = $request->name;
        $product->slug = $slug;
        $product->original_price = $request->original_price;
        $product->selling_price = $request->selling_price;
        $product->qty = $request->qty;
        $product->tax = $request->tax;
        $product->status = $request->status;
        $product->trending = $request->trending;
        $product->small_description = $request->small_description;
        $product->description = $request->description;
        $product->meta_title = $request->meta_title;
        $product->meta_keywords = $request->meta_keywords;
        $product->meta_description = $request->meta_description;
        
        $product->save();

        // Load category relationship
        $product->load('category');

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
        return response()->json([
            'status' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Failed to update product',
            'error' => $e->getMessage()
        ], 500);
    }
    }

    // Delete product
    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            
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

    // Get products by category
    public function getByCategory($categoryId)
    {
        $products = Product::where('cate_id', $categoryId)
            ->with('category')
            ->latest()
            ->get();
            
        return response()->json([
            'status' => true,
            'data' => $products
        ]);
    }
}