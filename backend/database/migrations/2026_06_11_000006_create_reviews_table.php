<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('authorId');
            $table->enum('targetType', ['listing', 'worker']);
            $table->uuid('targetId');
            $table->integer('rating'); // 1-5
            $table->text('comment')->nullable();
            $table->boolean('isApproved')->default(false);
            $table->timestamps();

            $table->foreign('authorId')->references('id')->on('users')->onDelete('cascade');

            $table->index(['targetType', 'targetId']);
            $table->index('isApproved');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
};
