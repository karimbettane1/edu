<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 20), 1), 48);

        $logs = AuditLog::query()
            ->with('user')
            ->when($request->string('action')->toString(), function (Builder $query, string $action) {
                $query->where('action', 'like', $action.'%');
            })
            ->when($request->integer('user_id'), fn (Builder $query, int $userId) => $query->where('user_id', $userId))
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where(fn (Builder $sub) => $sub->where('description', 'like', $term)
                    ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'like', $term)));
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return AuditLogResource::collection($logs);
    }
}
