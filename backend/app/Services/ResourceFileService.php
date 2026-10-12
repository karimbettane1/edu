<?php

namespace App\Services;

use App\Models\Resource;
use App\Models\ResourceFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResourceFileService
{
    public const DISK = 'local';

    /**
     * Store an uploaded file on the private disk using a safe generated name.
     */
    public function store(UploadedFile $file, Resource $resource, bool $isPrimary = true): ResourceFile
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $path = $file->storeAs(
            'resources',
            Str::uuid()->toString().'.'.$extension,
            self::DISK,
        );

        return ResourceFile::create([
            'resource_id' => $resource->id,
            'disk' => self::DISK,
            'path' => $path,
            'original_name' => $this->safeOriginalName($file, $extension),
            'extension' => $extension,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'is_primary' => $isPrimary,
        ]);
    }

    /**
     * Replace the primary file of a resource.
     */
    public function replace(UploadedFile $file, Resource $resource): ResourceFile
    {
        $resource->files()->get()->each(function (ResourceFile $existing) {
            Storage::disk($existing->disk)->delete($existing->path);
            $existing->delete();
        });

        return $this->store($file, $resource);
    }

    /**
     * Delete all files attached to a resource.
     */
    public function deleteAll(Resource $resource): void
    {
        $resource->files()->get()->each(function (ResourceFile $existing) {
            Storage::disk($existing->disk)->delete($existing->path);
            $existing->delete();
        });
    }

    private function safeOriginalName(UploadedFile $file, string $extension): string
    {
        $base = Str::of($file->getClientOriginalName())
            ->beforeLast('.')
            ->replaceMatches('/[^\p{L}\p{N}\-_ ]+/u', '')
            ->limit(80, '')
            ->trim()
            ->value();

        if ($base === '') {
            $base = 'document';
        }

        return $base.'.'.$extension;
    }
}
