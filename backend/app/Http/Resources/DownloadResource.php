<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DownloadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'resource_id' => $this->resource_id,
            'resource_title' => $this->resource_title ?? $this->resource?->title,
            'resource' => ResourceResource::make($this->whenLoaded('resource')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
