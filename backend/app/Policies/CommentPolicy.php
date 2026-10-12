<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function delete(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->id;
    }
}
