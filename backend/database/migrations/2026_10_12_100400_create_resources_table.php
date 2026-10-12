<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'cours',
                'tp',
                'exercice',
                'exercice_corrige',
                'examen',
                'examen_corrige',
                'resume',
                'projet',
                'tutoriel',
                'presentation',
                'fiche_revision',
            ]);
            $table->enum('status', ['draft', 'pending_review', 'published', 'rejected', 'archived'])
                ->default('draft');
            $table->enum('visibility', ['public', 'private'])->default('public');
            $table->foreignId('filiere_id')->constrained('filieres')->restrictOnDelete();
            $table->foreignId('annee_formation_id')->nullable()->constrained('annees_formation')->nullOnDelete();
            $table->foreignId('module_id')->nullable()->constrained('modules')->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('downloads_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->text('keywords')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['filiere_id', 'annee_formation_id', 'module_id'], 'resources_pedagogy_index');
            $table->index(['status', 'visibility']);
            $table->index('published_at');
            $table->index('type');
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
