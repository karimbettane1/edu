<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnneeFormationResource;
use App\Http\Resources\FiliereResource;
use App\Http\Resources\ModuleResource;
use App\Http\Resources\NiveauResource;
use App\Models\AnneeFormation;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Niveau;
use App\Models\Resource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function filieres(): JsonResponse
    {
        $filieres = Filiere::query()
            ->where('is_active', true)
            ->withCount([
                'anneesFormation',
                'modules',
                'resources' => fn (Builder $query) => $query->published()->where('visibility', 'public'),
            ])
            ->orderBy('position')
            ->get();

        return response()->json(['data' => FiliereResource::collection($filieres)]);
    }

    public function filiere(Filiere $filiere): JsonResponse
    {
        $filiere->load(['anneesFormation.modules' => fn ($query) => $query->where('is_active', true)]);

        $filiere->loadCount([
            'anneesFormation',
            'modules',
            'resources' => fn (Builder $query) => $query->published()->where('visibility', 'public'),
        ]);

        return response()->json(['data' => new FiliereResource($filiere)]);
    }

    public function niveaux(): JsonResponse
    {
        $niveaux = Niveau::query()
            ->withCount('anneesFormation')
            ->orderBy('position')
            ->get();

        return response()->json(['data' => NiveauResource::collection($niveaux)]);
    }

    public function annees(Request $request): JsonResponse
    {
        $annees = AnneeFormation::query()
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->withCount([
                'modules',
                'resources' => fn (Builder $query) => $query->published()->where('visibility', 'public'),
            ])
            ->orderBy('position')
            ->get();

        return response()->json(['data' => AnneeFormationResource::collection($annees)]);
    }

    public function modules(Request $request): JsonResponse
    {
        $modules = Module::query()
            ->where('is_active', true)
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->when($request->integer('annee_id'), fn (Builder $query, int $anneeId) => $query->where('annee_formation_id', $anneeId))
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where(fn (Builder $sub) => $sub->where('name', 'like', $term)->orWhere('code', 'like', $term));
            })
            ->withCount(['resources' => fn (Builder $query) => $query->published()->where('visibility', 'public')])
            ->orderBy('position')
            ->get();

        return response()->json(['data' => ModuleResource::collection($modules)]);
    }

    public function resourceTypes(): JsonResponse
    {
        $types = collect(Resource::TYPE_LABELS)
            ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
            ->values();

        return response()->json(['data' => $types]);
    }
}
