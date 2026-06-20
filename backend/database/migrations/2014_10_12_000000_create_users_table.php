<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('phone', 15)->unique();
            $table->string('name', 255);
            $table->string('email', 255)->unique()->nullable();
            $table->enum('role', ['tenant', 'owner', 'worker', 'admin']);
            $table->string('aadhaarNumber', 12)->unique()->nullable();
            $table->enum('aadhaarStatus', ['unverified', 'pending', 'verified', 'rejected'])->default('unverified');
            $table->timestamp('aadhaarVerifiedAt')->nullable();
            $table->string('profilePhotoUrl', 500)->nullable();
            $table->integer('creditBalance')->default(0); // credits * 100 (in paise)
            $table->boolean('isBlocked')->default(false);
            $table->boolean('isVerified')->default(false);
            $table->timestamps();

            $table->index('phone');
            $table->index('role');
            $table->index('aadhaarStatus');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
