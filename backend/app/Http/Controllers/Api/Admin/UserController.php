<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 48);

        $users = User::query()
            ->with(['filiere', 'anneeFormation'])
            ->withCount('resources')
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where(fn (Builder $sub) => $sub->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->when($request->string('role')->toString(), fn (Builder $query, string $role) => $query->where('role', $role))
            ->when($request->has('is_active'), fn (Builder $query) => $query->where('is_active', $request->boolean('is_active')))
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function update(User $user, UpdateUserRequest $request): JsonResponse
    {
        $admin = $request->user();

        if ($user->id === $admin->id && $request->hasAny(['role', 'is_active'])) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier votre propre rôle ou désactiver votre compte.',
            ], 422);
        }

        $data = $request->safe()->except(['password']);

        if ($request->filled('password')) {
            $data['password'] = $request->string('password')->toString();
        }

        if (isset($data['is_active']) && ! $data['is_active'] && $user->role === UserRole::Admin) {
            $remainingAdmins = User::where('role', UserRole::Admin)
                ->where('is_active', true)
                ->where('id', '!=', $user->id)
                ->exists();

            if (! $remainingAdmins) {
                return response()->json([
                    'message' => 'Impossible de désactiver le dernier administrateur actif.',
                ], 422);
            }
        }

        $roleChanged = isset($data['role']) && $data['role'] !== $user->role->value;

        $user->fill(Arr::except($data, ['password']));

        if (isset($data['password'])) {
            $user->password = $data['password'];
        }

        $user->save();

        AuditLog::record('user.updated', 'Mise à jour du compte de '.$user->name, $user, [
            'role_before' => $roleChanged ? $user->getOriginal('role') : null,
            'role_after' => $user->role->value,
        ]);

        if ($roleChanged) {
            $user->appNotifications()->create([
                'type' => 'role_updated',
                'title' => 'Votre rôle a été modifié',
                'message' => 'Votre rôle sur la plateforme est désormais : '.$user->role->label().'.',
                'url' => '/',
            ]);
        }

        return response()->json([
            'message' => 'Le compte a été mis à jour.',
            'data' => new UserResource($user->fresh()->load(['filiere', 'anneeFormation'])),
        ]);
    }

    public function destroy(User $user, Request $request): JsonResponse
    {
        $admin = $request->user();

        if ($user->id === $admin->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        if ($user->role === UserRole::Admin) {
            $remainingAdmins = User::where('role', UserRole::Admin)->where('id', '!=', $user->id)->exists();

            if (! $remainingAdmins) {
                return response()->json([
                    'message' => 'Impossible de supprimer le dernier administrateur.',
                ], 422);
            }
        }

        if ($user->resources()->exists() || $user->projects()->exists()) {
            return response()->json([
                'message' => 'Ce compte possède des ressources ou des projets. Désactivez-le au lieu de le supprimer.',
            ], 422);
        }

        $name = $user->name;
        $user->tokens()->delete();
        $user->delete();

        AuditLog::record('user.deleted', 'Suppression du compte de '.$name);

        return response()->json(['message' => 'Le compte a été supprimé.']);
    }
}
