<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContributorController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::get('/stats', [StatsController::class, 'index']);

Route::get('/filieres', [CatalogController::class, 'filieres']);
Route::get('/filieres/{filiere:slug}', [CatalogController::class, 'filiere']);
Route::get('/niveaux', [CatalogController::class, 'niveaux']);
Route::get('/annees', [CatalogController::class, 'annees']);
Route::get('/modules', [CatalogController::class, 'modules']);
Route::get('/resource-types', [CatalogController::class, 'resourceTypes']);

Route::get('/resources', [ResourceController::class, 'index']);
Route::get('/resources/{id}', [ResourceController::class, 'show'])->whereNumber('id');
Route::get('/resources/{id}/download', [ResourceController::class, 'download'])
    ->whereNumber('id')
    ->middleware('throttle:60,1');
Route::get('/resources/{id}/preview', [ResourceController::class, 'preview'])
    ->whereNumber('id')
    ->middleware('throttle:60,1');
Route::get('/resources/{id}/comments', [ResourceController::class, 'comments'])->whereNumber('id');

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show'])->whereNumber('id');

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:10,1');

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:20,1');

/*
|--------------------------------------------------------------------------
| Routes authentifiées (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me/profile', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);
    Route::put('/me/preferences', [AuthController::class, 'updatePreferences']);

    // Espace étudiant
    Route::get('/me/dashboard', [StudentController::class, 'dashboard']);
    Route::get('/me/downloads', [StudentController::class, 'downloads']);
    Route::get('/me/recent-views', [StudentController::class, 'recentViews']);
    Route::get('/me/notifications', [StudentController::class, 'notifications']);
    Route::get('/me/notifications/unread-count', [StudentController::class, 'unreadCount']);
    Route::post('/me/notifications/read-all', [StudentController::class, 'markAllNotificationsRead']);
    Route::post('/me/notifications/{notification}/read', [StudentController::class, 'markNotificationRead']);
    Route::get('/me/quiz-attempts', [StudentController::class, 'quizAttempts']);
    Route::get('/me/projects', [StudentController::class, 'projects']);
    Route::get('/favorites', [StudentController::class, 'favorites']);

    // Interactions sur les ressources
    Route::post('/resources/{id}/favorite', [ResourceController::class, 'favorite'])->whereNumber('id');
    Route::post('/resources/{id}/comments', [ResourceController::class, 'addComment'])
        ->whereNumber('id')
        ->middleware('throttle:20,1');
    Route::delete('/comments/{comment}', [ResourceController::class, 'deleteComment']);
    Route::post('/resources/{id}/reports', [ResourceController::class, 'report'])
        ->whereNumber('id')
        ->middleware('throttle:10,1');

    // Quiz
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show'])->whereNumber('id');
    Route::get('/quizzes/{id}/attempts', [QuizController::class, 'attempts'])->whereNumber('id');
    Route::post('/quizzes/{id}/attempts', [QuizController::class, 'submitAttempt'])
        ->whereNumber('id')
        ->middleware('throttle:30,1');

    // Projets étudiants
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    /*
    |----------------------------------------------------------------------
    | Espace contributeur
    |----------------------------------------------------------------------
    */
    Route::middleware('role:contributor,admin')->prefix('contributor')->group(function () {
        Route::get('/stats', [ContributorController::class, 'stats']);
        Route::get('/resources', [ContributorController::class, 'resources']);
        Route::get('/resources/{resource}', [ContributorController::class, 'show']);
        Route::post('/resources', [ContributorController::class, 'store']);
        Route::match(['post', 'put'], '/resources/{resource}', [ContributorController::class, 'update']);
        Route::delete('/resources/{resource}', [ContributorController::class, 'destroy']);
    });

    /*
    |----------------------------------------------------------------------
    | Espace administration
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [Admin\DashboardController::class, 'index']);

        Route::get('/resources', [Admin\ResourceController::class, 'index']);
        Route::get('/resources/{resource}', [Admin\ResourceController::class, 'show']);
        Route::post('/resources', [Admin\ResourceController::class, 'store']);
        Route::match(['post', 'put'], '/resources/{resource}', [Admin\ResourceController::class, 'update']);
        Route::delete('/resources/{resource}', [Admin\ResourceController::class, 'destroy']);

        Route::apiResource('filieres', Admin\FiliereController::class)->except(['show']);
        Route::apiResource('annees', Admin\AnneeController::class)->except(['show']);
        Route::apiResource('modules', Admin\ModuleController::class)->except(['show']);

        Route::get('/users', [Admin\UserController::class, 'index']);
        Route::put('/users/{user}', [Admin\UserController::class, 'update']);
        Route::delete('/users/{user}', [Admin\UserController::class, 'destroy']);

        Route::get('/reports', [Admin\ReportController::class, 'index']);
        Route::put('/reports/{report}', [Admin\ReportController::class, 'update']);

        Route::get('/comments', [Admin\CommentController::class, 'index']);
        Route::put('/comments/{comment}', [Admin\CommentController::class, 'update']);
        Route::delete('/comments/{comment}', [Admin\CommentController::class, 'destroy']);

        Route::get('/settings', [Admin\SettingController::class, 'index']);
        Route::post('/settings', [Admin\SettingController::class, 'update']);

        Route::get('/audit-logs', [Admin\AuditLogController::class, 'index']);
    });
});
