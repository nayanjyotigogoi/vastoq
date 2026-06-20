<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('unlocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('userId');
            $table->enum('targetType', ['listing', 'worker']);
            $table->uuid('targetId');
            $table->integer('amount'); // paise spent (creditsSpent = amount / 2000)
            $table->string('revealedPhone', 15);
            $table->text('revealedAddress')->nullable();
            $table->timestamp('expiresAt');
            $table->enum('status', ['active', 'expired', 'revoked'])->default('active');
            $table->timestamps();

            $table->foreign('userId')->references('id')->on('users')->onDelete('cascade');

            $table->index(['userId', 'targetType', 'targetId']);
            $table->index('status');
            $table->index('expiresAt');
        });
    }

    public function down()
    {
        Schema::dropIfExists('unlocks');
    }
};
