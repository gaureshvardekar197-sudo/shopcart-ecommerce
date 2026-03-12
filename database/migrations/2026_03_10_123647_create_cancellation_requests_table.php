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
        Schema::create('cancellation_requests', function (Blueprint $table) {
            $table->id();
            
            // Foreign Keys
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->onDelete('cascade');
            
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            // Cancellation Details
            $table->enum('reason', [
                'changed_mind',
                'wrong_item',
                'shipping_delay',
                'better_price',
                'payment_issue',
                'duplicate_order',
                'other'
            ])->default('other');
            
            $table->text('reason_note')->nullable();
            
            // Request Status
            $table->enum('status', [
                'pending',
                'approved',
                'rejected'
            ])->default('pending');
            
            // Refund Information (only applicable if approved)
            $table->enum('refund_status', [
                'pending',
                'processing',
                'completed',
                'failed'
            ])->nullable();
            
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->string('refund_transaction_id')->nullable();
            $table->timestamp('refunded_at')->nullable();
            
            // Admin Response
            $table->text('admin_response')->nullable();
            $table->foreignId('processed_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            $table->timestamp('processed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('order_id');
            $table->index('user_id');
            $table->index('status');
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cancellation_requests');
    }
};