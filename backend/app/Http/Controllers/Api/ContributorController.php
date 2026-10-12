<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResourceRequest;
use App\Http\Requests\UpdateResourceRequest;
use App\Http\Resources\ResourceResource;
use App\Models\AuditLog;
use App\Models\Resource;
use App\Models\Setting;
use App\Models\User;
use App\Services\ResourceFileService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContributorController extends Controller
{
    public function __construct(private readonly ResourceFileService $fileService)
    {
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $base = Resource::query()->where('author_id', $user->id);

        $statusCounts = (clone $base)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $typeCounts = (clone $base)
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $downloads = (int) (clone $base)->sum('downloads_count');
        $views = (int) (clone $base)->sum('views_count');
        $total = (clone $base)->count();

        $latest = (clone $base)
            ->with(['filiere', 'module', 'primaryFile'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'total' => $total,
                'published' => (int) ($statusCounts['published'] ?? 0),
                'pending' => (int) ($statusCounts['pending_review'] ?? 0),
                'drafts' => (int) ($statusCounts['draft'] ?? 0),
                'rejected' => (int) ($statusCounts['rejected'] ?? 0),
                'archived' => (int) ($statusCounts['archived'] ?? 0),
                'downloads' => $downloads,
                'views' => $views,
                'average_downloads' => $total > 0 ? (int) round($downloads / $total) : 0,
                'by_type' => $typeCounts,
                'latest' => ResourceResource::collection($latest),
            ],
        ]);
    }

    public function resources(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 12), 1), 48);

        $resources = Resource::query()
            ->where('author_id', $request->user()->id)
            ->with(['filiere', 'anneeFormation', 'module', 'primaryFile'])
            ->withCount(['comments', 'favorites'])
            ->when($request->string('status')->toString(), fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where('title', 'like', $term);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return ResourceResource::collection($resources);
    }

    public function show(Resource $resource): JsonResponse
    {
        $this->authorize('update', $resource);

        return response()->json([
            'data' => new ResourceResource(
                $resource->load(['filiere', 'anneeFormation', 'module', 'primaryFile']),
            ),
        ]);
    }

    public function store(StoreResourceRequest $request): JsonResponse
    {
        $user = $request->user();
        $status = $this->resolveStatus($user, $request->input('status'));

        $resource = Resource::create([
            'title' => $request->string('title')->toString(),
            'description' => $request->input('description'),
            'type' => $request->string('type')->toString(),
            'status' => $status,
            'visibility' => $request->input('visibility', 'public'),
            'filiere_id' => $request->integer('filiere_id'),
            'annee_formation_id' => $request->integer('annee_formation_id') ?: null,
            'module_id' => $request->integer('module_id') ?: null,
            'author_id' => $user->id,
            'keywords' => $request->input('keywords'),
            'published_at' => $status === 'published' ? now() : null,
        ]);

        $this->fileService->store($request->file('file'), $resource);

        AuditLog::record('resource.created', 'Création de la ressource « '.$resource->title.' »', $resource);

        if ($status === 'pending_review') {
            $this->notifyAdmins(
                'resource_pending',
                'Nouvelle ressource à valider',
                $user->name.' a soumis « '.$resource->title.' » pour validation.',
                '/admin/ressources',
            );
        }

        return response()->json([
            'message' => match ($status) {
                'published' => 'La ressource a été publiée.',
                'pending_review' => 'La ressource a été soumise pour validation.',
                default => 'La ressource a été enregistrée en brouillon.',
            },
            'data' => new ResourceResource($resource->load(['filiere', 'anneeFormation', 'module', 'primaryFile'])),
        ], 201);
    }

    public function update(Resource $resource, UpdateResourceRequest $request): JsonResponse
    {
        $this->authorize('update', $resource);
        $user = $request->user();

        $payload = $request->safe()->except(['file', 'status']);
        $payload = array_filter($payload, fn ($value) => $value !== null);

        $resource->fill($payload);

        if ($request->has('status')) {
            $status = $this->resolveStatus($user, $request->input('status'), $resource);
            $resource->status = $status;

            if ($status === 'published' && ! $resource->published_at) {
                $resource->published_at = now();
            }
        }

        $resource->save();

        if ($request->hasFile('file')) {
            $this->fileService->replace($request->file('file'), $resource);
        }

        AuditLog::record('resource.updated', 'Mise à jour de la ressource « '.$resource->title.' »', $resource);

        if ($resource->status === 'pending_review') {
            $this->notifyAdmins(
                'resource_pending',
                'Ressource en attente de validation',
                $user->name.' a soumis « '.$resource->title.' » pour validation.',
                '/admin/ressources',
            );
        }

        return response()->json([
            'message' => 'La ressource a été mise à jour.',
            'data' => new ResourceResource($resource->fresh()->load(['filiere', 'anneeFormation', 'module', 'primaryFile'])),
        ]);
    }

    public function destroy(Resource $resource): JsonResponse
    {
        $this->authorize('delete', $resource);

        $this->fileService->deleteAll($resource);
        $title = $resource->title;
        $resource->delete();

        AuditLog::record('resource.deleted', 'Suppression de la ressource « '.$title.' »');

        return response()->json(['message' => 'La ressource a été supprimée.']);
    }

    private function resolveStatus(User $user, ?string $requested, ?Resource $current = null): string
    {
        if ($user->isAdmin()) {
            return $requested ?? $current?->status ?? 'draft';
        }

        if ($requested === 'draft') {
            return 'draft';
        }

        if ($current && in_array($current->status, ['published'], true) && ! $requested) {
            return $current->status;
        }

        return Setting::getBool('contributor_validation', true) ? 'pending_review' : 'published';
    }

    private function notifyAdmins(string $type, string $title, string $message, string $url): void
    {
        User::where('role', UserRole::Admin)
            ->where('is_active', true)
            ->get()
            ->each(fn (User $admin) => $admin->appNotifications()->create([
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'url' => $url,
            ]));
    }
}
