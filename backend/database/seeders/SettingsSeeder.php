<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'site_name' => 'Digital Academy',
            'site_tagline' => 'Apprends aujourd\'hui, construis le numérique de demain.',
            'site_logo' => null,
            'available_languages' => 'fr,ar,en',
            'public_downloads_enabled' => '1',
            'comments_moderation' => '1',
            'contributor_validation' => '1',
        ];

        foreach ($settings as $key => $value) {
            Setting::put($key, $value);
        }
    }
}
