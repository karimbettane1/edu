<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['filiere_id', 'niveau_id', 'label', 'code', 'option_name', 'is_active', 'position'])]
class AnneeFormation extends Model
{
    use HasFactory;

    protected $table = 'annees_formation';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function niveau(): BelongsTo
    {
        return $this->belongsTo(Niveau::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class)->orderBy('position');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class);
    }

    public function displayName(): string
    {
        return $this->option_name ? "{$this->label} — {$this->option_name}" : $this->label;
    }
}
