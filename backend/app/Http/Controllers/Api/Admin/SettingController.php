<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingRequest;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    private const EDITABLE_KEYS = [
        'site_name',
        'site_tagline',
        'site_description',
        'contact_email',
        'available_languages',
        'default_language',
        'public_downloads_enabled',
        'comments_moderation',
        'contributor_validation',
    ];

    public function index(): JsonResponse
    {
        $settings = Setting::query()
            ->whereIn('key', self::EDITABLE_KEYS)
            ->pluck('value', 'key');

        $defaults = collect(self::EDITABLE_KEYS)->mapWithKeys(fn (string $key) => [$key => null]);

        return response()->json([
            'data' => $defaults->merge($settings),
        ]);
    }

    public function update(SettingRequest $request): JsonResponse
    {
        $submitted = collect($request->input('settings'))
            ->only(self::EDITABLE_KEYS);

        if ($submitted->isEmpty()) {
            return response()->json(['message' => 'Aucun paramètre valide à enregistrer.'], 422);
        }

        $submitted->each(fn ($value, string $key) => Setting::put($key, $value === null ? null : (string) $value));

        AuditLog::record(
            'settings.updated',
            'Mise à jour des paramètres : '.$submitted->keys()->implode(', '),
            null,
            ['keys' => $submitted->keys()->all()],
        );

        return response()->json([
            'message' => 'Les paramètres ont été enregistrés.',
            'data' => Setting::query()->whereIn('key', self::EDITABLE_KEYS)->pluck('value', 'key'),
        ]);
    }
}
