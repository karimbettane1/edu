<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnneeRequest extends FormRequest
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
        $anneeId = $this->route('annee')?->id;

        return [
            'filiere_id' => ['sometimes', 'required', 'integer', 'exists:filieres,id'],
            'niveau_id' => ['nullable', 'integer', 'exists:niveaux,id'],
            'label' => ['sometimes', 'required', 'string', 'max:60'],
            'code' => [
                'nullable', 'string', 'max:20',
                Rule::unique('annees_formation', 'code')
                    ->ignore($anneeId)
                    ->where(fn ($query) => $query->where('filiere_id', $this->input('filiere_id', $this->route('annee')?->filiere_id))),
            ],
            'option_name' => ['nullable', 'string', 'max:80'],
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
            'label.required' => 'Le libellé de l\'année est obligatoire.',
            'code.unique' => 'Ce code d\'année est déjà utilisé dans cette filière.',
        ];
    }
}
