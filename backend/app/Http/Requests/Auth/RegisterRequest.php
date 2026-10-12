<?php

namespace App\Http\Requests\Auth;

use App\Models\AnneeFormation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', Password::min(8)],
            'filiere_id' => ['required', 'integer', Rule::exists('filieres', 'id')->where('is_active', true)],
            'annee_formation_id' => ['required', 'integer', 'exists:annees_formation,id'],
            'language' => ['nullable', Rule::in(['fr', 'ar', 'en'])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->filled('filiere_id') || ! $this->filled('annee_formation_id')) {
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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom complet est obligatoire.',
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
            'email.unique' => 'Un compte existe déjà avec cette adresse e-mail.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'filiere_id.required' => 'Veuillez sélectionner une filière.',
            'filiere_id.exists' => 'La filière sélectionnée n\'existe pas.',
            'annee_formation_id.required' => 'Veuillez sélectionner une année de formation.',
            'annee_formation_id.exists' => 'L\'année de formation sélectionnée n\'existe pas.',
        ];
    }
}
