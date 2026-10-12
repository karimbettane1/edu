<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesAcademy;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use CreatesAcademy, RefreshDatabase;

    public function test_register_creates_student_account_with_hashed_password(): void
    {
        $filiere = $this->makeFiliere();
        $annee = $this->makeAnnee($filiere);

        $response = $this->postJson('/api/register', [
            'name' => 'Nouvelle Étudiante',
            'email' => 'nouvelle@example.com',
            'password' => 'motdepasse123',
            'password_confirmation' => 'motdepasse123',
            'filiere_id' => $filiere->id,
            'annee_formation_id' => $annee->id,
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $user = User::where('email', 'nouvelle@example.com')->firstOrFail();

        $this->assertSame('student', $user->role->value);
        $this->assertNotSame('motdepasse123', $user->password);
        $this->assertTrue(Hash::check('motdepasse123', $user->password));
    }

    public function test_register_rejects_annee_from_another_filiere(): void
    {
        $filiere = $this->makeFiliere();
        $otherFiliere = $this->makeFiliere([
            'name' => 'Infrastructure Digitale',
            'code' => 'ID',
            'slug' => 'infrastructure-digitale',
        ]);
        $otherAnnee = $this->makeAnnee($otherFiliere, ['label' => '1ère année', 'code' => '1A']);

        $this->postJson('/api/register', [
            'name' => 'Étudiante Perdue',
            'email' => 'perdue@example.com',
            'password' => 'motdepasse123',
            'password_confirmation' => 'motdepasse123',
            'filiere_id' => $filiere->id,
            'annee_formation_id' => $otherAnnee->id,
        ])->assertStatus(422)->assertJsonValidationErrors('annee_formation_id');
    }

    public function test_register_validates_password_strength_and_email_uniqueness(): void
    {
        $filiere = $this->makeFiliere();
        $annee = $this->makeAnnee($filiere);
        $existing = $this->makeUser();

        $this->postJson('/api/register', [
            'name' => 'Compte Faible',
            'email' => 'faible@example.com',
            'password' => 'court',
            'password_confirmation' => 'court',
            'filiere_id' => $filiere->id,
            'annee_formation_id' => $annee->id,
        ])->assertStatus(422)->assertJsonValidationErrors('password');

        $this->postJson('/api/register', [
            'name' => 'Doublon',
            'email' => $existing->email,
            'password' => 'motdepasse123',
            'password_confirmation' => 'motdepasse123',
            'filiere_id' => $filiere->id,
            'annee_formation_id' => $annee->id,
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_succeeds_with_valid_credentials_and_rejects_bad_ones(): void
    {
        $user = $this->makeUser();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'mauvais-mot-de-passe',
        ])->assertStatus(422);
    }

    public function test_login_blocks_inactive_accounts(): void
    {
        $user = $this->makeUser(attributes: ['is_active' => false]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertForbidden();
    }

    public function test_login_is_rate_limited_after_five_failed_attempts(): void
    {
        $user = $this->makeUser();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/login', [
                'email' => $user->email,
                'password' => 'mauvais-mot-de-passe',
            ])->assertStatus(422);
        }

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'mauvais-mot-de-passe',
        ])->assertStatus(429);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();

        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);
    }
}
