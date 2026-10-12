<?php

namespace Tests\Concerns;

use App\Enums\UserRole;
use App\Models\AnneeFormation;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Niveau;
use App\Models\Resource;
use App\Models\User;

trait CreatesAcademy
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    protected function makeFiliere(array $attributes = []): Filiere
    {
        return Filiere::create([
            'name' => 'Développement Digital',
            'code' => 'DD',
            'slug' => 'developpement-digital',
            'is_active' => true,
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    protected function makeAnnee(Filiere $filiere, array $attributes = []): AnneeFormation
    {
        $niveau = Niveau::firstOrCreate(
            ['code' => 'technicien-specialise'],
            ['name' => 'Technicien Spécialisé'],
        );

        return AnneeFormation::create([
            'filiere_id' => $filiere->id,
            'niveau_id' => $niveau->id,
            'label' => '2ème année',
            'code' => '2A',
            'is_active' => true,
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    protected function makeModule(Filiere $filiere, ?AnneeFormation $annee = null, array $attributes = []): Module
    {
        return Module::create([
            'filiere_id' => $filiere->id,
            'annee_formation_id' => $annee?->id,
            'code' => 'M201',
            'name' => 'Développer une application web',
            'is_active' => true,
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    protected function makeResource(Filiere $filiere, array $attributes = []): Resource
    {
        return Resource::create([
            'title' => 'Ressource de test',
            'description' => 'Description de la ressource de test.',
            'type' => 'cours',
            'status' => 'published',
            'visibility' => 'public',
            'filiere_id' => $filiere->id,
            'published_at' => now()->subDay(),
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    protected function makeUser(UserRole $role = UserRole::Student, array $attributes = []): User
    {
        return User::factory()->create([
            'role' => $role,
            'is_active' => true,
            ...$attributes,
        ]);
    }
}
