<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    // Get all categories
    public function index()
    {
        $categories = Category::latest()->get();
        
        // Transform the collection to add full image URL
        $categories->transform(function($category) {
            if ($category->image) {
                // If image already has 'categories/' prefix, don't add it again
                if (strpos($category->image, 'categories/') === 0) {
                    $category->image_url = asset('storage/' . $category->image);
                } else {
                    $category->image_url = asset('storage/categories/' . $category->image);
                }
            } else {
                $category->image_url = null;
            }
            return $category;
        });

        return response()->json([
            'status' => true,
            'data' => $categories
        ]);
    }

    // Get single category
    public function show($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'status' => false,
                'message' => 'Category not found'
            ], 404);
        }

        // Add full image URL
        if ($category->image) {
            if (strpos($category->image, 'categories/') === 0) {
                $category->image_url = asset('storage/' . $category->image);
            } else {
                $category->image_url = asset('storage/categories/' . $category->image);
            }
        }

        return response()->json([
            'status' => true,
            'data' => $category
        ]);
    }

    // Create category
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:categories,slug',
                'status' => 'nullable|boolean',
                'popular' => 'nullable|boolean',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            // Generate slug if empty
            $slug = $request->slug ?: Str::slug($request->name);

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                // Store in categories folder
                $imagePath = $request->file('image')->store('categories', 'public');
                // This will store path like: categories/filename.jpg
            }

            // Create category
            $category = Category::create([
                'name' => $request->name,
                'slug' => $slug,
                'status' => $request->boolean('status', true),
                'popular' => $request->boolean('popular', false),
                'image' => $imagePath, // Stores as 'categories/filename.jpg'
            ]);

            // Add full image URL to response
            $categoryData = $category->toArray();
            $categoryData['image_url'] = $category->image ? asset('storage/' . $category->image) : null;

            return response()->json([
                'status' => true,
                'message' => 'Category created successfully',
                'data' => $categoryData
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
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update category
    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:categories,slug,' . $id,
                'status' => 'nullable|boolean',
                'popular' => 'nullable|boolean',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            // Generate slug if empty
            $slug = $request->slug ?: Str::slug($request->name);

            // Handle image upload if provided
            if ($request->hasFile('image')) {
                // Delete old image
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }
                
                // Upload new image
                $imagePath = $request->file('image')->store('categories', 'public');
                $category->image = $imagePath;
            }

            // Update category
            $category->update([
                'name' => $request->name,
                'slug' => $slug,
                'status' => $request->boolean('status', true),
                'popular' => $request->boolean('popular', false),
            ]);

            // Add full image URL to response
            $categoryData = $category->toArray();
            $categoryData['image_url'] = $category->image ? asset('storage/' . $category->image) : null;

            return response()->json([
                'status' => true,
                'message' => 'Category updated successfully',
                'data' => $categoryData
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
                'message' => 'Failed to update category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete category
    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
            
            // Delete image file
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            
            $category->delete();

            return response()->json([
                'status' => true,
                'message' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}