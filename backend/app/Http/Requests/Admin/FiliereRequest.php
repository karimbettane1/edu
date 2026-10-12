<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FiliereRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('name') && ! $this->filled('slug')) {
            $this->merge(['slug' => Str::slug($this->input('name'))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $filiereId = $this->route('filiere')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('filieres', 'code')->ignore($filiereId)],
            'slug' => ['sometimes', 'nullable', 'string', 'max:120', Rule::unique('filieres', 'slug')->ignore($filiereId)],
            'description' => ['nullable', 'string', 'max:2000'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
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
            'name.required' => 'Le nom de la filière est obligatoire.',
            'code.required' => 'Le code de la filière est obligatoire.',
            'code.unique' => 'Ce code de filière est déjà utilisé.',
            'slug.unique' => 'Ce slug est déjà utilisé par une autre filière.',
            'color.regex' => 'La couleur doit être au format hexadécimal (ex. #2563EB).',
        ];
    }
}
