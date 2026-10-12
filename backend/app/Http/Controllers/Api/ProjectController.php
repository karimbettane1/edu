<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\AuditLog;
use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 9), 1), 48);

        $projects = Project::query()
            ->with(['user', 'filiere'])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where(fn (Builder $sub) => $sub->where('title', 'like', $term)->orWhere('description', 'like', $term));
            })
            ->orderByDesc('published_at')
            ->paginate($perPage)
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $project = Project::with(['user', 'filiere'])->findOrFail($id);

        $isVisible = $project->isPublished();
        $user = $request->user();

        if (! $isVisible && ! ($user && ($user->isAdmin() || $project->user_id === $user->id))) {
            abort(404);
        }

        return response()->json(['data' => new ProjectResource($project)]);
    }

    public function store(ProjectRequest $request): JsonResponse
    {
        $project = Project::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'filiere_id' => $request->input('filiere_id', $request->user()->filiere_id),
            'status' => 'published',
            'published_at' => now(),
        ]);

        $project->load(['user', 'filiere']);

        AuditLog::record('project.created', 'Création du projet « '.$project->title.' »', $project);

        return response()->json([
            'message' => 'Votre projet a été publié.',
            'data' => new ProjectResource($project),
        ], 201);
    }

    public function destroy(Project $project, Request $request): JsonResponse
    {
        $this->authorize('delete', $project);

        $title = $project->title;
        $project->delete();

        AuditLog::record('project.deleted', 'Suppression du projet « '.$title.' »');

        return response()->json(['message' => 'Le projet a été supprimé.']);
    }
}
