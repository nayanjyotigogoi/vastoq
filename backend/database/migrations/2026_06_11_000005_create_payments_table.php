<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId');
            $table->string('razorpayOrderId', 100)->unique();
            $table->string('razorpayPaymentId', 100)->nullable();
            $table->string('razorpaySignature', 255)->nullable();
            $table->integer('amount'); // in paise
            $table->integer('creditsGranted');
            $table->enum('status', ['created', 'paid', 'failed', 'refunded'])->default('created');
            $table->string('couponCode', 20)->nullable();
            $table->integer('couponDiscount')->default(0); // in paise
            $table->text('failureReason')->nullable();
            $table->timestamps();

            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');

            $table->index('userId');
            $table->index('razorpayOrderId');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
