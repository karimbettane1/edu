<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Project;
use App\Models\Quiz;
use App\Models\Resource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'filieres_count' => Filiere::where('is_active', true)->count(),
                'modules_count' => Module::count(),
                'resources_count' => Resource::published()->where('visibility', 'public')->count(),
                'students_count' => User::where('role', UserRole::Student)->where('is_active', true)->count(),
                'contributors_count' => User::where('role', UserRole::Contributor)->where('is_active', true)->count(),
                'downloads_count' => (int) Resource::published()->sum('downloads_count'),
                'quizzes_count' => Quiz::where('is_published', true)->count(),
                'projects_count' => Project::where('status', 'published')->count(),
            ],
        ]);
    }
}
