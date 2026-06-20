<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId')->unique();
            $table->string('name', 255);
            $table->string('category', 100); // enum/string (flexible lookup)
            $table->integer('experience')->default(0);
            $table->json('skills')->nullable();
            $table->integer('ratePerDay')->nullable(); // in paise
            $table->string('locality', 100);
            $table->string('city', 100);
            $table->string('phone', 15);
            $table->string('email', 255)->nullable();
            $table->string('profilePhotoUrl', 500)->nullable();
            $table->text('about')->nullable();
            $table->boolean('isVerified')->default(false);
            $table->boolean('isActive')->default(true);
            $table->decimal('rating', 2, 1)->default(0.0);
            $table->integer('reviewCount')->default(0);
            $table->integer('unlockCount')->default(0);
            $table->timestamps();

            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');

            $table->index('userId');
            $table->index('category');
            $table->index(['city', 'locality']);
            $table->index('isVerified');
        });
    }

    public function down()
    {
        Schema::dropIfExists('workers');
    }
};
