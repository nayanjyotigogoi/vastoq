<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 20)->unique();
            $table->enum('type', ['flat', 'percent', 'bonus_credits']);
            $table->integer('value'); // flat value in paise / percent 0-100 / bonus credits count
            $table->integer('minAmount')->nullable(); // min purchase in paise
            $table->integer('maxDiscount')->nullable(); // max discount limit in paise
            $table->integer('usageLimit')->default(0);
            $table->integer('usageCount')->default(0);
            $table->integer('perUserLimit')->default(1);
            $table->enum('applicableTo', ['all', 'tenant', 'owner', 'worker'])->default('all');
            $table->boolean('blockedForBrokers')->default(false);
            $table->boolean('isActive')->default(true);
            $table->timestamp('expiresAt');
            $table->timestamps();

            $table->index('code');
            $table->index('isActive');
            $table->index('expiresAt');
        });

        // Pivot table for coupon usage per user
        Schema::create('coupon_usage', function (Blueprint $table) {
            $table->uuid('couponId');
            $table->uuid('userId');
            $table->integer('count')->default(0);

            $table->primary(['couponId', 'userId']);
            $table->foreign('couponId')->references('id')->on('coupons')->onDelete('cascade');
            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('coupon_usage');
        Schema::dropIfExists('coupons');
    }
};
