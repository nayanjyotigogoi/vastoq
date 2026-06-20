<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('furniture', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->enum('category', ['sofa', 'bed', 'dining', 'study', 'wardrobe', 'appliance', 'combo-pack']);
            $table->text('description')->nullable();
            $table->integer('rentPerMonth'); // in paise
            $table->integer('depositAmount'); // in paise
            $table->string('imageUrl', 500)->nullable();
            $table->boolean('isAvailable')->default(true);
            $table->integer('minRentalMonths')->default(1);
            $table->json('tags')->nullable();
            $table->timestamps();

            $table->index('category');
            $table->index('isAvailable');
        });
    }

    public function down()
    {
        Schema::dropIfExists('furniture');
    }
};
