<?php

namespace App\Models;

use App\Policies\ResourcePolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'title',
    'description',
    'type',
    'status',
    'visibility',
    'filiere_id',
    'annee_formation_id',
    'module_id',
    'author_id',
    'keywords',
    'published_at',
])]
#[UsePolicy(ResourcePolicy::class)]
class Resource extends Model
{
    use HasFactory;

    public const TYPES = [
        'cours',
        'tp',
        'exercice',
        'exercice_corrige',
        'examen',
        'examen_corrige',
        'resume',
        'projet',
        'tutoriel',
        'presentation',
        'fiche_revision',
    ];

    public const STATUSES = ['draft', 'pending_review', 'published', 'rejected', 'archived'];

    /** @var array<string, string> */
    public const TYPE_LABELS = [
        'cours' => 'Cours',
        'tp' => 'Travaux pratiques',
        'exercice' => 'Exercices',
        'exercice_corrige' => 'Exercices corrigés',
        'examen' => 'Examen',
        'examen_corrige' => 'Examen corrigé',
        'resume' => 'Résumé',
        'projet' => 'Projet',
        'tutoriel' => 'Tutoriel',
        'presentation' => 'Présentation',
        'fiche_revision' => 'Fiche de révision',
    ];

    /** @var array<string, string> */
    public const STATUS_LABELS = [
        'draft' => 'Brouillon',
        'pending_review' => 'En attente de validation',
        'published' => 'Publiée',
        'rejected' => 'Rejetée',
        'archived' => 'Archivée',
    ];

    public function typeLabel(): string
    {
        return self::TYPE_LABELS[$this->type] ?? $this->type;
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? $this->status;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'downloads_count' => 'integer',
            'views_count' => 'integer',
        ];
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class);
    }

    public function anneeFormation(): BelongsTo
    {
        return $this->belongsTo(AnneeFormation::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(ResourceFile::class);
    }

    public function primaryFile(): HasOne
    {
        return $this->hasOne(ResourceFile::class)->where('is_primary', true);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(Download::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(ResourceView::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $q, string $search) {
                $term = '%'.trim($search).'%';
                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('title', 'like', $term)
                        ->orWhere('description', 'like', $term)
                        ->orWhere('keywords', 'like', $term);
                });
            })
            ->when($filters['filiere_id'] ?? null, fn (Builder $q, $id) => $q->where('filiere_id', $id))
            ->when($filters['annee_id'] ?? null, fn (Builder $q, $id) => $q->where('annee_formation_id', $id))
            ->when($filters['module_id'] ?? null, fn (Builder $q, $id) => $q->where('module_id', $id))
            ->when($filters['type'] ?? null, fn (Builder $q, $type) => $q->where('type', $type))
            ->when(
                ($filters['sort'] ?? 'recent') === 'popular',
                fn (Builder $q) => $q->orderByDesc('downloads_count')->orderByDesc('published_at'),
                fn (Builder $q) => ($filters['sort'] ?? 'recent') === 'title'
                    ? $q->orderBy('title')
                    : $q->orderByDesc('published_at')->orderByDesc('id'),
            );
    }

    public function isPubliclyVisible(): bool
    {
        return $this->visibility === 'public';
    }
}
