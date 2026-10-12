<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'score' => (int) $this->score,
            'correct_count' => (int) $this->correct_count,
            'total_questions' => (int) $this->total_questions,
            'duration_seconds' => $this->duration_seconds,
            'details' => $this->details ?? [],
            'passed' => $this->hasPassed(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'quiz' => QuizResource::make($this->whenLoaded('quiz')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
