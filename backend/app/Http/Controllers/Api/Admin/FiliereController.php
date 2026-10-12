<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FiliereRequest;
use App\Http\Resources\FiliereResource;
use App\Models\AuditLog;
use App\Models\Filiere;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class FiliereController extends Controller
{
    public function index(): JsonResponse
    {
        $filieres = Filiere::query()
            ->with(['anneesFormation.modules'])
            ->withCount([
                'anneesFormation',
                'modules',
                'resources',
                'users',
            ])
            ->orderBy('position')
            ->get();

        return response()->json(['data' => FiliereResource::collection($filieres)]);
    }

    public function store(FiliereRequest $request): JsonResponse
    {
        $filiere = Filiere::create($request->validated());

        AuditLog::record('filiere.created', 'Création de la filière « '.$filiere->name.' »', $filiere);

        return response()->json([
            'message' => 'La filière a été créée.',
            'data' => new FiliereResource($filiere),
        ], 201);
    }

    public function update(Filiere $filiere, FiliereRequest $request): JsonResponse
    {
        $filiere->fill($request->validated())->save();

        AuditLog::record('filiere.updated', 'Mise à jour de la filière « '.$filiere->name.' »', $filiere);

        return response()->json([
            'message' => 'La filière a été mise à jour.',
            'data' => new FiliereResource($filiere->loadCount(['anneesFormation', 'modules', 'resources', 'users'])),
        ]);
    }

    public function destroy(Filiere $filiere): JsonResponse
    {
        if ($filiere->resources()->exists() || $filiere->modules()->exists()) {
            return response()->json([
                'message' => 'Cette filière contient des modules ou des ressources. Supprimez-les d\'abord ou archivez la filière.',
            ], 422);
        }

        $name = $filiere->name;
        $filiere->delete();

        AuditLog::record('filiere.deleted', 'Suppression de la filière « '.$name.' »');

        return response()->json(['message' => 'La filière a été supprimée.']);
    }
}
