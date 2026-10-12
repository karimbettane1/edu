<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AnneeRequest;
use App\Http\Resources\AnneeFormationResource;
use App\Models\AnneeFormation;
use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnneeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $annees = AnneeFormation::query()
            ->with(['filiere', 'niveau'])
            ->withCount(['modules', 'resources'])
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->orderBy('filiere_id')
            ->orderBy('position')
            ->get();

        return response()->json(['data' => AnneeFormationResource::collection($annees)]);
    }

    public function store(AnneeRequest $request): JsonResponse
    {
        $annee = AnneeFormation::create($request->validated());

        AuditLog::record('annee.created', 'Création de l\'année « '.$annee->label.' »', $annee);

        return response()->json([
            'message' => 'L\'année de formation a été créée.',
            'data' => new AnneeFormationResource($annee->load('filiere')),
        ], 201);
    }

    public function update(AnneeFormation $annee, AnneeRequest $request): JsonResponse
    {
        $annee->fill($request->validated())->save();

        AuditLog::record('annee.updated', 'Mise à jour de l\'année « '.$annee->label.' »', $annee);

        return response()->json([
            'message' => 'L\'année de formation a été mise à jour.',
            'data' => new AnneeFormationResource($annee->loadCount(['modules', 'resources'])),
        ]);
    }

    public function destroy(AnneeFormation $annee): JsonResponse
    {
        if ($annee->modules()->exists() || $annee->resources()->exists()) {
            return response()->json([
                'message' => 'Cette année contient des modules ou des ressources. Réaffectez-les avant de la supprimer.',
            ], 422);
        }

        $label = $annee->label;
        $annee->delete();

        AuditLog::record('annee.deleted', 'Suppression de l\'année « '.$label.' »');

        return response()->json(['message' => 'L\'année de formation a été supprimée.']);
    }
}
