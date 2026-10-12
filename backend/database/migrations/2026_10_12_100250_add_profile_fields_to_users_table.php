<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('student')->after('password');
            $table->foreignId('filiere_id')->nullable()->after('role')->constrained('filieres')->nullOnDelete();
            $table->foreignId('annee_formation_id')->nullable()->after('filiere_id')->constrained('annees_formation')->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('annee_formation_id');
            $table->string('language', 5)->default('fr')->after('is_active');
            $table->timestamp('last_login_at')->nullable()->after('language');

            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('filiere_id');
            $table->dropConstrainedForeignId('annee_formation_id');
            $table->dropColumn(['role', 'is_active', 'language', 'last_login_at']);
        });
    }
};
