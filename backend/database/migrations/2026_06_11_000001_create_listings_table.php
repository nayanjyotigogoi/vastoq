<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ownerId');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('bhkType', ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', 'villa', 'pg']);
            $table->enum('furnishing', ['unfurnished', 'semi-furnished', 'fully-furnished']);
            $table->enum('propertyType', ['apartment', 'house', 'pg', 'room']);
            $table->string('locality', 100);
            $table->string('city', 100);
            $table->text('address');
            $table->integer('rentPerMonth'); // in paise
            $table->integer('deposit'); // in paise
            $table->json('amenities')->nullable();
            $table->json('photos');
            $table->string('ownerPhone', 15);
            $table->string('ownerEmail', 255)->nullable();
            $table->enum('status', ['draft', 'pending', 'active', 'rejected', 'expired'])->default('pending');
            $table->boolean('isBroker')->default(false);
            $table->boolean('isFeatured')->default(false);
            $table->integer('viewCount')->default(0);
            $table->integer('unlockCount')->default(0);
            $table->timestamp('adminReviewedAt')->nullable();
            $table->uuid('adminReviewedBy')->nullable();
            $table->timestamps();

            $table->foreign('ownerId')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('adminReviewedBy')->references('id')->on('users')->onDelete('set null');

            $table->index('ownerId');
            $table->index(['city', 'locality']);
            $table->index('status');
            $table->index('isBroker');
        });
    }

    public function down()
    {
        Schema::dropIfExists('listings');
    }
};
