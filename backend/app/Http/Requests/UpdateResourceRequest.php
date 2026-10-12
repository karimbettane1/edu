<?php

namespace App\Http\Requests;

use App\Models\Resource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isContributor() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:5000'],
            'type' => ['sometimes', 'required', 'string', Rule::in(Resource::TYPES)],
            'filiere_id' => ['sometimes', 'required', 'integer', 'exists:filieres,id'],
            'annee_formation_id' => ['nullable', 'integer', 'exists:annees_formation,id'],
            'module_id' => ['nullable', 'integer', 'exists:modules,id'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'visibility' => ['nullable', Rule::in(['public', 'private'])],
            'status' => ['nullable', Rule::in(['draft', 'pending_review', 'published', 'rejected', 'archived'])],
            'file' => [
                'nullable',
                'file',
                'max:20480',
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,odt,ods,odp,txt,md,zip',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Le titre de la ressource est obligatoire.',
            'type.in' => 'Le type de ressource sélectionné n\'est pas valide.',
            'filiere_id.exists' => 'La filière sélectionnée n\'existe pas.',
            'module_id.exists' => 'Le module sélectionné n\'existe pas.',
            'file.max' => 'Le fichier ne doit pas dépasser 20 Mo.',
            'file.mimes' => 'Ce format de fichier n\'est pas autorisé (PDF, Word, PowerPoint, Excel, texte ou ZIP).',
        ];
    }
}
