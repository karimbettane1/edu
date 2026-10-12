<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AnneeFormation;
use App\Models\AuditLog;
use App\Models\Comment;
use App\Models\Download;
use App\Models\Favorite;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Report;
use App\Models\Resource;
use App\Models\ResourceFile;
use App\Models\ResourceView;
use App\Models\User;
use App\Models\UserNotification;
use Database\Seeders\Support\DemoPdf;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResourceSeeder extends Seeder
{
    private const TYPE_LABELS = [
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

    private const TYPE_TITLES = [
        'cours' => ['Cours complet', 'Support de cours', 'Cours détaillé'],
        'tp' => ['Travaux pratiques', 'TP guidé', 'Atelier pratique'],
        'exercice' => ['Série d\'exercices', 'Exercices d\'application'],
        'exercice_corrige' => ['Exercices corrigés', 'Corrigé des exercices', 'Série corrigée'],
        'examen' => ['Examen de fin de module', 'Sujet d\'examen', 'Examen de passage'],
        'examen_corrige' => ['Examen corrigé', 'Corrigé type d\'examen'],
        'resume' => ['Résumé de révision', 'Fiche de synthèse', 'Résumé du module'],
        'projet' => ['Projet de module', 'Sujet de projet'],
        'tutoriel' => ['Tutoriel pas à pas', 'Guide pratique'],
        'presentation' => ['Diaporama du cours', 'Présentation du module'],
        'fiche_revision' => ['Fiche de révision', 'Mémo de révision'],
    ];

    private const TYPE_DESCRIPTIONS = [
        'cours' => 'Support de cours complet couvrant l\'ensemble des objectifs du module',
        'tp' => 'Mise en pratique guidée des notions abordées en cours',
        'exercice' => 'Exercices d\'application pour s\'entraîner progressivement',
        'exercice_corrige' => 'Exercices avec correction détaillée et commentée',
        'examen' => 'Sujet d\'examen représentatif du module pour s\'entraîner',
        'examen_corrige' => 'Sujet d\'examen accompagné d\'un corrigé type',
        'resume' => 'Synthèse des points essentiels à retenir avant l\'évaluation',
        'projet' => 'Énoncé du projet de fin de module avec consignes et livrables',
        'tutoriel' => 'Tutoriel pas à pas illustré avec exemples concrets',
        'presentation' => 'Support de présentation utilisé en séance de cours',
        'fiche_revision' => 'Fiche condensée idéale pour les révisions de dernière minute',
    ];

    /** @var array<string, array{0: int, 1: int}> */
    private const DOWNLOAD_RANGES = [
        'cours' => [80, 340],
        'tp' => [50, 260],
        'exercice' => [30, 160],
        'exercice_corrige' => [45, 230],
        'examen' => [40, 210],
        'examen_corrige' => [35, 190],
        'resume' => [55, 240],
        'projet' => [20, 120],
        'tutoriel' => [25, 140],
        'presentation' => [30, 170],
        'fiche_revision' => [45, 200],
    ];

    public function run(): void
    {
        $admin = User::where('email', 'admin@digital-academy.ma')->first();
        $contributor = User::where('email', 'contributeur@digital-academy.ma')->first();

        if (! $admin || ! $contributor) {
            $this->command?->warn('Utilisateurs de démonstration introuvables : lancez UserSeeder avant ResourceSeeder.');

            return;
        }

        // Les fichiers de démonstration sont régénérés à chaque exécution du seeder.
        Storage::disk('local')->deleteDirectory('resources');

        $filieres = Filiere::with(['anneesFormation.modules'])->orderBy('position')->get();

        foreach ($filieres as $filiere) {
            foreach ($filiere->anneesFormation->sortBy('position') as $annee) {
                foreach ($annee->modules->sortBy('position') as $module) {
                    $this->seedModuleResources($filiere, $annee, $module, $admin);
                }
            }
        }

        $this->seedContributorWorkspace($contributor);
        $this->seedInteractions();
        $this->syncCounters();
        $this->seedAuditLogs($admin);
    }

    private function seedModuleResources(Filiere $filiere, AnneeFormation $annee, Module $module, User $admin): void
    {
        $plan = ['cours', 'tp', 'exercice_corrige'];

        if ($annee->code === '1A') {
            $plan[] = 'examen';
            if ($module->position <= 4) {
                $plan[] = 'resume';
            }
            if ($module->position % 3 === 0) {
                $plan[] = 'exercice';
            }
        } else {
            $plan[] = 'presentation';
            $plan[] = $module->position % 2 === 0 ? 'fiche_revision' : 'tutoriel';
        }

        foreach ($plan as $type) {
            $daysAgo = rand(2, 120);
            $publishedAt = now()->subDays($daysAgo)->setTime(rand(8, 20), rand(0, 59));

            $this->createResource(
                filiere: $filiere,
                annee: $annee,
                module: $module,
                author: $admin,
                type: $type,
                status: 'published',
                visibility: 'public',
                publishedAt: $publishedAt,
            );
        }
    }

    private function seedContributorWorkspace(User $contributor): void
    {
        $modules = Module::query()
            ->whereHas('anneeFormation', fn ($query) => $query
                ->where('code', '2A-WFS')
                ->whereHas('filiere', fn ($sub) => $sub->where('code', 'DD')))
            ->orderBy('position')
            ->get();

        if ($modules->count() < 6) {
            return;
        }

        $filiere = Filiere::where('code', 'DD')->first();
        $annee = AnneeFormation::where('filiere_id', $filiere->id)->where('code', '2A-WFS')->first();

        // Ressources publiées par le contributeur (visibles dans son tableau de bord).
        [$m201, $m202, $m203, $m204, $m205, $m206] = $modules->take(6)->values()->all();

        $this->createResource($filiere, $annee, $m201, $contributor, 'tutoriel', 'published', 'public', now()->subDays(4));
        $this->createResource($filiere, $annee, $m202, $contributor, 'cours', 'published', 'public', now()->subDays(12));
        $this->createResource($filiere, $annee, $m203, $contributor, 'tp', 'published', 'public', now()->subDays(26));
        $this->createResource($filiere, $annee, $m206, $contributor, 'examen_corrige', 'published', 'public', now()->subDays(48));

        // Brouillons en cours de rédaction.
        $this->createResource($filiere, $annee, $m204, $contributor, 'cours', 'draft', 'public', null);
        $this->createResource($filiere, $annee, $m205, $contributor, 'fiche_revision', 'draft', 'public', null);

        // En attente de validation par l'administration.
        $this->createResource($filiere, $annee, $m202, $contributor, 'exercice_corrige', 'pending_review', 'public', null);
        $this->createResource($filiere, $annee, $m201, $contributor, 'tp', 'pending_review', 'public', null);

        // Rejetée : corrections à apporter.
        $this->createResource($filiere, $annee, $m206, $contributor, 'projet', 'rejected', 'public', null);

        // Ressource interne réservée aux étudiants connectés.
        $this->createResource($filiere, $annee, $m203, $contributor, 'presentation', 'published', 'private', now()->subDays(9));
    }

    private function createResource(
        Filiere $filiere,
        ?AnneeFormation $annee,
        ?Module $module,
        ?User $author,
        string $type,
        string $status,
        string $visibility,
        ?\DateTimeInterface $publishedAt,
    ): Resource {
        $title = $this->buildTitle($type, $module);
        $description = self::TYPE_DESCRIPTIONS[$type].' — '.($module?->description ?? '');
        $keywords = implode(', ', array_filter([
            $module?->code,
            $module?->name,
            $filiere->name,
            self::TYPE_LABELS[$type],
            $annee?->label,
            'OFPPT',
        ]));

        [$min, $max] = self::DOWNLOAD_RANGES[$type];
        $downloads = rand($min, $max);
        $views = $downloads + rand(60, 300);

        $resource = new Resource([
            'title' => $title,
            'description' => trim($description),
            'type' => $type,
            'status' => $status,
            'visibility' => $visibility,
            'filiere_id' => $filiere->id,
            'annee_formation_id' => $annee?->id,
            'module_id' => $module?->id,
            'author_id' => $author?->id,
            'keywords' => $keywords,
            'published_at' => $publishedAt,
            'downloads_count' => $status === 'published' ? $downloads : 0,
            'views_count' => $status === 'published' ? $views : 0,
        ]);

        if ($publishedAt) {
            $resource->created_at = \Illuminate\Support\Carbon::instance($publishedAt)->subDays(rand(1, 6));
            $resource->updated_at = \Illuminate\Support\Carbon::instance($publishedAt);
        }

        $resource->save();

        $this->attachDemoFile($resource, $filiere, $annee, $module, $type);

        return $resource;
    }

    private function buildTitle(string $type, ?Module $module): string
    {
        $variants = self::TYPE_TITLES[$type];
        $suffix = $variants[array_rand($variants)];

        if (! $module) {
            return $suffix;
        }

        return $suffix.' — '.$module->name.' ('.$module->code.')';
    }

    private function attachDemoFile(Resource $resource, Filiere $filiere, ?AnneeFormation $annee, ?Module $module, string $type): void
    {
        $lines = [
            'Digital Academy - Plateforme pedagogique OFPPT',
            '',
            'Filiere : '.$filiere->name,
            'Annee : '.($annee?->displayName() ?? '-'),
            'Module : '.($module ? $module->code.' - '.$module->name : '-'),
            'Type de document : '.self::TYPE_LABELS[$type],
            '',
            'Objectifs du document',
            $module?->description ?? '',
            '',
            'Contenu',
            'Chapitre 1 : Introduction et concepts cles',
            'Chapitre 2 : Mise en pratique et exemples',
            'Chapitre 3 : Exercices et approfondissement',
            '',
            'Document de demonstration genere pour la plateforme Digital Academy.',
        ];

        $pdf = DemoPdf::generate($resource->title, array_values(array_filter($lines, fn ($line) => $line !== null)));
        $path = 'resources/'.Str::uuid().'.pdf';

        Storage::disk('local')->put($path, $pdf);

        ResourceFile::create([
            'resource_id' => $resource->id,
            'disk' => 'local',
            'path' => $path,
            'original_name' => Str::slug(Str::limit($resource->title, 80, '')).'.pdf',
            'extension' => 'pdf',
            'mime_type' => 'application/pdf',
            'size' => strlen($pdf),
            'is_primary' => true,
        ]);
    }

    private function seedInteractions(): void
    {
        /** @var Collection<int, User> $students */
        $students = User::where('role', UserRole::Student)->where('is_active', true)->get();
        /** @var Collection<int, Resource> $published */
        $published = Resource::with(['module', 'filiere'])
            ->where('status', 'published')
            ->where('visibility', 'public')
            ->get();

        if ($students->isEmpty() || $published->isEmpty()) {
            return;
        }

        $salma = $students->firstWhere('email', 'etudiant@digital-academy.ma');
        $ddFirstYear = $published->filter(fn (Resource $resource) => $resource->filiere?->code === 'DD'
            && Str::startsWith($resource->module?->code ?? '', 'M1'))->values();

        // Activité récente de l'étudiante de démonstration (tableau de bord « Reprendre l'apprentissage »).
        if ($salma && $ddFirstYear->isNotEmpty()) {
            foreach ($ddFirstYear->take(8) as $index => $resource) {
                Favorite::firstOrCreate(['user_id' => $salma->id, 'resource_id' => $resource->id]);

                $viewedAt = now()->subHours(rand(1, 20))->subDays($index);
                $view = new ResourceView(['user_id' => $salma->id, 'resource_id' => $resource->id, 'viewed_at' => $viewedAt]);
                $view->created_at = $viewedAt;
                $view->updated_at = $viewedAt;
                $view->save();

                if ($index < 5) {
                    $downloadedAt = $viewedAt->copy()->subMinutes(rand(5, 90));
                    $download = new Download([
                        'user_id' => $salma->id,
                        'resource_id' => $resource->id,
                        'resource_title' => $resource->title,
                    ]);
                    $download->created_at = $downloadedAt;
                    $download->updated_at = $downloadedAt;
                    $download->save();
                }
            }
        }

        foreach ($students as $student) {
            if ($salma && $student->id === $salma->id) {
                continue;
            }

            $selection = $published->random(min($published->count(), rand(3, 9)));

            foreach ($selection as $resource) {
                $at = now()->subDays(rand(1, 40))->subMinutes(rand(0, 1400));

                $view = new ResourceView(['user_id' => $student->id, 'resource_id' => $resource->id, 'viewed_at' => $at]);
                $view->created_at = $at;
                $view->updated_at = $at;
                $view->save();

                if (rand(0, 100) < 55) {
                    $download = new Download([
                        'user_id' => $student->id,
                        'resource_id' => $resource->id,
                        'resource_title' => $resource->title,
                    ]);
                    $download->created_at = $at->copy()->addMinutes(rand(1, 30));
                    $download->updated_at = $download->created_at;
                    $download->save();
                }

                if (rand(0, 100) < 45) {
                    Favorite::firstOrCreate(['user_id' => $student->id, 'resource_id' => $resource->id]);
                }
            }
        }

        $this->seedComments($published, $students);
        $this->seedNotifications($students);
        $this->seedReports($students, $published);
    }

    /**
     * @param  Collection<int, Resource>  $published
     * @param  Collection<int, User>  $students
     */
    private function seedComments(Collection $published, Collection $students): void
    {
        $approvedBodies = [
            'Merci beaucoup, ce support est très clair et bien structuré !',
            'Le TP m\'a énormément aidé pour préparer l\'examen de fin de module.',
            'Les exemples sont concrets, j\'ai enfin compris ce chapitre.',
            'Très bon résumé, parfait pour les révisions de dernière minute.',
            'La correction détaillée aide beaucoup, merci au contributeur.',
            'Je recommande ce document à tous les étudiants de la filière.',
            'Bonne qualité globale, les explications étape par étape sont utiles.',
            'Grâce à cette fiche, j\'ai gagné beaucoup de temps dans mes révisions.',
            'Le contenu correspond parfaitement au programme du module.',
            'Bravo pour la clarté des schémas et des exemples.',
        ];

        $pendingBodies = [
            'Serait-il possible d\'ajouter la correction de l\'exercice 4 ?',
            'Pouvez-vous publier la version mise à jour pour cette année ?',
        ];

        // Les ressources les plus téléchargées reçoivent le plus de commentaires.
        $popular = $published->sortByDesc('downloads_count')->take(14)->values();
        $pendingIndex = 0;

        foreach ($popular as $resource) {
            $commentCount = rand(2, 4);

            for ($i = 0; $i < $commentCount; $i++) {
                $student = $students->random();
                $at = now()->subDays(rand(1, 55))->setTime(rand(9, 22), rand(0, 59));

                $comment = new Comment([
                    'user_id' => $student->id,
                    'resource_id' => $resource->id,
                    'body' => $approvedBodies[array_rand($approvedBodies)],
                    'is_approved' => true,
                ]);
                $comment->created_at = $at;
                $comment->updated_at = $at;
                $comment->save();
            }

            if ($pendingIndex < count($pendingBodies) && rand(0, 1) === 1) {
                $student = $students->random();
                $at = now()->subHours(rand(3, 40));

                $comment = new Comment([
                    'user_id' => $student->id,
                    'resource_id' => $resource->id,
                    'body' => $pendingBodies[$pendingIndex++],
                    'is_approved' => false,
                ]);
                $comment->created_at = $at;
                $comment->updated_at = $at;
                $comment->save();
            }
        }

        // Commentaires personnels de l'étudiante de démonstration.
        $salma = $students->firstWhere('email', 'etudiant@digital-academy.ma');
        $own = $published->filter(fn (Resource $resource) => $resource->filiere?->code === 'DD')->take(3)->values();

        if ($salma && $own->isNotEmpty()) {
            foreach ($own as $index => $resource) {
                $at = now()->subDays(rand(2, 15));

                $comment = new Comment([
                    'user_id' => $salma->id,
                    'resource_id' => $resource->id,
                    'body' => $index === 2
                        ? 'Merci pour ce document, il rend les révisions beaucoup plus simples !'
                        : $approvedBodies[array_rand($approvedBodies)],
                    'is_approved' => true,
                ]);
                $comment->created_at = $at;
                $comment->updated_at = $at;
                $comment->save();
            }
        }
    }

    /**
     * @param  Collection<int, User>  $students
     */
    private function seedNotifications(Collection $students): void
    {
        $salma = $students->firstWhere('email', 'etudiant@digital-academy.ma');
        $recentCourse = Resource::published()->where('visibility', 'public')
            ->whereHas('filiere', fn ($query) => $query->where('code', 'DD'))
            ->latest('published_at')
            ->first();

        if ($salma) {
            $commentUrl = $own->isNotEmpty() ? '/ressources/'.$own->first()->id : '/ressources';
            $notifications = [
                ['welcome', 'Bienvenue sur Digital Academy', 'Explorez les ressources de votre filière et enregistrez vos favoris pour les retrouver facilement.', '/etudiant', now()->subDays(40), now()->subDays(40)],
                ['resource_published', 'Nouvelle ressource dans votre filière', $recentCourse
                    ? 'La ressource « '.$recentCourse->title.' » vient d\'être publiée.'
                    : 'De nouvelles ressources viennent d\'être publiées dans votre filière.', '/ressources', now()->subDays(2), null],
                ['comment_approved', 'Votre commentaire a été approuvé', 'Votre commentaire sur un document est désormais visible par la communauté.', $commentUrl, now()->subHours(8), null],
                ['favorite_update', 'Mise à jour d\'une de vos ressources favorites', 'Une ressource que vous avez enregistrée a été mise à jour par son auteur.', '/etudiant/favoris', now()->subDay(), null],
                ['quiz_reminder', 'Quiz disponible', 'Un nouveau quiz d\'auto-évaluation est disponible dans votre module.', '/quiz', now()->subDays(3), now()->subDays(3)->addHours(6)],
            ];

            foreach ($notifications as [$type, $title, $message, $url, $createdAt, $readAt]) {
                $notification = new UserNotification([
                    'user_id' => $salma->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => $message,
                    'url' => $url,
                    'read_at' => $readAt,
                ]);
                $notification->created_at = $createdAt;
                $notification->updated_at = $createdAt;
                $notification->save();
            }
        }

        foreach ($students as $student) {
            if ($salma && $student->id === $salma->id) {
                continue;
            }

            if (rand(0, 100) > 60) {
                continue;
            }

            $at = now()->subDays(rand(2, 35));

            $notification = new UserNotification([
                'user_id' => $student->id,
                'type' => 'resource_published',
                'title' => 'Nouvelles ressources disponibles',
                'message' => 'Des ressources ont été ajoutées dans votre filière.',
                'url' => '/ressources',
                'read_at' => rand(0, 1) ? $at->copy()->addDay() : null,
            ]);
            $notification->created_at = $at;
            $notification->updated_at = $at;
            $notification->save();
        }
    }

    /**
     * @param  Collection<int, User>  $students
     * @param  Collection<int, Resource>  $published
     */
    private function seedReports(Collection $students, Collection $published): void
    {
        $admin = User::where('email', 'admin@digital-academy.ma')->first();
        $salma = $students->firstWhere('email', 'etudiant@digital-academy.ma');
        $reporter = $students->skip(1)->first() ?? $students->first();

        $target = $published->firstWhere('filiere.code', 'ID') ?? $published->first();

        if ($salma && $target) {
            $report = new Report([
                'user_id' => $salma->id,
                'resource_id' => $target->id,
                'reason' => 'Contenu incorrect',
                'message' => 'Le document ne correspond pas exactement au contenu du module annoncé.',
                'status' => 'pending',
            ]);
            $report->created_at = now()->subDays(2);
            $report->updated_at = now()->subDays(2);
            $report->save();
        }

        if ($reporter && $admin) {
            $resolvedTarget = $published->last();

            $report = new Report([
                'user_id' => $reporter->id,
                'resource_id' => $resolvedTarget->id,
                'reason' => 'Lien de téléchargement invalide',
                'message' => 'Le téléchargement échouait, merci de vérifier le fichier.',
                'status' => 'resolved',
                'resolved_by' => $admin->id,
                'resolved_at' => now()->subDays(10),
            ]);
            $report->created_at = now()->subDays(12);
            $report->updated_at = now()->subDays(10);
            $report->save();
        }
    }

    private function syncCounters(): void
    {
        Resource::query()->chunkById(100, function (Collection $resources) {
            foreach ($resources as $resource) {
                $realDownloads = $resource->downloads()->count();
                $realViews = $resource->views()->count();

                if ($resource->downloads_count < $realDownloads || $resource->views_count < $realViews) {
                    $resource->forceFill([
                        'downloads_count' => max($resource->downloads_count, $realDownloads),
                        'views_count' => max($resource->views_count, $realViews),
                    ])->save();
                }
            }
        });
    }

    private function seedAuditLogs(User $admin): void
    {
        $entries = [
            ['user.created', 'Création du compte étudiant Salma Bennani', 'User', 6, 58],
            ['settings.updated', 'Mise à jour des paramètres généraux de la plateforme', 'Setting', null, 45],
            ['resource.published', 'Publication d\'une ressource du module M104', 'Resource', 19, 41],
            ['user.role_updated', 'Attribution du rôle contributeur à Youssef El Amrani', 'User', 5, 38],
            ['comment.approved', 'Approbation d\'un commentaire signalé', 'Comment', 12, 30],
            ['resource.rejected', 'Rejet d\'une ressource non conforme au programme', 'Resource', 88, 26],
            ['resource.published', 'Publication d\'un examen corrigé du module M107', 'Resource', 55, 19],
            ['user.deactivated', 'Désactivation d\'un compte étudiant inactif', 'User', 9, 14],
            ['settings.updated', 'Activation de la validation des contributions', 'Setting', null, 9],
            ['resource.deleted', 'Suppression d\'un doublon signalé par un étudiant', 'Resource', 74, 5],
            ['report.resolved', 'Traitement d\'un signalement de lien invalide', 'Report', 2, 3],
            ['comment.rejected', 'Rejet d\'un commentaire hors sujet', 'Comment', 31, 1],
        ];

        foreach ($entries as [$action, $description, $targetType, $targetId, $daysAgo]) {
            $log = new AuditLog([
                'user_id' => $admin->id,
                'action' => $action,
                'description' => $description,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'ip_address' => '127.0.0.1',
            ]);
            $log->created_at = now()->subDays($daysAgo)->setTime(rand(8, 19), rand(0, 59));
            $log->save();
        }
    }
}
