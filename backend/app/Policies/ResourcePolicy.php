<?php

namespace App\Policies;

use App\Models\Resource;
use App\Models\User;

class ResourcePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function view(User $user, Resource $resource): bool
    {
        return $resource->status === 'published' || $user->isContributor();
    }

    public function update(User $user, Resource $resource): bool
    {
        return $user->isContributor() && $resource->author_id === $user->id;
    }

    public function delete(User $user, Resource $resource): bool
    {
        return $user->isContributor() && $resource->author_id === $user->id;
    }

    public function download(User $user, Resource $resource): bool
    {
        return $resource->isPubliclyVisible() || $user->exists;
    }
}
