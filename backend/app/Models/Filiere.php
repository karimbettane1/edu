<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'code', 'slug', 'description', 'color', 'icon', 'image', 'is_active', 'position'])]
class Filiere extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function anneesFormation(): HasMany
    {
        return $this->hasMany(AnneeFormation::class)->orderBy('position');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class)->orderBy('position');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
