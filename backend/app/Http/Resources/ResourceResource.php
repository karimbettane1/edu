<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ResourceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $primaryFile = $this->relationLoaded('primaryFile') ? $this->primaryFile : null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'excerpt' => Str::limit((string) $this->description, 160),
            'description' => $this->description,
            'type' => $this->type,
            'type_label' => $this->typeLabel(),
            'status' => $this->status,
            'status_label' => $this->statusLabel(),
            'visibility' => $this->visibility,
            'keywords' => $this->keywords,
            'downloads_count' => (int) $this->downloads_count,
            'views_count' => (int) $this->views_count,
            'comments_count' => $this->whenCounted('comments'),
            'favorites_count' => $this->whenCounted('favorites'),
            'is_favorited' => (bool) ($this->is_favorited ?? false),
            'can_manage' => $this->when(
                auth()->check(),
                fn () => auth()->user()->isAdmin() || $this->author_id === auth()->id(),
                false,
            ),
            'filiere' => FiliereResource::make($this->whenLoaded('filiere')),
            'annee_formation' => AnneeFormationResource::make($this->whenLoaded('anneeFormation')),
            'module' => ModuleResource::make($this->whenLoaded('module')),
            'author' => UserResource::make($this->whenLoaded('author')),
            'primary_file' => ResourceFileResource::make($primaryFile),
            'files' => ResourceFileResource::collection($this->whenLoaded('files')),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
