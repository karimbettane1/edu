<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('resources')->cascadeOnDelete();
            $table->string('disk', 30)->default('local');
            $table->string('path', 255);
            $table->string('original_name');
            $table->string('extension', 12);
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->boolean('is_primary')->default(true);
            $table->timestamps();

            $table->index(['resource_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_files');
    }
};
