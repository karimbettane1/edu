<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'role_label' => $this->role->label(),
            'filiere_id' => $this->filiere_id,
            'annee_formation_id' => $this->annee_formation_id,
            'filiere' => FiliereResource::make($this->whenLoaded('filiere')),
            'annee_formation' => AnneeFormationResource::make($this->whenLoaded('anneeFormation')),
            'language' => $this->language ?? 'fr',
            'is_active' => (bool) $this->is_active,
            'email_verified' => $this->email_verified_at !== null,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'resources_count' => $this->whenCounted('resources'),
        ];
    }
}
