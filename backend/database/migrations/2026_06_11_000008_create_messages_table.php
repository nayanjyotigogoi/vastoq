<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversationId');
            $table->uuid('senderId');
            $table->uuid('recipientId');
            $table->text('text'); // Named text to match the frontend typescript payload
            $table->boolean('isRead')->default(false);
            $table->timestamps();

            $table->foreign('conversationId')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('senderId')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('recipientId')->references('id')->on('users')->onDelete('cascade');

            $table->index('conversationId');
            $table->index('senderId');
            $table->index('isRead');
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
};
