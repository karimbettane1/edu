<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('resource_id')->constrained('resources')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_approved')->default(false);
            $table->timestamps();

            $table->index(['resource_id', 'is_approved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
