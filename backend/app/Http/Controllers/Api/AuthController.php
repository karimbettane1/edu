<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdatePreferencesRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->lower()->toString(),
            'password' => $request->string('password')->toString(),
            'filiere_id' => $request->integer('filiere_id'),
            'annee_formation_id' => $request->integer('annee_formation_id'),
            'language' => $request->input('language', 'fr'),
            'role' => UserRole::Student,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $user->appNotifications()->create([
            'type' => 'welcome',
            'title' => 'Bienvenue sur Digital Academy',
            'message' => 'Explorez les ressources de votre filière et enregistrez vos favoris pour les retrouver facilement.',
            'url' => '/etudiant',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'auth.register',
            'description' => 'Création du compte étudiant '.$user->name,
            'target_type' => 'User',
            'target_id' => $user->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Votre compte a été créé avec succès.',
            'token' => $user->createToken('auth')->plainTextToken,
            'user' => new UserResource($user->load(['filiere', 'anneeFormation'])),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $throttleKey = Str::transliterate(Str::lower($request->string('email')->toString()).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'message' => "Trop de tentatives de connexion. Veuillez réessayer dans {$seconds} secondes.",
            ], 429);
        }

        $user = User::where('email', $request->string('email')->lower()->toString())->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            AuditLog::create([
                'user_id' => $user?->id,
                'action' => 'auth.failed',
                'description' => 'Tentative de connexion échouée pour '.$request->string('email')->toString(),
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Ces identifiants ne correspondent à aucun compte.',
            ], 422);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Votre compte a été désactivé. Veuillez contacter l\'administration.',
            ], 403);
        }

        RateLimiter::clear($throttleKey);

        $user->forceFill(['last_login_at' => now()])->save();

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'auth.login',
            'description' => 'Connexion de '.$user->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $user->createToken('auth')->plainTextToken,
            'user' => new UserResource($user->load(['filiere', 'anneeFormation'])),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Vous avez été déconnecté.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load(['filiere', 'anneeFormation'])),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->fill($request->validated())->save();

        return response()->json([
            'message' => 'Votre profil a été mis à jour.',
            'user' => new UserResource($user->load(['filiere', 'anneeFormation'])),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill(['password' => $request->string('password')->toString()])->save();

        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()->when($currentTokenId, fn ($query) => $query->where('id', '!=', $currentTokenId))->delete();

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'auth.password_updated',
            'description' => 'Modification du mot de passe',
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Votre mot de passe a été modifié.']);
    }

    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->forceFill(['language' => $request->string('language')->toString()])->save();

        return response()->json([
            'message' => 'Vos préférences ont été enregistrées.',
            'user' => new UserResource($user->load(['filiere', 'anneeFormation'])),
        ]);
    }
}
