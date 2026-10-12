<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'is_approved' => (bool) $this->is_approved,
            'user' => UserResource::make($this->whenLoaded('user')),
            'resource' => ResourceResource::make($this->whenLoaded('resource')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
