<?php
// database/migrations/[timestamp]_create_carts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('product_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('size_id')
                ->nullable()
                ->constrained('product_sizes')
                ->onDelete('set null');

            $table->integer('quantity')->default(1);

            $table->timestamps();

            // New unique constraint: same product with different sizes allowed
            $table->unique(['user_id', 'product_id', 'size_id'], 'cart_user_product_size_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};