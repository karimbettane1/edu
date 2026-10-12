<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->nullable()->constrained('modules')->nullOnDelete();
            $table->foreignId('filiere_id')->nullable()->constrained('filieres')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->unsignedTinyInteger('passing_score')->default(50);
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->index(['filiere_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
