<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesAcademy;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use CreatesAcademy, RefreshDatabase;

    public function test_guest_cannot_access_protected_endpoints(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
        $this->getJson('/api/contributor/stats')->assertUnauthorized();
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
        $this->postJson('/api/projects', [])->assertUnauthorized();
    }

    public function test_student_cannot_access_contributor_or_admin_areas(): void
    {
        Sanctum::actingAs($this->makeUser(UserRole::Student));

        $this->getJson('/api/contributor/stats')->assertForbidden();
        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_contributor_can_access_own_space_but_not_admin_area(): void
    {
        Sanctum::actingAs($this->makeUser(UserRole::Contributor));

        $this->getJson('/api/contributor/stats')->assertOk();
        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_admin_can_access_admin_area(): void
    {
        Sanctum::actingAs($this->makeUser(UserRole::Admin));

        $this->getJson('/api/admin/dashboard')->assertOk();
    }

    public function test_contributor_cannot_delete_someone_elses_resource(): void
    {
        $filiere = $this->makeFiliere();
        $author = $this->makeUser(UserRole::Contributor);
        $intruder = $this->makeUser(UserRole::Contributor, ['email' => 'intrus@example.com']);
        $resource = $this->makeResource($filiere, ['author_id' => $author->id]);

        Sanctum::actingAs($intruder);

        $this->deleteJson("/api/contributor/resources/{$resource->id}")->assertForbidden();
        $this->assertDatabaseHas('resources', ['id' => $resource->id]);
    }

    public function test_student_cannot_submit_resources_to_contributor_space(): void
    {
        $filiere = $this->makeFiliere();
        Sanctum::actingAs($this->makeUser(UserRole::Student));

        $this->postJson('/api/contributor/resources', [
            'title' => 'Tentative interdite',
            'description' => 'Un étudiant ne doit pas pouvoir publier directement.',
            'type' => 'cours',
            'filiere_id' => $filiere->id,
        ])->assertForbidden();
    }
}
