<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CancellationRequest;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CancellationRequestController extends Controller
{
    /**
     * Display a listing of cancellation requests for the authenticated user.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            $query = CancellationRequest::with(['order', 'processor'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc');
            
            if ($request->has('status') && in_array($request->status, ['pending', 'approved', 'rejected'])) {
                $query->where('status', $request->status);
            }
            
            $cancellations = $query->paginate($request->get('per_page', 15));
            
            return response()->json([
                'status' => true,
                'data' => $cancellations,
                'message' => 'Cancellation requests retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching cancellations: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch cancellation requests'
            ], 500);
        }
    }

    /**
     * Store a newly created cancellation request.
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            Log::info('Cancellation request received:', [
                'user_id' => $user->id,
                'data' => $request->all()
            ]);
            
            // Validate request
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|integer|exists:orders,id',
                'reason' => 'required|in:changed_mind,wrong_item,shipping_delay,better_price,payment_issue,duplicate_order,other',
                'reason_note' => 'nullable|string|max:1000'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $orderId = $request->order_id;
            
            // Check if order belongs to the user
            $order = Order::where('id', $orderId)
                ->where('user_id', $user->id)
                ->first();
            
            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found or does not belong to you'
                ], 404);
            }
            
            // Check if order can be cancelled (ONLY BEFORE SHIPPING)
            $cancellationCheck = $this->canOrderBeCancelled($order);
            
            if (!$cancellationCheck['can_cancel']) {
                return response()->json([
                    'status' => false,
                    'message' => $cancellationCheck['message'],
                    'reason' => $cancellationCheck['reason']
                ], 400);
            }
            
            // Check if a cancellation request already exists
            $existingRequest = CancellationRequest::where('order_id', $orderId)
                ->where('status', CancellationRequest::STATUS_PENDING)
                ->first();
            
            if ($existingRequest) {
                return response()->json([
                    'status' => false,
                    'message' => 'A pending cancellation request already exists for this order'
                ], 409);
            }
            
            DB::beginTransaction();
            
            // Prepare data for creation
            $cancellationData = [
                'order_id' => (int) $orderId,
                'user_id' => (int) $user->id,
                'reason' => $request->reason,
                'reason_note' => $request->reason_note,
                'status' => CancellationRequest::STATUS_PENDING,
                'refund_status' => $order->payment_method === 'cod' ? null : CancellationRequest::REFUND_PENDING,
                'refund_amount' => $order->payment_method === 'cod' ? null : (float) $order->total,
                'refund_transaction_id' => null,
                'refunded_at' => null,
                'admin_response' => null,
                'processed_by' => null,
                'processed_at' => null
            ];
            
            Log::info('Creating cancellation request with data:', $cancellationData);
            
            // Create cancellation request
            $cancellation = CancellationRequest::create($cancellationData);
            
            if (!$cancellation) {
                throw new \Exception('Failed to create cancellation request record');
            }
            
            Log::info('Cancellation request created successfully:', ['id' => $cancellation->id]);
            
            // DO NOT update order status here - let admin handle it
            
            DB::commit();
            
            // Load the order relationship
            $cancellation->load('order');
            
            return response()->json([
                'status' => true,
                'data' => $cancellation,
                'message' => 'Cancellation request submitted successfully'
            ], 201);
            
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            
            $errorMessage = $e->getMessage();
            $errorInfo = $e->errorInfo ?? [];
            
            Log::error('Database error creating cancellation request: ' . $errorMessage);
            Log::error('SQL: ' . ($e->getSql() ?? 'N/A'));
            Log::error('Bindings: ' . json_encode($e->getBindings() ?? []));
            Log::error('Error info: ' . json_encode($errorInfo));
            
            if (str_contains($errorMessage, 'Data truncated')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid data format. Please check your input.',
                    'error_detail' => config('app.debug') ? $errorMessage : null
                ], 500);
            }
            
            return response()->json([
                'status' => false,
                'message' => 'Database error occurred. Please try again.',
                'error_detail' => config('app.debug') ? $errorMessage : null
            ], 500);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            $errorMessage = $e->getMessage();
            Log::error('Error creating cancellation request: ' . $errorMessage);
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to submit cancellation request. Please try again.',
                'error_detail' => config('app.debug') ? $errorMessage : null
            ], 500);
        }
    }

    /**
     * Display the specified cancellation request.
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            $cancellation = CancellationRequest::with(['order', 'processor'])
                ->where('user_id', $user->id)
                ->where('id', $id)
                ->first();
            
            if (!$cancellation) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cancellation request not found'
                ], 404);
            }
            
            return response()->json([
                'status' => true,
                'data' => $cancellation,
                'message' => 'Cancellation request retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching cancellation: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch cancellation request'
            ], 500);
        }
    }

    /**
     * Cancel a pending cancellation request.
     */
    public function cancel(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            $cancellation = CancellationRequest::where('id', $id)
                ->where('user_id', $user->id)
                ->first();
            
            if (!$cancellation) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cancellation request not found'
                ], 404);
            }
            
            if (!$cancellation->isPending()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only pending requests can be cancelled'
                ], 400);
            }
            
            DB::beginTransaction();
            
            // Get the order before deleting
            $order = $cancellation->order;
            
            // Delete the cancellation request
            $cancellation->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => true,
                'message' => 'Cancellation request cancelled successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error cancelling request: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to cancel request'
            ], 500);
        }
    }

    /**
     * Check if an order can be cancelled based on its status.
     */
    private function canOrderBeCancelled($order)
    {
        // Statuses where cancellation IS allowed (BEFORE shipping)
        $canCancelStatuses = [
            'pending',
            'processing',
            'confirmed'
        ];
        
        if (in_array($order->status, $canCancelStatuses)) {
            return [
                'can_cancel' => true,
                'message' => 'You can cancel this order before it is shipped',
                'reason' => 'eligible'
            ];
        }
        
        $message = 'This order cannot be cancelled at this stage';
        
        if ($order->status === 'shipped') {
            $message = 'This order has already been shipped and cannot be cancelled';
        } elseif ($order->status === 'delivered') {
            $message = 'This order has already been delivered and cannot be cancelled';
        } elseif ($order->status === 'cancelled') {
            $message = 'This order has already been cancelled';
        } elseif ($order->status === 'cancellation_requested') {
            $message = 'A cancellation request is already pending for this order';
        }
        
        return [
            'can_cancel' => false,
            'message' => $message,
            'reason' => 'invalid_status'
        ];
    }

    /**
     * Check cancellation eligibility for an order.
     */
    public function checkEligibility(Request $request, $orderId)
    {
        try {
            $user = $request->user();
            
            $order = Order::where('id', $orderId)
                ->where('user_id', $user->id)
                ->first();
            
            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            $pendingRequest = CancellationRequest::where('order_id', $orderId)
                ->where('status', CancellationRequest::STATUS_PENDING)
                ->exists();
            
            $eligibility = $this->canOrderBeCancelled($order);
            
            $refundAmount = null;
            if ($eligibility['can_cancel'] && $order->payment_method !== 'cod') {
                $refundAmount = $order->total;
            }
            
            return response()->json([
                'status' => true,
                'data' => [
                    'order_id' => (int) $orderId,
                    'order_number' => $order->order_number ?? $order->id,
                    'order_status' => $order->status,
                    'can_cancel' => $eligibility['can_cancel'],
                    'message' => $eligibility['message'],
                    'has_pending_request' => $pendingRequest,
                    'payment_method' => $order->payment_method,
                    'refund_amount' => $refundAmount,
                    'order_total' => $order->total
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error checking eligibility: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to check cancellation eligibility'
            ], 500);
        }
    }

    // ============================================
    // ADMIN METHODS
    // ============================================

    /**
     * Get all cancellation requests (Admin only) - NEW METHOD
     */
    public function all(Request $request)
    {
        try {
            // Check if user is admin
            if ($request->user()->role !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }
            
            $query = CancellationRequest::with(['order', 'user', 'processor'])
                ->orderBy('created_at', 'desc');
            
            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            // Add search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('id', 'LIKE', "%{$search}%")
                      ->orWhereHas('order', function($oq) use ($search) {
                          $oq->where('id', 'LIKE', "%{$search}%");
                      })
                      ->orWhereHas('user', function($uq) use ($search) {
                          $uq->where('name', 'LIKE', "%{$search}%")
                             ->orWhere('email', 'LIKE', "%{$search}%");
                      });
                });
            }
            
            // Sorting
            if ($request->sort === 'oldest') {
                $query->orderBy('created_at', 'asc');
            }
            
            $cancellations = $query->paginate($request->get('per_page', 10));
            
            // Transform data for frontend
            $cancellations->getCollection()->transform(function ($cancellation) {
                return [
                    'id' => $cancellation->id,
                    'order' => $cancellation->order ? [
                        'id' => $cancellation->order->id,
                        'order_number' => 'ORD-' . str_pad($cancellation->order->id, 6, '0', STR_PAD_LEFT),
                        'total' => $cancellation->order->total,
                        'status' => $cancellation->order->status
                    ] : null,
                    'user' => $cancellation->user ? [
                        'id' => $cancellation->user->id,
                        'name' => $cancellation->user->name,
                        'email' => $cancellation->user->email
                    ] : null,
                    'reason' => $cancellation->reason,
                    'reason_note' => $cancellation->reason_note,
                    'status' => $cancellation->status,
                    'refund_status' => $cancellation->refund_status,
                    'refund_amount' => $cancellation->refund_amount,
                    'admin_response' => $cancellation->admin_response,
                    'processor' => $cancellation->processor ? ['name' => $cancellation->processor->name] : null,
                    'created_at' => $cancellation->created_at,
                    'processed_at' => $cancellation->processed_at
                ];
            });
            
            return response()->json([
                'status' => true,
                'data' => $cancellations,
                'message' => 'Cancellation requests retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching all cancellations: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch cancellation requests'
            ], 500);
        }
    }

    /**
     * Get all pending cancellation requests (Admin only)
     */
    public function pending(Request $request)
    {
        try {
            // Check if user is admin
            if ($request->user()->role !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }
            
            $query = CancellationRequest::with(['order', 'user', 'processor'])
                ->where('status', CancellationRequest::STATUS_PENDING)
                ->orderBy('created_at', 'desc');
            
            // Add search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('id', 'LIKE', "%{$search}%")
                      ->orWhereHas('order', function($oq) use ($search) {
                          $oq->where('id', 'LIKE', "%{$search}%");
                      })
                      ->orWhereHas('user', function($uq) use ($search) {
                          $uq->where('name', 'LIKE', "%{$search}%")
                             ->orWhere('email', 'LIKE', "%{$search}%");
                      });
                });
            }
            
            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all' && $request->status !== 'pending') {
                $query->where('status', $request->status);
            }
            
            // Sorting
            if ($request->sort === 'oldest') {
                $query->orderBy('created_at', 'asc');
            }
            
            $cancellations = $query->paginate($request->get('per_page', 10));
            
            // Transform data for frontend
            $cancellations->getCollection()->transform(function ($cancellation) {
                return [
                    'id' => $cancellation->id,
                    'order' => $cancellation->order ? [
                        'id' => $cancellation->order->id,
                        'order_number' => 'ORD-' . str_pad($cancellation->order->id, 6, '0', STR_PAD_LEFT),
                        'total' => $cancellation->order->total,
                        'status' => $cancellation->order->status
                    ] : null,
                    'user' => $cancellation->user ? [
                        'id' => $cancellation->user->id,
                        'name' => $cancellation->user->name,
                        'email' => $cancellation->user->email
                    ] : null,
                    'reason' => $cancellation->reason,
                    'reason_note' => $cancellation->reason_note,
                    'status' => $cancellation->status,
                    'refund_status' => $cancellation->refund_status,
                    'refund_amount' => $cancellation->refund_amount,
                    'admin_response' => $cancellation->admin_response,
                    'processor' => $cancellation->processor ? ['name' => $cancellation->processor->name] : null,
                    'created_at' => $cancellation->created_at,
                    'processed_at' => $cancellation->processed_at
                ];
            });
            
            return response()->json([
                'status' => true,
                'data' => $cancellations,
                'message' => 'Pending cancellation requests retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching pending cancellations: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch pending cancellation requests'
            ], 500);
        }
    }

    /**
     * Get a specific cancellation request by ID (Admin only)
     */
    public function adminShow(Request $request, $id)
    {
        try {
            // Check if user is admin
            if ($request->user()->role !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }
            
            $cancellation = CancellationRequest::with(['order', 'user', 'processor'])
                ->findOrFail($id);
            
            return response()->json([
                'status' => true,
                'data' => $cancellation,
                'message' => 'Cancellation request retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching cancellation: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Cancellation request not found'
            ], 404);
        }
    }

    /**
     * Approve a cancellation request (Admin only)
     */
    public function approve(Request $request, $id)
    {
        try {
            // Check if user is admin
            if ($request->user()->role !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'refund_amount' => 'required|numeric|min:0',
                'admin_response' => 'nullable|string|max:1000'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            DB::beginTransaction();
            
            $cancellation = CancellationRequest::with('order')->findOrFail($id);
            
            if (!$cancellation->isPending()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only pending requests can be approved'
                ], 400);
            }
            
            // Update cancellation request
            $cancellation->update([
                'status' => CancellationRequest::STATUS_APPROVED,
                'refund_amount' => $request->refund_amount,
                'admin_response' => $request->admin_response,
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
                'refund_status' => $cancellation->order && $cancellation->order->payment_method !== 'cod' ? CancellationRequest::REFUND_PENDING : null
            ]);
            
            // Update order status to cancelled
            if ($cancellation->order) {
                $cancellation->order->update([
                    'status' => 'cancelled'
                ]);
            }
            
            DB::commit();
            
            return response()->json([
                'status' => true,
                'message' => 'Cancellation request approved successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error approving cancellation: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to approve cancellation request'
            ], 500);
        }
    }

    /**
     * Reject a cancellation request (Admin only)
     */
    public function reject(Request $request, $id)
    {
        try {
            // Check if user is admin
            if ($request->user()->role !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'admin_response' => 'required|string|max:1000'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            DB::beginTransaction();
            
            $cancellation = CancellationRequest::with('order')->findOrFail($id);
            
            if (!$cancellation->isPending()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only pending requests can be rejected'
                ], 400);
            }
            
            // Update cancellation request
            $cancellation->update([
                'status' => CancellationRequest::STATUS_REJECTED,
                'admin_response' => $request->admin_response,
                'processed_by' => $request->user()->id,
                'processed_at' => now()
            ]);
            
            DB::commit();
            
            return response()->json([
                'status' => true,
                'message' => 'Cancellation request rejected successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error rejecting cancellation: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to reject cancellation request'
            ], 500);
        }
    }

    /**
     * Get cancellation statistics (Admin only)
     */
    public function stats(Request $request)
    {
        try {
            // Check if user is admin
            if ($request->user()->role !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }
            
            $stats = [
                'total' => CancellationRequest::count(),
                'pending' => CancellationRequest::where('status', CancellationRequest::STATUS_PENDING)->count(),
                'approved' => CancellationRequest::where('status', CancellationRequest::STATUS_APPROVED)->count(),
                'rejected' => CancellationRequest::where('status', CancellationRequest::STATUS_REJECTED)->count(),
                'today' => CancellationRequest::whereDate('created_at', today())->count()
            ];
            
            return response()->json([
                'status' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching stats: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }
}