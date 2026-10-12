<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('filiere_id')->constrained('filieres')->restrictOnDelete();
            $table->foreignId('annee_formation_id')->nullable()->constrained('annees_formation')->nullOnDelete();
            $table->string('code', 20)->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['filiere_id', 'annee_formation_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
