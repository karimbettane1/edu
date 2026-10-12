<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user() ?? $request->user('sanctum');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'technologies' => $this->technologies ?? [],
            'screenshots' => $this->screenshots ?? [],
            'demo_url' => $this->demo_url,
            'repo_url' => $this->repo_url,
            'status' => $this->status,
            'is_published' => $this->isPublished(),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'filiere' => FiliereResource::make($this->whenLoaded('filiere')),
            'can_manage' => $user !== null && ($user->isAdmin() || $this->user_id === $user->id),
        ];
    }
}
