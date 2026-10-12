<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModuleRequest;
use App\Http\Resources\ModuleResource;
use App\Models\AuditLog;
use App\Models\Module;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $modules = Module::query()
            ->with(['filiere', 'anneeFormation'])
            ->withCount('resources')
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->when($request->integer('annee_id'), fn (Builder $query, int $anneeId) => $query->where('annee_formation_id', $anneeId))
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where(fn (Builder $sub) => $sub->where('name', 'like', $term)->orWhere('code', 'like', $term));
            })
            ->orderBy('filiere_id')
            ->orderBy('annee_formation_id')
            ->orderBy('position')
            ->get();

        return response()->json(['data' => ModuleResource::collection($modules)]);
    }

    public function store(ModuleRequest $request): JsonResponse
    {
        $module = Module::create($request->validated());

        AuditLog::record('module.created', 'Création du module « '.$module->name.' »', $module);

        return response()->json([
            'message' => 'Le module a été créé.',
            'data' => new ModuleResource($module->load(['filiere', 'anneeFormation'])),
        ], 201);
    }

    public function update(Module $module, ModuleRequest $request): JsonResponse
    {
        $module->fill($request->validated())->save();

        AuditLog::record('module.updated', 'Mise à jour du module « '.$module->name.' »', $module);

        return response()->json([
            'message' => 'Le module a été mis à jour.',
            'data' => new ModuleResource($module->load(['filiere', 'anneeFormation'])->loadCount('resources')),
        ]);
    }

    public function destroy(Module $module): JsonResponse
    {
        if ($module->resources()->exists() || $module->quizzes()->exists()) {
            return response()->json([
                'message' => 'Ce module contient des ressources ou des quiz. Réaffectez-les avant de le supprimer.',
            ], 422);
        }

        $name = $module->name;
        $module->delete();

        AuditLog::record('module.deleted', 'Suppression du module « '.$name.' »');

        return response()->json(['message' => 'Le module a été supprimé.']);
    }
}
