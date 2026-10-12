<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AnneeFormation;
use App\Models\Filiere;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $dd = Filiere::where('code', 'DD')->first();
        $id = Filiere::where('code', 'ID')->first();

        $ddYear1 = AnneeFormation::where('filiere_id', $dd?->id)->where('code', '1A')->first();
        $idYear1 = AnneeFormation::where('filiere_id', $id?->id)->where('code', '1A')->first();
        $ddYear2 = AnneeFormation::where('filiere_id', $dd?->id)->where('code', '2A-WFS')->first();
        $idYear2 = AnneeFormation::where('filiere_id', $id?->id)->where('code', '2A-CYBER')->first();

        $admin = User::firstOrCreate(
            ['email' => 'admin@digital-academy.ma'],
            [
                'name' => 'Administrateur Digital Academy',
                'password' => 'password',
                'role' => UserRole::Admin,
                'is_active' => true,
                'email_verified_at' => now(),
                'last_login_at' => now()->subHours(2),
            ],
        );

        $contributor = User::firstOrCreate(
            ['email' => 'contributeur@digital-academy.ma'],
            [
                'name' => 'Youssef El Amrani',
                'password' => 'password',
                'role' => UserRole::Contributor,
                'filiere_id' => $dd?->id,
                'annee_formation_id' => $ddYear2?->id,
                'is_active' => true,
                'email_verified_at' => now(),
                'last_login_at' => now()->subDay(),
            ],
        );

        User::firstOrCreate(
            ['email' => 'etudiant@digital-academy.ma'],
            [
                'name' => 'Salma Bennani',
                'password' => 'password',
                'role' => UserRole::Student,
                'filiere_id' => $dd?->id,
                'annee_formation_id' => $ddYear1?->id,
                'is_active' => true,
                'email_verified_at' => now(),
                'last_login_at' => now()->subHours(5),
            ],
        );

        $studentNames = [
            'Omar Tazi', 'Imane Chraibi', 'Mehdi Alaoui', 'Khadija Naciri',
            'Anas Berrada', 'Aya Lahlou', 'Hamza Sekkat', 'Sara Idrissi',
            'Reda Benjelloun', 'Nada El Fassi', 'Yassine Amrani', 'Loubna Chafik',
            'Adam Rafik', 'Hiba Mansouri', 'Zakaria Slimani', 'Rim Bouzidi',
            'Ilyas Kabbaj', 'Salma Regragui', 'Othmane Drissi', 'Wiam Hajji',
        ];

        foreach ($studentNames as $index => $name) {
            $isId = $index % 3 === 0;
            $isSecondYear = $index % 4 === 0;
            $email = 'etudiant'.($index + 1).'@digital-academy.ma';

            if (User::where('email', $email)->exists()) {
                continue;
            }

            User::factory()->create([
                'name' => $name,
                'email' => $email,
                'password' => 'password',
                'role' => UserRole::Student,
                'filiere_id' => $isId ? $id?->id : $dd?->id,
                'annee_formation_id' => $isId
                    ? ($isSecondYear ? $idYear2?->id : $idYear1?->id)
                    : ($isSecondYear ? $ddYear2?->id : $ddYear1?->id),
                'is_active' => $index !== 3,
                'language' => 'fr',
                'email_verified_at' => now(),
                'last_login_at' => now()->subDays($index % 12),
                'created_at' => now()->subDays(45 - $index * 2),
                'updated_at' => now()->subDays(45 - $index * 2),
            ]);
        }
    }
}
