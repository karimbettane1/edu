<?php

namespace App\Http\Requests\Auth;

use App\Models\AnneeFormation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes', 'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->id),
            ],
            'filiere_id' => ['sometimes', 'nullable', 'integer', 'exists:filieres,id'],
            'annee_formation_id' => ['sometimes', 'nullable', 'integer', 'exists:annees_formation,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->filled('annee_formation_id') || ! $this->filled('filiere_id')) {
                return;
            }

            $belongsToFiliere = AnneeFormation::where('id', $this->integer('annee_formation_id'))
                ->where('filiere_id', $this->integer('filiere_id'))
                ->exists();

            if (! $belongsToFiliere) {
                $validator->errors()->add('annee_formation_id', 'L\'année sélectionnée n\'appartient pas à cette filière.');
            }
        });
    }
}
