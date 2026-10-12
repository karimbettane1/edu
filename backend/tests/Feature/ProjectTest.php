<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesAcademy;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use CreatesAcademy, RefreshDatabase;

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function makeProject(User $owner, array $attributes = []): Project
    {
        return Project::create([
            'user_id' => $owner->id,
            'title' => 'Projet Alpha',
            'description' => 'Description du projet de test, suffisamment longue.',
            'status' => 'published',
            'published_at' => now()->subDay(),
            ...$attributes,
        ]);
    }

    public function test_guest_cannot_delete_a_project(): void
    {
        $project = $this->makeProject($this->makeUser());

        $this->deleteJson("/api/projects/{$project->id}")->assertUnauthorized();
        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }

    public function test_owner_can_delete_own_project_and_action_is_audited(): void
    {
        $owner = $this->makeUser();
        $project = $this->makeProject($owner);

        Sanctum::actingAs($owner);

        $this->deleteJson("/api/projects/{$project->id}")->assertOk();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'project.deleted',
            'user_id' => $owner->id,
        ]);
    }

    public function test_student_cannot_delete_someone_elses_project(): void
    {
        $project = $this->makeProject($this->makeUser());

        Sanctum::actingAs($this->makeUser(attributes: ['email' => 'intrus@example.com']));

        $this->deleteJson("/api/projects/{$project->id}")->assertForbidden();
        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }

    public function test_can_manage_flag_follows_ownership_and_admin_role(): void
    {
        $owner = $this->makeUser();
        $project = $this->makeProject($owner);

        $find = function () use ($project): ?array {
            return collect($this->getJson('/api/projects?per_page=50')->assertOk()->json('data'))
                ->firstWhere('id', $project->id);
        };

        $this->assertFalse($find()['can_manage'], 'Un visiteur ne peut pas gérer le projet.');

        Sanctum::actingAs($this->makeUser(attributes: ['email' => 'autre@example.com']));
        $this->assertFalse($find()['can_manage'], 'Un autre étudiant ne peut pas gérer le projet.');

        Sanctum::actingAs($owner);
        $this->assertTrue($find()['can_manage'], 'Le propriétaire peut gérer son projet.');

        Sanctum::actingAs($this->makeUser(UserRole::Admin, ['email' => 'admin@example.com']));
        $this->assertTrue($find()['can_manage'], 'Un administrateur peut gérer le projet.');
    }

    public function test_store_assigns_authenticated_user_and_validates_input(): void
    {
        $student = $this->makeUser();
        Sanctum::actingAs($student);

        $this->postJson('/api/projects', ['title' => 'Titre seul'])->assertStatus(422)->assertJsonValidationErrors('description');

        $response = $this->postJson('/api/projects', [
            'title' => 'Projet publié par l\'étudiant',
            'description' => 'Description complète du projet étudiant pour la validation.',
            'technologies' => ['React', 'Laravel'],
        ])->assertCreated();

        $this->assertDatabaseHas('projects', [
            'id' => $response->json('data.id'),
            'user_id' => $student->id,
            'status' => 'published',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'project.created',
            'user_id' => $student->id,
        ]);
    }
}
