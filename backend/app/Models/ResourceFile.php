<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['resource_id', 'disk', 'path', 'original_name', 'extension', 'mime_type', 'size', 'is_primary'])]
class ResourceFile extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'is_primary' => 'boolean',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function isPreviewable(): bool
    {
        return in_array($this->extension, ['pdf', 'txt', 'md'], true);
    }
}
