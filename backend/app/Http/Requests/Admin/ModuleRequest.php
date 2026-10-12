<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'filiere_id' => ['sometimes', 'required', 'integer', 'exists:filieres,id'],
            'annee_formation_id' => ['nullable', 'integer', 'exists:annees_formation,id'],
            'code' => ['nullable', 'string', 'max:20'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
            'position' => ['sometimes', 'integer', 'min:0', 'max:999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'filiere_id.required' => 'La filière est obligatoire.',
            'name.required' => 'Le nom du module est obligatoire.',
        ];
    }
}
