<?php

namespace App\Http\Resources;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizQuestionResource extends JsonResource
{
    public function __construct(Question $resource, private bool $withCorrections = false)
    {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'text' => $this->text,
            'position' => (int) $this->position,
            'explanation' => $this->when($this->withCorrections, fn () => $this->explanation),
            'answers' => $this->answers->map(fn ($answer) => [
                'id' => $answer->id,
                'text' => $answer->text,
                'position' => (int) $answer->position,
                'is_correct' => $this->when($this->withCorrections, fn () => (bool) $answer->is_correct),
            ])->values()->all(),
        ];
    }
}
