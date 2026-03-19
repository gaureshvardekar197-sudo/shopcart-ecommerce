<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * All available order status options (matching the migration)
     */
    protected $statusOptions = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded',
        'failed'
    ];

    // ==========================
    // USER: Place Order with Items
    // ==========================
    public function store(Request $request)
    {
        // Log the incoming request for debugging
        Log::info('Order request received:', $request->all());

        // Validate request
        $validator = Validator::make($request->all(), [
            // Items validation
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.name' => 'required|string',
            'items.*.image' => 'nullable|string',

            // Address validation
            'shipping_address' => 'required|array',
            'shipping_address.full_name' => 'required|string|max:255',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.email' => 'required|email|max:255',
            'shipping_address.address_line1' => 'required|string|max:255',
            'shipping_address.address_line2' => 'nullable|string|max:255',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.state' => 'required|string|max:100',
            'shipping_address.pincode' => 'required|string|max:10',
            'shipping_address.landmark' => 'nullable|string|max:255',
            'shipping_address.address_type' => 'nullable|in:home,work,other',

            'billing_address' => 'required|array',
            'billing_address.full_name' => 'required|string|max:255',
            'billing_address.phone' => 'required|string|max:20',
            'billing_address.email' => 'required|email|max:255',
            'billing_address.address_line1' => 'required|string|max:255',
            'billing_address.address_line2' => 'nullable|string|max:255',
            'billing_address.city' => 'required|string|max:100',
            'billing_address.state' => 'required|string|max:100',
            'billing_address.pincode' => 'required|string|max:10',

            // Price validation
            'subtotal' => 'required|numeric|min:0',
            'delivery_charge' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',

            // Other
            'payment_method' => 'required|string|in:cod,online',
            'delivery_instructions' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            Log::error('Order validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create order - shipping_address and billing_address will be automatically cast to JSON
            $order = Order::create([
                'user_id' => auth()->id(),
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address,
                'subtotal' => $request->subtotal,
                'delivery_charge' => $request->delivery_charge ?? 0,
                'total' => $request->total,
                'payment_method' => $request->payment_method,
                'status' => 'pending', // Default status when order is placed
                'delivery_instructions' => $request->delivery_instructions,
            ]);

            Log::info('Order created:', ['order_id' => $order->id]);

            // Create order items with images
            foreach ($request->items as $item) {
                // Get image from item or fetch from product if not provided
                $image = $item['image'] ?? null;
                
                // If image not provided in request, try to get from product
                if (!$image && isset($item['product_id'])) {
                    $product = \App\Models\Product::find($item['product_id']);
                    $image = $product ? $product->image : null;
                }

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['price'] * $item['quantity'],
                    'image' => $image, // Save the image
                ]);
                
                Log::info('Order item created:', [
                    'item_id' => $orderItem->id,
                    'image' => $image
                ]);
            }

            // Clear user's cart after successful order
            \App\Models\Cart::where('user_id', auth()->id())->delete();

            DB::commit();

            // Load items relationship
            $order->load('items');

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Order creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to place order: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==========================
    // USER: View Own Orders
    // ==========================
    public function myOrders()
    {
        try {
            $orders = Order::with('items')
                ->where('user_id', auth()->id())
                ->latest()
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                        'total' => $order->total,
                        'status' => $order->status,
                        'status_label' => $this->getStatusLabel($order->status),
                        'status_color' => $this->getStatusColor($order->status),
                        'payment_method' => $order->payment_method,
                        'items_count' => $order->items->count(),
                        'created_at' => $order->created_at->format('d M Y, h:i A'),
                        'shipping_address' => $order->shipping_address,
                        'items' => $order->items->map(function($item) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'quantity' => $item->quantity,
                                'price' => $item->price,
                                'total' => $item->total,
                                'image' => $item->image,
                                'image_url' => $item->image ? $this->getFullImageUrl($item->image) : null
                            ];
                        })
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching orders:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders'
            ], 500);
        }
    }

    // ==========================
    // USER: View Single Order
    // ==========================
    public function show($id)
    {
        try {
            $order = Order::with('items')
                ->where('user_id', auth()->id())
                ->findOrFail($id);

            // Add image URLs and status info to items
            $orderData = $order->toArray();
            $orderData['status_label'] = $this->getStatusLabel($order->status);
            $orderData['status_color'] = $this->getStatusColor($order->status);
            
            foreach ($orderData['items'] as &$item) {
                $item['image_url'] = isset($item['image']) ? $this->getFullImageUrl($item['image']) : null;
            }

            return response()->json([
                'success' => true,
                'data' => $orderData,
                'message' => 'Order retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
    }

    // Helper method to get full image URL
    private function getFullImageUrl($image)
    {
        if (!$image) {
            return null;
        }
        
        if (filter_var($image, FILTER_VALIDATE_URL)) {
            return $image;
        }
        
        return url('storage/' . $image);
    }

    // ==========================
    // ADMIN: View All Orders
    // ==========================
    public function adminIndex()
    {
        try {
            $orders = Order::with(['user', 'items'])
                ->latest()
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                        'customer' => [
                            'id' => $order->user->id ?? null,
                            'name' => $order->user->name ?? $order->shipping_address['full_name'] ?? 'N/A',
                            'email' => $order->user->email ?? $order->shipping_address['email'] ?? 'N/A',
                            'phone' => $order->shipping_address['phone'] ?? 'N/A'
                        ],
                        'total' => $order->total,
                        'payment_method' => $order->payment_method,
                        'status' => $order->status,
                        'status_label' => $this->getStatusLabel($order->status),
                        'status_color' => $this->getStatusColor($order->status),
                        'items_count' => $order->items->count(),
                        'created_at' => $order->created_at->format('d M Y, h:i A'),
                        'shipping_address' => $order->shipping_address
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching admin orders:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve orders'
            ], 500);
        }
    }

    // ==========================
    // ADMIN: View Single Order
    // ==========================
    public function adminShow($id)
    {
        try {
            $order = Order::with(['user', 'items'])->findOrFail($id);
            
            // Add status info
            $orderData = $order->toArray();
            $orderData['status_label'] = $this->getStatusLabel($order->status);
            $orderData['status_color'] = $this->getStatusColor($order->status);

            return response()->json([
                'success' => true,
                'data' => $orderData,
                'message' => 'Order retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }
    }

    // ==========================
    // ADMIN: Update Order Status
    // ==========================
    public function updateStatus(Request $request, $id)
    {
        // Validate status against all available options from migration
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,processing,shipped,out_for_delivery,delivered,cancelled,refunded,failed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed. Status must be one of: pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, refunded, failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::findOrFail($id);
            
            // Log status change
            $oldStatus = $order->status;
            $order->status = $request->status;
            $order->save();
            
            Log::info('Order status updated:', [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $order->status,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'id' => $order->id,
                    'status' => $order->status,
                    'status_label' => $this->getStatusLabel($order->status),
                    'status_color' => $this->getStatusColor($order->status)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating order status:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status'
            ], 500);
        }
    }

    // ==========================
    // ADMIN: Get Order Statistics
    // ==========================
    public function getOrderStats()
    {
        try {
            $stats = [];
            foreach ($this->statusOptions as $status) {
                $stats[$status] = Order::where('status', $status)->count();
            }
            
            $stats['total_orders'] = Order::count();
            $stats['total_revenue'] = Order::whereIn('status', ['delivered', 'completed'])->sum('total');
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get order statistics'
            ], 500);
        }
    }

    // ==========================
    // Helper: Get Status Label
    // ==========================
    private function getStatusLabel($status)
    {
        return match($status) {
            'pending' => 'Pending',
            'confirmed' => 'Confirmed',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'out_for_delivery' => 'Out for Delivery',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            'refunded' => 'Refunded',
            'failed' => 'Failed',
            default => ucfirst(str_replace('_', ' ', $status))
        };
    }

    // ==========================
    // Helper: Get Status Color for UI
    // ==========================
    private function getStatusColor($status)
    {
        return match($status) {
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'processing' => 'indigo',
            'shipped' => 'purple',
            'out_for_delivery' => 'orange',
            'delivered' => 'green',
            'cancelled' => 'red',
            'refunded' => 'gray',
            'failed' => 'darkred',
            default => 'gray'
        };
    }

    // ==========================
    // ADMIN: Cancel Order
    // ==========================
    public function cancelOrder($id)
    {
        try {
            $order = Order::findOrFail($id);
            
            // Check if order can be cancelled
            $cancellableStatuses = ['pending', 'confirmed', 'processing'];
            
            if (!in_array($order->status, $cancellableStatuses)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be cancelled in its current status'
                ], 422);
            }
            
            $order->status = 'cancelled';
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => [
                    'id' => $order->id,
                    'status' => $order->status,
                    'status_label' => $this->getStatusLabel($order->status)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order'
            ], 500);
        }
    }
}