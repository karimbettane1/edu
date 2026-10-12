<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'min:20', 'max:4000'],
            'filiere_id' => ['nullable', 'integer', 'exists:filieres,id'],
            'technologies' => ['nullable', 'array', 'max:12'],
            'technologies.*' => ['string', 'max:60'],
            'screenshots' => ['nullable', 'array', 'max:5'],
            'screenshots.*' => ['string', 'max:255'],
            'demo_url' => ['nullable', 'string', 'url', 'max:255'],
            'repo_url' => ['nullable', 'string', 'url', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Le titre du projet est obligatoire.',
            'description.required' => 'La description du projet est obligatoire.',
            'description.min' => 'La description doit contenir au moins 20 caractères.',
            'demo_url.url' => 'L\'adresse de démonstration n\'est pas valide.',
            'repo_url.url' => 'L\'adresse du dépôt n\'est pas valide.',
        ];
    }
}
