<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'code', 'description', 'position'])]
class Niveau extends Model
{
    use HasFactory;

    public function anneesFormation(): HasMany
    {
        return $this->hasMany(AnneeFormation::class);
    }
}
