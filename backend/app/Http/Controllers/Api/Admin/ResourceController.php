<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResourceRequest;
use App\Http\Requests\UpdateResourceRequest;
use App\Http\Resources\ResourceResource;
use App\Models\AuditLog;
use App\Models\Resource;
use App\Models\User;
use App\Services\ResourceFileService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    public function __construct(private readonly ResourceFileService $fileService)
    {
    }

    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 48);

        $resources = Resource::query()
            ->with(['filiere', 'anneeFormation', 'module', 'author', 'primaryFile'])
            ->withCount(['comments', 'favorites'])
            ->when($request->string('status')->toString(), fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->when($request->integer('module_id'), fn (Builder $query, int $moduleId) => $query->where('module_id', $moduleId))
            ->when($request->string('type')->toString(), fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where(function (Builder $sub) use ($term) {
                    $sub->where('title', 'like', $term)
                        ->orWhere('description', 'like', $term)
                        ->orWhere('keywords', 'like', $term)
                        ->orWhereHas('author', fn (Builder $author) => $author->where('name', 'like', $term));
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return ResourceResource::collection($resources);
    }

    public function show(Resource $resource): JsonResponse
    {
        return response()->json([
            'data' => new ResourceResource(
                $resource->load(['filiere', 'anneeFormation', 'module', 'author', 'primaryFile']),
            ),
        ]);
    }

    public function store(StoreResourceRequest $request): JsonResponse
    {
        $admin = $request->user();
        $status = $request->input('status', 'published');

        $resource = Resource::create([
            'title' => $request->string('title')->toString(),
            'description' => $request->input('description'),
            'type' => $request->string('type')->toString(),
            'status' => $status,
            'visibility' => $request->input('visibility', 'public'),
            'filiere_id' => $request->integer('filiere_id'),
            'annee_formation_id' => $request->integer('annee_formation_id') ?: null,
            'module_id' => $request->integer('module_id') ?: null,
            'author_id' => $admin->id,
            'keywords' => $request->input('keywords'),
            'published_at' => $status === 'published' ? now() : null,
        ]);

        $this->fileService->store($request->file('file'), $resource);

        AuditLog::record('resource.created', 'Création de la ressource « '.$resource->title.' »', $resource);

        return response()->json([
            'message' => 'La ressource a été créée.',
            'data' => new ResourceResource($resource->load(['filiere', 'anneeFormation', 'module', 'author', 'primaryFile'])),
        ], 201);
    }

    public function update(Resource $resource, UpdateResourceRequest $request): JsonResponse
    {
        $before = $resource->status;

        $resource->fill($request->safe()->except(['file']));

        if ($resource->status === 'published' && ! $resource->published_at) {
            $resource->published_at = now();
        }

        if ($resource->isDirty('status') && $resource->status !== 'published') {
            $resource->published_at = null;
        }

        $resource->save();

        if ($request->hasFile('file')) {
            $this->fileService->replace($request->file('file'), $resource);
        }

        AuditLog::record('resource.updated', 'Mise à jour de la ressource « '.$resource->title.' »', $resource, [
            'status_before' => $before,
            'status_after' => $resource->status,
        ]);

        if ($resource->status === 'published' && $before === 'pending_review' && $resource->author_id) {
            $resource->author?->appNotifications()->create([
                'type' => 'resource_approved',
                'title' => 'Ressource validée',
                'message' => 'Votre ressource « '.$resource->title.' » a été validée et publiée.',
                'url' => '/contributeur/ressources',
            ]);
        }

        if ($resource->status === 'rejected' && $before !== 'rejected' && $resource->author_id) {
            $resource->author?->appNotifications()->create([
                'type' => 'resource_rejected',
                'title' => 'Ressource refusée',
                'message' => 'Votre ressource « '.$resource->title.' » a été refusée. Consultez l\'administration pour plus de détails.',
                'url' => '/contributeur/ressources',
            ]);
        }

        return response()->json([
            'message' => 'La ressource a été mise à jour.',
            'data' => new ResourceResource($resource->fresh()->load(['filiere', 'anneeFormation', 'module', 'author', 'primaryFile'])),
        ]);
    }

    public function destroy(Resource $resource): JsonResponse
    {
        $this->fileService->deleteAll($resource);
        $title = $resource->title;
        $resource->delete();

        AuditLog::record('resource.deleted', 'Suppression de la ressource « '.$title.' »');

        return response()->json(['message' => 'La ressource a été supprimée.']);
    }
}
