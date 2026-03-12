<?php
// app/Http/Controllers/Api/AddressController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AddressController extends Controller
{
    // GET /api/addresses
    public function index()
    {
        try {
            $addresses = Address::where('user_id', auth()->id())
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $addresses,
                'message' => 'Addresses retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching addresses: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve addresses'
            ], 500);
        }
    }

    // POST /api/addresses
    public function store(Request $request)
    {
        // Log the incoming request for debugging
        Log::info('Address store request:', $request->all());

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => 'required|string|max:10',
            'landmark' => 'nullable|string|max:255',
            'address_type' => 'nullable|in:home,work,other',
            'is_default' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            Log::error('Address validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // If setting as default, remove default from other addresses
            if ($request->is_default) {
                Address::where('user_id', auth()->id())
                    ->update(['is_default' => false]);
            }

            $address = Address::create([
                'user_id' => auth()->id(),
                'full_name' => $request->full_name,
                'phone' => $request->phone,
                'email' => $request->email,
                'address_line1' => $request->address_line1,
                'address_line2' => $request->address_line2,
                'city' => $request->city,
                'state' => $request->state,
                'pincode' => $request->pincode,
                'landmark' => $request->landmark,
                'address_type' => $request->address_type ?? 'home',
                'is_default' => $request->is_default ?? false
            ]);

            Log::info('Address saved successfully:', ['address_id' => $address->id]);

            return response()->json([
                'success' => true,
                'message' => 'Address saved successfully',
                'data' => $address
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error saving address: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save address: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/addresses/{id}
     * Get single address by ID
     */
    public function show($id)
    {
        try {
            $address = Address::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $address,
                'message' => 'Address retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching address: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Address not found'
            ], 404);
        }
    }

    /**
     * PUT /api/addresses/{id}
     * Update an existing address
     */
    public function update(Request $request, $id)
    {
        // Log the incoming request for debugging
        Log::info('Address update request:', ['id' => $id, 'data' => $request->all()]);

        try {
            // Find the address belonging to the authenticated user
            $address = Address::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

        } catch (\Exception $e) {
            Log::error('Address not found for update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Address not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'sometimes|required|email|max:255',
            'address_line1' => 'sometimes|required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'state' => 'sometimes|required|string|max:100',
            'pincode' => 'sometimes|required|string|max:10',
            'landmark' => 'nullable|string|max:255',
            'address_type' => 'nullable|in:home,work,other',
            'is_default' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            Log::error('Address update validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // If setting as default, remove default from other addresses
            if ($request->has('is_default') && $request->is_default) {
                Address::where('user_id', auth()->id())
                    ->where('id', '!=', $id) // Exclude current address
                    ->update(['is_default' => false]);
            }

            // Update only the fields that are provided
            $updateData = [];
            
            $fillableFields = [
                'full_name', 'phone', 'email', 'address_line1', 'address_line2',
                'city', 'state', 'pincode', 'landmark', 'address_type', 'is_default'
            ];

            foreach ($fillableFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->$field;
                }
            }

            $address->update($updateData);

            Log::info('Address updated successfully:', ['address_id' => $address->id]);

            return response()->json([
                'success' => true,
                'message' => 'Address updated successfully',
                'data' => $address->fresh() // Get fresh data from database
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating address: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update address: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/addresses/{id}/default
     * Set address as default
     */
    public function setDefault($id)
    {
        try {
            // Find the address
            $address = Address::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            // Remove default from all other addresses
            Address::where('user_id', auth()->id())
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);

            // Set this address as default
            $address->update(['is_default' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Default address updated successfully',
                'data' => $address->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Error setting default address: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to set default address'
            ], 500);
        }
    }

    // DELETE /api/addresses/{id}
    public function destroy($id)
    {
        try {
            $address = Address::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            // If this was the default address, you might want to set another as default
            $wasDefault = $address->is_default;

            $address->delete();

            // If this was the default address, set another address as default if exists
            if ($wasDefault) {
                $anotherAddress = Address::where('user_id', auth()->id())->first();
                if ($anotherAddress) {
                    $anotherAddress->update(['is_default' => true]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Address deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting address: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete address'
            ], 500);
        }
    }
}