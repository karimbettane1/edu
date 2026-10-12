<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesAcademy;
use Tests\TestCase;

class ResourceVisibilityTest extends TestCase
{
    use CreatesAcademy, RefreshDatabase;

    public function test_public_catalog_only_exposes_published_public_resources(): void
    {
        $filiere = $this->makeFiliere();

        $this->makeResource($filiere, ['title' => 'Cours public Alpha']);
        $this->makeResource($filiere, ['title' => 'Brouillon Beta', 'status' => 'draft', 'published_at' => null]);
        $this->makeResource($filiere, ['title' => 'Privée Gamma', 'visibility' => 'private']);
        $this->makeResource($filiere, ['title' => 'Future Delta', 'published_at' => now()->addWeek()]);
        $this->makeResource($filiere, ['title' => 'En attente Epsilon', 'status' => 'pending_review']);

        $titles = collect($this->getJson('/api/resources?per_page=50')->assertOk()->json('data'))
            ->pluck('title');

        $this->assertTrue($titles->contains('Cours public Alpha'));
        $this->assertFalse($titles->contains('Brouillon Beta'));
        $this->assertFalse($titles->contains('Privée Gamma'));
        $this->assertFalse($titles->contains('Future Delta'));
        $this->assertFalse($titles->contains('En attente Epsilon'));
    }

    public function test_authenticated_student_sees_private_resources_too(): void
    {
        $filiere = $this->makeFiliere();
        $this->makeResource($filiere, ['title' => 'Privée Gamma', 'visibility' => 'private']);

        Sanctum::actingAs($this->makeUser());

        $titles = collect($this->getJson('/api/resources?per_page=50')->assertOk()->json('data'))
            ->pluck('title');

        $this->assertTrue($titles->contains('Privée Gamma'));
    }

    public function test_unpublished_resource_detail_is_not_found_for_guests(): void
    {
        $filiere = $this->makeFiliere();
        $draft = $this->makeResource($filiere, ['status' => 'draft', 'published_at' => null]);

        $this->getJson("/api/resources/{$draft->id}")->assertNotFound();
    }

    public function test_guests_cannot_download_private_resources(): void
    {
        $filiere = $this->makeFiliere();
        $private = $this->makeResource($filiere, ['visibility' => 'private']);

        $this->getJson("/api/resources/{$private->id}/download")->assertForbidden();
    }

    public function test_search_filters_by_title_description_or_keywords(): void
    {
        $filiere = $this->makeFiliere();

        $this->makeResource($filiere, [
            'title' => 'Conteneuriser avec Docker',
            'description' => 'Mise en pratique de la conteneurisation.',
        ]);
        $this->makeResource($filiere, [
            'title' => 'Bases de React',
            'description' => 'Composants et hooks.',
            'keywords' => 'web, javascript, frontend',
        ]);

        $searchByTitle = collect($this->getJson('/api/resources?search=Docker')->json('data'))->pluck('title');
        $this->assertCount(1, $searchByTitle);
        $this->assertSame('Conteneuriser avec Docker', $searchByTitle->first());

        $searchByKeyword = collect($this->getJson('/api/resources?search=javascript')->json('data'))->pluck('title');
        $this->assertCount(1, $searchByKeyword);
        $this->assertSame('Bases de React', $searchByKeyword->first());

        $this->assertCount(0, $this->getJson('/api/resources?search=introuvable-xyz')->json('data'));
    }
}
