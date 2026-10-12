<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Module;
use App\Models\Resource;
use App\Models\ResourceFile;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SplFileInfo;

class ImportPdfs extends Command
{
    protected $signature = 'academy:import-pdfs
        {--path= : Dossier source des PDF (défaut : storage/app/ofppt-import)}
        {--dry-run : Simule l\'import sans rien modifier}
        {--create : Crée de nouvelles ressources pour les PDF sans ressource disponible}
        {--force : Réimporte un fichier déjà associé à une ressource}';

    protected $description = 'Associe les PDF de votre dossier d\'import (storage/app/ofppt-import) aux ressources des modules DD/ID et remplace les fichiers de démonstration';

    /** Mot-clé de type dans le nom de fichier => types de ressource, par ordre de préférence. */
    private const TYPE_KEYWORDS = [
        'cours' => ['cours'],
        'tp' => ['tp'],
        'td' => ['tp'],
        'travaux' => ['tp'],
        'exercice' => ['exercice', 'exercice_corrige'],
        'exercices' => ['exercice', 'exercice_corrige'],
        'examen' => ['examen', 'examen_corrige'],
        'efm' => ['examen', 'examen_corrige'],
        'eff' => ['examen', 'examen_corrige'],
        'controle' => ['examen', 'examen_corrige'],
        'resume' => ['resume', 'fiche_revision'],
        'fiche' => ['fiche_revision', 'resume'],
        'tutoriel' => ['tutoriel'],
        'presentation' => ['presentation'],
        'projet' => ['projet'],
    ];

    /** Chemin en dessous duquel un fichier de démonstration généré est considéré comme remplaçable. */
    private const MAX_GENERATED_SIZE = 100_000;

    private const STOPWORDS = ['le', 'la', 'les', 'l', 'du', 'de', 'des', 'd', 'un', 'une', 'et', 'au', 'aux', 'en', 'pour', 'avec', 'sur', 'dans', 'par'];

    private const FILIERE_HINTS = ['dd', 'id'];

    private int $replaced = 0;

    private int $created = 0;

    private int $skipped = 0;

    private int $unmatched = 0;

    public function handle(): int
    {
        $sourceDir = $this->sourceDirectory();
        if (! File::isDirectory($sourceDir)) {
            $this->error("Dossier d'import introuvable : {$sourceDir}");
            $this->line('Créez-le, déposez-y vos PDF puis relancez la commande.');

            return self::FAILURE;
        }

        $files = $this->pdfFiles($sourceDir);
        if ($files->isEmpty()) {
            $this->warn("Aucun PDF à importer dans {$sourceDir}");

            return self::SUCCESS;
        }

        $dryRun = (bool) $this->option('dry-run');
        $create = (bool) $this->option('create');
        $force = (bool) $this->option('force');

        $moduleIndex = Module::with('filiere')->get()
            ->map(fn (Module $module) => ['module' => $module, 'tokens' => $this->significantTokens($this->tokenize($module->name))]);

        $resourcesByModule = Resource::with('primaryFile')->whereNotNull('module_id')->get()->groupBy('module_id');
        $usedResourceIds = [];

        $rows = [];
        foreach ($files as $file) {
            $rows[] = $this->processFile($file, $moduleIndex, $resourcesByModule, $usedResourceIds, $dryRun, $create, $force);
        }

        $this->newLine();
        $this->table(['Fichier', 'Module', 'Type', 'Cible / Action', 'Statut'], $rows);
        $this->line(sprintf(
            'Bilan : %d remplacé(s), %d créée(s), %d déjà importé(s), %d non associé(s).',
            $this->replaced,
            $this->created,
            $this->skipped,
            $this->unmatched,
        ));

        if ($dryRun) {
            $this->warn('Mode simulation (--dry-run) : aucune modification effectuée.');
        } else {
            $this->info('Import terminé. Les fichiers sont servis par la plateforme et ne sont jamais versionnés (storage/ est exclu du git).');
        }

        return self::SUCCESS;
    }

    /**
     * @param  Collection<int, array{module: Module, key: string}>  $moduleIndex
     * @param  Collection<int, Collection<int, Resource>>  $resourcesByModule
     * @param  array<int, bool>  $usedResourceIds
     * @return array<int, string>
     */
    private function processFile(
        SplFileInfo $file,
        Collection $moduleIndex,
        Collection $resourcesByModule,
        array &$usedResourceIds,
        bool $dryRun,
        bool $create,
        bool $force,
    ): array {
        $sourceName = $file->getFilename();
        $base = pathinfo($sourceName, PATHINFO_FILENAME);
        $tokens = preg_split('/[^a-z0-9]+/', $this->asciiLower($base), -1, PREG_SPLIT_NO_EMPTY);

        $filiereHint = in_array('dd', $tokens, true) ? 'DD' : (in_array('id', $tokens, true) ? 'ID' : null);

        [$module, $moduleError] = $this->matchModule($tokens, $moduleIndex, $filiereHint);
        if (! $module) {
            $this->unmatched++;

            return [$this->short($sourceName), '—', '—', '—', 'Non associé : '.$moduleError];
        }

        [$types, $defaultedType] = $this->detectTypes($tokens);
        $typeLabel = $types[0].($defaultedType ? ' (déduit)' : '');

        $resource = null;
        foreach ($types as $type) {
            $resource = ($resourcesByModule[$module->id] ?? collect())
                ->first(fn (Resource $candidate) => $candidate->type === $type && ! isset($usedResourceIds[$candidate->id]));
            if ($resource !== null) {
                break;
            }
        }

        if ($resource === null) {
            if (! $create) {
                $this->unmatched++;

                return [$this->short($sourceName), $module->code.' — '.$this->short($module->name), $typeLabel, '—', 'Non associé : aucune ressource disponible (relancez avec --create)'];
            }

            return $this->createResource($module, $types[0], $file, $sourceName, $dryRun, $typeLabel);
        }

        $usedResourceIds[$resource->id] = true;

        if (! $force && $resource->primaryFile?->original_name === $sourceName) {
            $this->skipped++;

            return [$this->short($sourceName), $module->code, $typeLabel, $this->resourceTarget($resource), 'Déjà importé (ignoré)'];
        }

        $note = $this->attachFile($resource, $file, $sourceName, $dryRun);

        return [$this->short($sourceName), $module->code, $typeLabel, $this->resourceTarget($resource), $note];
    }

    /**
     * @param  array<int, string>  $tokens
     * @param  Collection<int, array{module: Module, tokens: array<int, string>}>  $moduleIndex
     * @return array{0: ?Module, 1: ?string}
     */
    private function matchModule(array $tokens, Collection $moduleIndex, ?string $filiereHint): array
    {
        $query = $this->significantTokens($tokens);
        if ($query === []) {
            return [null, 'nom de fichier trop générique pour identifier un module'];
        }

        $candidates = [];
        foreach ($moduleIndex as $entry) {
            if ($entry['tokens'] === []) {
                continue;
            }

            $overlap = array_intersect($query, $entry['tokens']);
            if ($overlap === []) {
                continue;
            }

            $ratio = count($overlap) / count($entry['tokens']);
            $hasSpecificWord = count($overlap) >= 2 || max(array_map('strlen', $overlap)) >= 5;

            if ($ratio >= 0.5 && $hasSpecificWord) {
                $candidates[] = ['module' => $entry['module'], 'ratio' => $ratio];
            }
        }

        if ($candidates === []) {
            return [null, 'aucun module DD/ID ne correspond au nom de fichier'];
        }

        $maxRatio = max(array_column($candidates, 'ratio'));
        $best = array_values(array_filter($candidates, fn (array $candidate) => abs($candidate['ratio'] - $maxRatio) < 0.0001));

        if (count($best) === 1) {
            return [$best[0]['module'], null];
        }

        if ($filiereHint !== null) {
            $filtered = array_values(array_filter($best, fn (array $candidate) => $candidate['module']->filiere->code === $filiereHint));
            if (count($filtered) === 1) {
                return [$filtered[0]['module'], null];
            }
        }

        return [null, 'titre présent dans les filières DD et ID — préfixez le nom par « DD » ou « ID »'];
    }

    /**
     * @param  array<int, string>  $tokens
     * @return array{0: array<int, string>, 1: bool}
     */
    private function detectTypes(array $tokens): array
    {
        $types = null;
        foreach ($tokens as $token) {
            if (isset(self::TYPE_KEYWORDS[$token])) {
                $types = self::TYPE_KEYWORDS[$token];
                break;
            }
        }

        if ($types === null) {
            return [['cours'], true];
        }

        $corrected = $types[0] !== 'tp' && $types[0] !== 'cours' && count(array_intersect($tokens, ['corrige', 'corriges', 'corrigee', 'correction'])) > 0;
        if ($corrected && $types[0] === 'exercice') {
            $types = ['exercice_corrige', 'exercice'];
        } elseif ($corrected && $types[0] === 'examen') {
            $types = ['examen_corrige', 'examen'];
        }

        return [$types, false];
    }

    private function attachFile(Resource $resource, SplFileInfo $file, string $sourceName, bool $dryRun): string
    {
        $contents = File::get($file->getRealPath());
        if (! str_starts_with($contents, '%PDF')) {
            $this->unmatched++;

            return 'Ignoré : fichier PDF illisible ou corrompu';
        }

        if ($dryRun) {
            $this->replaced++;

            return 'Sera remplacé par « '.$this->short($sourceName).' »';
        }

        $oldFile = $resource->primaryFile;
        $oldPath = $oldFile?->path;
        $oldSize = $oldFile?->size;
        $oldOriginal = $oldFile?->original_name;

        $newPath = 'resources/'.Str::uuid().'.pdf';
        Storage::disk('local')->put($newPath, $contents);

        $record = $oldFile ?? new ResourceFile(['resource_id' => $resource->id]);
        $record->fill([
            'disk' => 'local',
            'path' => $newPath,
            'original_name' => $sourceName,
            'extension' => 'pdf',
            'mime_type' => 'application/pdf',
            'size' => strlen($contents),
            'is_primary' => true,
        ])->save();

        $this->deleteReplacedDemoFile($resource, $oldPath, $oldSize, $oldOriginal);

        AuditLog::record('resource.imported', 'Import du fichier « '.$sourceName.' » pour « '.$resource->title.' »', $resource);
        $this->replaced++;

        return 'Remplacé ('.number_format(strlen($contents) / 1024, 0, ',', ' ').' Ko)';
    }

    private function deleteReplacedDemoFile(Resource $resource, ?string $oldPath, ?int $oldSize, ?string $oldOriginal): void
    {
        if ($oldPath === null || $oldSize === null || ! str_starts_with($oldPath, 'resources/')) {
            return;
        }

        $fullPath = Storage::disk('local')->path($oldPath);
        $generatedName = Str::slug(Str::limit($resource->title, 80, '')).'.pdf';

        $isVerifiableDemoFile = is_file($fullPath)
            && filesize($fullPath) === $oldSize
            && $oldSize <= self::MAX_GENERATED_SIZE
            && $oldOriginal === $generatedName;

        if ($isVerifiableDemoFile && ! ResourceFile::where('path', $oldPath)->exists()) {
            Storage::disk('local')->delete($oldPath);
        }
    }

    private function createResource(Module $module, string $type, SplFileInfo $file, string $sourceName, bool $dryRun, string $typeLabel): array
    {
        $title = Resource::TYPE_LABELS[$type].' — '.$module->name.' ('.$module->code.')';
        $existingCount = Resource::where('module_id', $module->id)->where('type', $type)->count();
        if ($existingCount > 0) {
            $title .= ' · partie '.($existingCount + 1);
        }

        if ($dryRun) {
            $this->created++;

            return [$this->short($sourceName), $module->code, $typeLabel, 'Création : '.$this->short($title), 'Sera créée'];
        }

        $author = User::query()->where('role', UserRole::Contributor)->orderBy('id')->first()
            ?? User::query()->where('role', UserRole::Admin)->orderBy('id')->first();

        $resource = new Resource([
            'title' => $title,
            'description' => Resource::TYPE_LABELS[$type].' — '.($module->description ?? $module->name),
            'type' => $type,
            'status' => 'published',
            'visibility' => 'public',
            'filiere_id' => $module->filiere_id,
            'annee_formation_id' => $module->annee_formation_id,
            'module_id' => $module->id,
            'author_id' => $author?->id,
            'keywords' => implode(', ', array_filter([$module->code, $module->name, $module->filiere?->name, Resource::TYPE_LABELS[$type], 'OFPPT'])),
            'published_at' => now(),
            'downloads_count' => 0,
            'views_count' => 0,
        ]);
        $resource->save();

        $note = $this->attachFile($resource, $file, $sourceName, false);
        $this->created++;

        return [$this->short($sourceName), $module->code, $typeLabel, 'Création : '.$this->short($title), $note];
    }

    /**
     * @return Collection<int, SplFileInfo>
     */
    private function pdfFiles(string $dir): Collection
    {
        return collect(File::allFiles($dir))
            ->filter(fn (SplFileInfo $file) => strtolower($file->getExtension()) === 'pdf')
            ->reject(fn (SplFileInfo $file) => str_starts_with($file->getFilename(), '.') || str_starts_with($file->getFilename(), '_'))
            ->sort(fn (SplFileInfo $a, SplFileInfo $b) => strnatcasecmp($a->getFilename(), $b->getFilename()))
            ->values();
    }

    private function sourceDirectory(): string
    {
        $path = (string) ($this->option('path') ?? '');
        if ($path !== '') {
            return File::isDirectory($path) ? $path : base_path($path);
        }

        return storage_path('app/ofppt-import');
    }

    /**
     * @return array<int, string>
     */
    private function tokenize(string $value): array
    {
        return preg_split('/[^a-z0-9]+/', $this->asciiLower($value), -1, PREG_SPLIT_NO_EMPTY);
    }

    /**
     * @param  array<int, string>  $tokens
     * @return array<int, string>
     */
    private function significantTokens(array $tokens): array
    {
        $kept = [];
        foreach ($tokens as $token) {
            if (strlen($token) < 2 || ctype_digit($token)) {
                continue;
            }
            if (isset(self::TYPE_KEYWORDS[$token]) || in_array($token, self::STOPWORDS, true) || in_array($token, self::FILIERE_HINTS, true)) {
                continue;
            }
            $kept[] = $this->singular($token);
        }

        return array_values(array_unique($kept));
    }

    private function singular(string $token): string
    {
        if (strlen($token) > 4 && str_ends_with($token, 's') && ! str_ends_with($token, 'ss')) {
            return substr($token, 0, -1);
        }

        return $token;
    }

    private function asciiLower(string $value): string
    {
        return strtolower(Str::ascii($value));
    }

    private function resourceTarget(Resource $resource): string
    {
        return '#'.$resource->id.' '.$this->short($resource->title, 44);
    }

    private function short(string $value, int $limit = 42): string
    {
        return Str::limit($value, $limit, '…');
    }
}
