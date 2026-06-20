<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user1Id');
            $table->uuid('user2Id');
            $table->enum('contextType', ['listing', 'worker', 'general'])->default('general');
            $table->uuid('contextId')->nullable();
            $table->timestamp('lastMessageAt')->nullable();
            $table->timestamps();

            $table->foreign('user1Id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user2Id')->references('id')->on('users')->onDelete('cascade');

            $table->index(['user1Id', 'user2Id']);
            $table->index('lastMessageAt');
        });
    }

    public function down()
    {
        Schema::dropIfExists('conversations');
    }
};
