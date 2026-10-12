<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resource_id')->nullable()->constrained('resources')->nullOnDelete();
            $table->string('resource_title')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['resource_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('downloads');
    }
};
