<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\CommentRequest;
use App\Http\Requests\ReportRequest;
use App\Http\Resources\CommentResource;
use App\Http\Resources\ResourceResource;
use App\Models\AuditLog;
use App\Models\Comment;
use App\Models\Download;
use App\Models\Favorite;
use App\Models\Report;
use App\Models\Resource;
use App\Models\ResourceFile;
use App\Models\ResourceView;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ResourceController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 12), 1), 48);
        $user = $this->currentUser($request);

        $resources = Resource::query()
            ->with(['filiere', 'anneeFormation', 'module', 'author', 'primaryFile'])
            ->withCount(['comments', 'favorites'])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->when(! $user, fn (Builder $query) => $query->where('visibility', 'public'))
            ->filter([
                'search' => $request->string('search')->toString(),
                'filiere_id' => $request->integer('filiere_id') ?: null,
                'annee_id' => $request->integer('annee_id') ?: null,
                'module_id' => $request->integer('module_id') ?: null,
                'type' => $request->string('type')->toString() ?: null,
                'sort' => $request->string('sort')->toString() ?: 'recent',
            ])
            ->paginate($perPage)
            ->withQueryString();

        $this->markFavorites($resources->getCollection(), $user);

        return ResourceResource::collection($resources);
    }

    public function show(int $id, Request $request)
    {
        $user = $this->currentUser($request);

        $resource = Resource::query()
            ->with(['filiere', 'anneeFormation', 'module', 'author', 'files', 'primaryFile'])
            ->withCount(['comments', 'favorites'])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->when(! $user, fn (Builder $query) => $query->where('visibility', 'public'))
            ->findOrFail($id);

        $this->recordView($resource, $user);
        $this->markFavorites(collect([$resource]), $user);

        return response()->json(['data' => new ResourceResource($resource)]);
    }

    public function download(int $id, Request $request)
    {
        $resource = $this->findDownloadableResource($id, $request);
        $file = $resource->primaryFile ?? $resource->files()->first();

        if (! $file) {
            return response()->json(['message' => 'Aucun fichier n\'est associé à cette ressource.'], 404);
        }

        $this->recordDownload($resource, $request, $file);

        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }

    public function preview(int $id, Request $request): BinaryFileResponse|StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $resource = $this->findDownloadableResource($id, $request);
        $file = $resource->primaryFile ?? $resource->files()->first();

        if (! $file) {
            return response()->json(['message' => 'Aucun fichier n\'est associé à cette ressource.'], 404);
        }

        if (! $file->isPreviewable()) {
            return response()->json([
                'message' => 'Ce format de fichier ne peut pas être prévisualisé. Veuillez le télécharger.',
            ], 422);
        }

        $path = Storage::disk($file->disk)->path($file->path);

        return response()->file($path, [
            'Content-Type' => $file->mime_type ?? 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$file->original_name.'"',
        ]);
    }

    public function favorite(int $id, Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $resource = Resource::where('status', 'published')->findOrFail($id);

        $existing = Favorite::where('user_id', $user->id)->where('resource_id', $resource->id)->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'favorited' => false,
                'message' => 'La ressource a été retirée de vos favoris.',
            ]);
        }

        Favorite::create(['user_id' => $user->id, 'resource_id' => $resource->id]);

        return response()->json([
            'favorited' => true,
            'message' => 'La ressource a été ajoutée à vos favoris.',
        ], 201);
    }

    public function comments(int $id): \Illuminate\Http\JsonResponse
    {
        $resource = Resource::where('status', 'published')->findOrFail($id);

        $comments = $resource->comments()
            ->approved()
            ->with('user')
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => CommentResource::collection($comments->getCollection()),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    public function addComment(int $id, CommentRequest $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $resource = Resource::where('status', 'published')->findOrFail($id);

        $moderationEnabled = Setting::getBool('comments_moderation', true);

        $comment = $resource->comments()->create([
            'user_id' => $user->id,
            'body' => $request->string('body')->toString(),
            'is_approved' => ! $moderationEnabled,
        ]);

        if ($moderationEnabled) {
            $this->notifyAdmins(
                'comment_pending',
                'Nouveau commentaire à modérer',
                $user->name.' a commenté la ressource « '.$resource->title.' ».',
                '/admin/commentaires',
            );
        } elseif ($resource->author_id) {
            $resource->author?->appNotifications()->create([
                'type' => 'new_comment',
                'title' => 'Nouveau commentaire sur votre ressource',
                'message' => $user->name.' a commenté « '.$resource->title.' ».',
                'url' => '/ressources/'.$resource->id,
            ]);
        }

        return response()->json([
            'message' => $moderationEnabled
                ? 'Votre commentaire sera publié après validation par l\'administration.'
                : 'Votre commentaire a été publié.',
            'data' => new CommentResource($comment->load('user')),
        ], 201);
    }

    public function deleteComment(Comment $comment, Request $request): \Illuminate\Http\JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        AuditLog::record('comment.deleted', 'Suppression d\'un commentaire', $comment);

        return response()->json(['message' => 'Le commentaire a été supprimé.']);
    }

    public function report(int $id, ReportRequest $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $resource = Resource::where('status', 'published')->findOrFail($id);

        $alreadyReported = Report::where('user_id', $user->id)
            ->where('resource_id', $resource->id)
            ->where('status', 'pending')
            ->exists();

        if ($alreadyReported) {
            return response()->json([
                'message' => 'Vous avez déjà signalé cette ressource. Notre équipe est en train de la vérifier.',
            ], 422);
        }

        Report::create([
            'user_id' => $user->id,
            'resource_id' => $resource->id,
            'reason' => $request->string('reason')->toString(),
            'message' => $request->input('message'),
            'status' => 'pending',
        ]);

        $this->notifyAdmins(
            'report_created',
            'Nouveau signalement',
            $user->name.' a signalé la ressource « '.$resource->title.' ».',
            '/admin/signalements',
        );

        return response()->json([
            'message' => 'Merci, votre signalement a été transmis à l\'administration.',
        ], 201);
    }

    /**
     * Résout l'utilisateur connecté même sur les routes publiques (token Sanctum optionnel).
     */
    private function currentUser(Request $request): ?User
    {
        return $request->user() ?? $request->user('sanctum');
    }

    private function findDownloadableResource(int $id, Request $request): Resource
    {
        $user = $this->currentUser($request);

        $resource = Resource::query()
            ->with(['primaryFile', 'files'])
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->findOrFail($id);

        if (! $resource->isPubliclyVisible() && ! $user) {
            abort(403, 'Cette ressource est réservée aux étudiants connectés.');
        }

        if (! $user) {
            abort_if(
                ! Setting::getBool('public_downloads_enabled', true),
                401,
                'Le téléchargement de ce document nécessite un compte étudiant.',
            );
        }

        return $resource;
    }

    private function recordDownload(Resource $resource, Request $request, ResourceFile $file): void
    {
        $resource->increment('downloads_count');

        if ($user = $request->user()) {
            Download::create([
                'user_id' => $user->id,
                'resource_id' => $resource->id,
                'resource_title' => $resource->title,
            ]);
        }

        AuditLog::record('resource.downloaded', 'Téléchargement de « '.$resource->title.' »', $resource, [
            'file' => $file->original_name,
        ]);
    }

    private function recordView(Resource $resource, ?User $user): void
    {
        $resource->increment('views_count');

        if (! $user) {
            return;
        }

        $recentlyViewed = ResourceView::where('user_id', $user->id)
            ->where('resource_id', $resource->id)
            ->where('viewed_at', '>=', now()->subHour())
            ->exists();

        if (! $recentlyViewed) {
            ResourceView::create([
                'user_id' => $user->id,
                'resource_id' => $resource->id,
                'viewed_at' => now(),
            ]);
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Resource>  $resources
     */
    private function markFavorites(\Illuminate\Support\Collection $resources, ?User $user): void
    {
        if (! $user || $resources->isEmpty()) {
            $resources->each(fn (Resource $resource) => $resource->setAttribute('is_favorited', false));

            return;
        }

        $favoritedIds = Favorite::where('user_id', $user->id)
            ->whereIn('resource_id', $resources->pluck('id'))
            ->pluck('resource_id')
            ->all();

        $resources->each(fn (Resource $resource) => $resource->setAttribute(
            'is_favorited',
            in_array($resource->id, $favoritedIds, true),
        ));
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
