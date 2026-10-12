<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'filiere_id' => $this->filiere_id,
            'annee_formation_id' => $this->annee_formation_id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'is_active' => (bool) $this->is_active,
            'position' => (int) $this->position,
            'resources_count' => $this->whenCounted('resources'),
            'filiere' => FiliereResource::make($this->whenLoaded('filiere')),
            'annee_formation' => AnneeFormationResource::make($this->whenLoaded('anneeFormation')),
        ];
    }
}
