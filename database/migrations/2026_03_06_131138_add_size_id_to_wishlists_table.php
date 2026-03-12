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
        Schema::table('wishlists', function (Blueprint $table) {
            // Add size_id column (nullable because product might not have size)
            $table->foreignId('size_id')
                  ->nullable()
                  ->after('product_id')
                  ->constrained('product_sizes')
                  ->onDelete('set null');
            
            // Remove the old unique constraint
            $table->dropUnique(['user_id', 'product_id']);
            
            // Add new unique constraint including size_id
            $table->unique(['user_id', 'product_id', 'size_id'], 'wishlists_user_product_size_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wishlists', function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique('wishlists_user_product_size_unique');
            
            // Drop size_id column and foreign key
            $table->dropForeign(['size_id']);
            $table->dropColumn('size_id');
            
            // Restore old unique constraint
            $table->unique(['user_id', 'product_id']);
        });
    }
};