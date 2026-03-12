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
        Schema::create('product_sizes', function (Blueprint $table) {
            $table->id();
                        $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('size_category', ['clothing', 'shoes', 'kids', 'numeric'])->default('clothing');
            $table->string('size', 50); // S, M, L, XL, 40, 41, 42, etc.
            $table->integer('stock')->default(0);
            $table->decimal('price', 10, 2)->nullable()->comment('Specific price for this size (if different from base price)');
            $table->decimal('original_price', 10, 2)->nullable()->comment('Original price for this size');
            $table->decimal('selling_price', 10, 2)->nullable()->comment('Selling price for this size');
            $table->decimal('price_adjustment', 10, 2)->default(0)->comment('Price difference from base product price');
            $table->timestamps();
             $table->unique(['product_id', 'size']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_sizes');
    }
};
