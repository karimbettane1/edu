<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'passing_score' => (int) $this->passing_score,
            'is_published' => (bool) $this->is_published,
            'questions_count' => $this->whenCounted('questions'),
            'module' => ModuleResource::make($this->whenLoaded('module')),
            'filiere' => FiliereResource::make($this->whenLoaded('filiere')),
            'my_attempts_count' => $this->when(isset($this->my_attempts_count), fn () => (int) $this->my_attempts_count, 0),
            'my_best_score' => $this->when(isset($this->my_best_score), fn () => $this->my_best_score === null ? null : (int) $this->my_best_score, null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
