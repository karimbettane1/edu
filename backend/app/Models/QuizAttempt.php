<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quiz_id',
    'user_id',
    'score',
    'correct_count',
    'total_questions',
    'duration_seconds',
    'details',
    'completed_at',
])]
class QuizAttempt extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'details' => 'array',
            'completed_at' => 'datetime',
            'score' => 'integer',
            'correct_count' => 'integer',
            'total_questions' => 'integer',
            'duration_seconds' => 'integer',
        ];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasPassed(): bool
    {
        return $this->score >= ($this->quiz?->passing_score ?? 50);
    }
}
