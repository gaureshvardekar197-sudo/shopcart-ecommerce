<?php
// database/migrations/[timestamp]_update_carts_table_for_sizes.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateCartsTableForSizes extends Migration
{
    public function up()
    {
        // First, drop the old unique constraint
        Schema::table('carts', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'product_id']);
        });

        // Then add size_id column if it doesn't exist
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'size_id')) {
                $table->foreignId('size_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('product_sizes')
                    ->onDelete('set null');
            }
        });

        // Remove any potential duplicates before adding new constraint
        DB::statement('
            DELETE c1 FROM carts c1
            INNER JOIN carts c2 
            WHERE c1.id > c2.id 
            AND c1.user_id = c2.user_id 
            AND c1.product_id = c2.product_id 
            AND (c1.size_id = c2.size_id OR (c1.size_id IS NULL AND c2.size_id IS NULL))
        ');

        // Add new unique constraint
        Schema::table('carts', function (Blueprint $table) {
            $table->unique(['user_id', 'product_id', 'size_id'], 'cart_user_product_size_unique');
        });
    }

    public function down()
    {
        Schema::table('carts', function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique('cart_user_product_size_unique');

            // Drop size_id column and foreign key
            if (Schema::hasColumn('carts', 'size_id')) {
                $table->dropForeign(['size_id']);
                $table->dropColumn('size_id');
            }

            // Restore old unique constraint
            $table->unique(['user_id', 'product_id']);
        });
    }
}