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

    // DELETE /api/addresses/{id}
    public function destroy($id)
    {
        try {
            $address = Address::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $address->delete();

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