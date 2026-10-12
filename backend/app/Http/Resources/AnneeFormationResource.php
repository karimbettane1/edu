<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnneeFormationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'filiere_id' => $this->filiere_id,
            'niveau_id' => $this->niveau_id,
            'label' => $this->label,
            'code' => $this->code,
            'option_name' => $this->option_name,
            'display_name' => $this->displayName(),
            'is_active' => (bool) $this->is_active,
            'position' => (int) $this->position,
            'modules_count' => $this->whenCounted('modules'),
            'resources_count' => $this->whenCounted('resources'),
            'modules' => ModuleResource::collection($this->whenLoaded('modules')),
            'niveau' => NiveauResource::make($this->whenLoaded('niveau')),
        ];
    }
}
