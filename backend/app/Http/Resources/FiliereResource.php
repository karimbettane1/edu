<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FiliereResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'slug' => $this->slug,
            'description' => $this->description,
            'color' => $this->color,
            'icon' => $this->icon,
            'image' => $this->image,
            'is_active' => (bool) $this->is_active,
            'position' => (int) $this->position,
            'annees_count' => $this->whenCounted('anneesFormation'),
            'modules_count' => $this->whenCounted('modules'),
            'resources_count' => $this->whenCounted('resources'),
            'users_count' => $this->whenCounted('users'),
            'annees_formation' => AnneeFormationResource::collection($this->whenLoaded('anneesFormation')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
