<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuizAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:questions,id'],
            'answers.*.answer_id' => ['nullable', 'integer', 'exists:answers,id'],
            'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:21600'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'answers.required' => 'Aucune réponse n\'a été transmise.',
            'answers.*.question_id.exists' => 'Une des questions transmises est introuvable.',
            'answers.*.answer_id.exists' => 'Une des réponses transmises est introuvable.',
        ];
    }
}
