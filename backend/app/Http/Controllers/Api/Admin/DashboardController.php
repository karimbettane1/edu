<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Http\Resources\ReportResource;
use App\Http\Resources\ResourceResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Comment;
use App\Models\ContactMessage;
use App\Models\Download;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Project;
use App\Models\Quiz;
use App\Models\Report;
use App\Models\Resource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'users_count' => User::count(),
            'students_count' => User::where('role', UserRole::Student)->count(),
            'contributors_count' => User::where('role', UserRole::Contributor)->count(),
            'active_users_count' => User::where('is_active', true)->count(),
            'filieres_count' => Filiere::count(),
            'modules_count' => Module::count(),
            'resources_count' => Resource::count(),
            'published_resources_count' => Resource::where('status', 'published')->count(),
            'pending_resources_count' => Resource::where('status', 'pending_review')->count(),
            'draft_resources_count' => Resource::where('status', 'draft')->count(),
            'downloads_total' => (int) Resource::sum('downloads_count'),
            'views_total' => (int) Resource::sum('views_count'),
            'quizzes_count' => Quiz::count(),
            'projects_count' => Project::count(),
            'pending_reports_count' => Report::where('status', 'pending')->count(),
            'pending_comments_count' => Comment::where('is_approved', false)->count(),
            'unread_messages_count' => ContactMessage::where('is_read', false)->count(),
        ];

        $charts = [
            'registrations_by_month' => $this->monthlyCounts(
                User::query()->where('created_at', '>=', now()->subMonths(5)->startOfMonth()),
            ),
            'downloads_by_month' => $this->monthlyCounts(
                Download::query()->where('created_at', '>=', now()->subMonths(5)->startOfMonth()),
            ),
            'resources_by_type' => Resource::query()
                ->selectRaw('type, count(*) as total')
                ->groupBy('type')
                ->pluck('total', 'type'),
            'resources_by_filiere' => Resource::query()
                ->join('filieres', 'filieres.id', '=', 'resources.filiere_id')
                ->selectRaw('filieres.name as name, count(*) as total')
                ->groupBy('filieres.name')
                ->pluck('total', 'name'),
            'resources_by_status' => Resource::query()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
        ];

        $latest = [
            'resources' => ResourceResource::collection(
                Resource::with(['filiere', 'module', 'author', 'primaryFile'])->latest()->limit(5)->get(),
            ),
            'users' => UserResource::collection(
                User::with(['filiere', 'anneeFormation'])->latest()->limit(5)->get(),
            ),
            'pending_resources' => ResourceResource::collection(
                Resource::with(['filiere', 'module', 'author', 'primaryFile'])
                    ->where('status', 'pending_review')
                    ->latest()
                    ->limit(5)
                    ->get(),
            ),
            'reports' => ReportResource::collection(
                Report::with(['user', 'resource'])
                    ->where('status', 'pending')
                    ->latest()
                    ->limit(5)
                    ->get(),
            ),
            'audit_logs' => AuditLogResource::collection(
                AuditLog::with('user')->latest('created_at')->limit(8)->get(),
            ),
        ];

        return response()->json([
            'data' => [
                'stats' => $stats,
                'charts' => $charts,
                'latest' => $latest,
            ],
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function monthlyCounts(\Illuminate\Database\Eloquent\Builder $query): array
    {
        $counts = [];

        for ($offset = 5; $offset >= 0; $offset--) {
            $month = now()->subMonths($offset);
            $label = $month->translatedFormat('M Y');

            $counts[$label] = (clone $query)
                ->whereBetween('created_at', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                ->count();
        }

        return $counts;
    }
}
