<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\AuditLog;
use App\Models\Comment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 48);

        $comments = Comment::query()
            ->with(['user', 'resource.filiere', 'resource.module'])
            ->when($request->has('is_approved'), fn (Builder $query) => $query->where('is_approved', $request->boolean('is_approved')))
            ->when($request->string('search')->toString(), function (Builder $query, string $search) {
                $term = '%'.trim($search).'%';
                $query->where(fn (Builder $sub) => $sub->where('body', 'like', $term)
                    ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'like', $term)));
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return CommentResource::collection($comments);
    }

    public function update(Comment $comment, ModerateCommentRequest $request): JsonResponse
    {
        $approved = $request->boolean('is_approved');
        $comment->forceFill(['is_approved' => $approved])->save();

        AuditLog::record(
            $approved ? 'comment.approved' : 'comment.rejected',
            ($approved ? 'Approbation' : 'Rejet').' d\'un commentaire (#'.$comment->id.')',
            $comment,
        );

        if ($approved) {
            $comment->user?->appNotifications()->create([
                'type' => 'comment_approved',
                'title' => 'Votre commentaire a été approuvé',
                'message' => 'Votre commentaire sur « '.($comment->resource?->title ?? 'une ressource').' » est désormais visible.',
                'url' => '/ressources/'.$comment->resource_id,
            ]);
        }

        return response()->json([
            'message' => $approved ? 'Le commentaire a été approuvé.' : 'Le commentaire a été masqué.',
            'data' => new CommentResource($comment->load(['user', 'resource'])),
        ]);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        $comment->delete();

        AuditLog::record('comment.deleted', 'Suppression d\'un commentaire (#'.$comment->id.')');

        return response()->json(['message' => 'Le commentaire a été supprimé.']);
    }
}
