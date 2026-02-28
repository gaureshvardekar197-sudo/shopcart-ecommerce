<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
             // Foreign key to users table
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            
            // Address Information (stored as JSON)
            $table->json('shipping_address');
            $table->json('billing_address');
            
            // Price Details
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_charge', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            
            // Payment Information
            $table->string('payment_method'); // cod / online
            
            // Order Status (Only Pending and Completed)
           $table->enum('status', [
                'pending',      // Order placed, waiting for confirmation
                'confirmed',    // Order confirmed by admin
                'processing',   // Being processed/packed
                'shipped',      // Shipped to customer
                'out_for_delivery', // Out for delivery
                'delivered',    // Delivered successfully
                'cancelled',    // Cancelled by user/admin
                'refunded',     // Refunded
                'failed'        // Payment failed or order failed
            ])->default('pending');
            
            // Additional Information
            $table->text('delivery_instructions')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
