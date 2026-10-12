<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'message' => $this->message,
            'status' => $this->status,
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'resource' => ResourceResource::make($this->whenLoaded('resource')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
