<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DownloadResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\QuizResource;
use App\Http\Resources\ResourceResource;
use App\Http\Resources\UserNotificationResource;
use App\Models\Favorite;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Resource;
use App\Models\ResourceView;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class StudentController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $attempts = $user->quizAttempts();
        $attemptsCount = (clone $attempts)->count();
        $bestScore = (clone $attempts)->max('score');

        $stats = [
            'favorites_count' => $user->favorites()->count(),
            'downloads_count' => $user->downloads()->count(),
            'views_count' => $user->resourceViews()->count(),
            'quiz_attempts_count' => $attemptsCount,
            'quiz_best_score' => $bestScore === null ? null : (int) $bestScore,
            'projects_count' => $user->projects()->count(),
        ];

        $views = $user->resourceViews()
            ->whereHas('resource', fn (Builder $query) => $query->published())
            ->with(['resource.filiere', 'resource.module', 'resource.primaryFile'])
            ->orderByDesc('viewed_at')
            ->get()
            ->unique('resource_id')
            ->take(4)
            ->values();

        $continueLearning = $this->decorateResources(
            $views->map(fn (ResourceView $view) => $view->resource->setAttribute(
                'last_viewed_at',
                $view->viewed_at?->toIso8601String(),
            )),
            $user,
        );

        $recentDownloads = $user->downloads()
            ->with(['resource.filiere', 'resource.module', 'resource.primaryFile'])
            ->latest()
            ->limit(5)
            ->get()
            ->filter(fn ($download) => $download->resource !== null)
            ->values();

        $suggestedResources = Resource::query()
            ->with(['filiere', 'anneeFormation', 'module', 'author', 'primaryFile'])
            ->withCount(['comments', 'favorites'])
            ->published()
            ->where('visibility', 'public')
            ->when($user->filiere_id, fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->orderByDesc('published_at')
            ->limit(6)
            ->get();

        $this->markFavorites($suggestedResources, $user->favorites()->pluck('resource_id')->all());

        $suggestedQuizzes = Quiz::query()
            ->with(['module', 'filiere'])
            ->withCount('questions')
            ->where('is_published', true)
            ->when($user->filiere_id, fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->latest()
            ->limit(3)
            ->get();

        return response()->json([
            'data' => [
                'stats' => $stats,
                'continue_learning' => ResourceResource::collection($continueLearning),
                'recent_downloads' => DownloadResource::collection($recentDownloads),
                'suggested_resources' => ResourceResource::collection($suggestedResources),
                'suggested_quizzes' => QuizResource::collection($suggestedQuizzes),
                'unread_notifications' => $user->appNotifications()->whereNull('read_at')->count(),
            ],
        ]);
    }

    public function favorites(Request $request)
    {
        $user = $request->user();
        $perPage = min(max($request->integer('per_page', 12), 1), 48);

        $resources = Resource::query()
            ->with(['filiere', 'anneeFormation', 'module', 'author', 'primaryFile'])
            ->withCount(['comments', 'favorites'])
            ->whereHas('favorites', fn (Builder $query) => $query->where('user_id', $user->id))
            ->orderByDesc('resources.updated_at')
            ->paginate($perPage)
            ->withQueryString();

        $resources->getCollection()->each(fn (Resource $resource) => $resource->setAttribute('is_favorited', true));

        return ResourceResource::collection($resources);
    }

    public function downloads(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 48);

        $downloads = $request->user()->downloads()
            ->with(['resource.filiere', 'resource.module', 'resource.primaryFile'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return DownloadResource::collection($downloads);
    }

    public function recentViews(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = min(max($request->integer('per_page', 4), 1), 20);

        $views = $user->resourceViews()
            ->whereHas('resource', fn (Builder $query) => $query->published())
            ->with(['resource.filiere', 'resource.module', 'resource.primaryFile'])
            ->orderByDesc('viewed_at')
            ->get()
            ->unique('resource_id')
            ->take($limit)
            ->values();

        $resources = $views->map(fn (ResourceView $view) => $view->resource->setAttribute(
            'last_viewed_at',
            $view->viewed_at?->toIso8601String(),
        ));

        return response()->json([
            'data' => ResourceResource::collection($this->decorateResources($resources, $user)),
        ]);
    }

    public function notifications(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 48);

        $notifications = $request->user()->appNotifications()
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return UserNotificationResource::collection($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $request->user()->appNotifications()->whereNull('read_at')->count(),
        ]);
    }

    public function markNotificationRead(UserNotification $notification, Request $request): JsonResponse
    {
        abort_if($notification->user_id !== $request->user()->id, 403);

        if (! $notification->isRead()) {
            $notification->forceFill(['read_at' => now()])->save();
        }

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $request->user()->appNotifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }

    public function quizAttempts(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 48);

        $attempts = $request->user()->quizAttempts()
            ->with(['quiz.module'])
            ->orderByDesc('completed_at')
            ->paginate($perPage)
            ->withQueryString();

        return QuizAttemptResource::collection($attempts);
    }

    public function projects(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 9), 1), 48);

        $projects = $request->user()->projects()
            ->with(['filiere', 'user'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    /**
     * @param  Collection<int, Resource>  $resources
     * @return Collection<int, Resource>
     */
    private function decorateResources(Collection $resources, $user): Collection
    {
        $favoritedIds = Favorite::where('user_id', $user->id)
            ->whereIn('resource_id', $resources->pluck('id'))
            ->pluck('resource_id')
            ->all();

        return $this->markFavorites($resources, $favoritedIds);
    }

    /**
     * @param  Collection<int, Resource>  $resources
     * @param  array<int, int>  $favoritedIds
     * @return Collection<int, Resource>
     */
    private function markFavorites(Collection $resources, array $favoritedIds): Collection
    {
        return $resources->each(fn (Resource $resource) => $resource->setAttribute(
            'is_favorited',
            in_array($resource->id, $favoritedIds, true),
        ));
    }
}
