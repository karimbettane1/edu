<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AnneeFormation;
use App\Models\Filiere;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            [
                'filiere' => 'DD',
                'annee' => '2A-WFS',
                'title' => 'Plateforme de gestion des stages',
                'description' => 'Application web permettant aux étudiants de déposer leurs demandes de stage et aux encadrants de suivre les conventions. Développée avec React pour l\'interface, une API REST Laravel et une base MySQL.',
                'technologies' => ['React.js', 'Laravel', 'MySQL', 'Tailwind CSS'],
                'screenshot' => '/demo/project-1.svg',
                'days_ago' => 6,
            ],
            [
                'filiere' => 'DD',
                'annee' => '2A-AM',
                'title' => 'Application mobile de covoiturage',
                'description' => 'Application mobile mettant en relation conducteurs et passagers pour les trajets quotidiens. Authentification, publication de trajets et messagerie connectées à une API REST.',
                'technologies' => ['React Native', 'API REST', 'SQLite'],
                'screenshot' => '/demo/project-2.svg',
                'days_ago' => 12,
            ],
            [
                'filiere' => 'DD',
                'annee' => '2A-WFS',
                'title' => 'Portail e-learning pour les modules',
                'description' => 'Portail de partage de supports de cours entre étudiants avec recherche instantanée, favoris et suivi de téléchargement. Projet full stack déployé en fin de 2ème année.',
                'technologies' => ['React.js', 'Laravel', 'MySQL', 'Chart.js'],
                'screenshot' => '/demo/project-3.svg',
                'days_ago' => 21,
            ],
            [
                'filiere' => 'DD',
                'annee' => '2A-AM',
                'title' => 'Carnet mobile de suivi de formation',
                'description' => 'Application mobile permettant aux stagiaires de suivre leur progression par module et de préparer leurs évaluations hors connexion, avec synchronisation.',
                'technologies' => ['React Native', 'API REST', 'SQLite'],
                'screenshot' => '/demo/project-4.svg',
                'days_ago' => 33,
            ],
            [
                'filiere' => 'ID',
                'annee' => '2A-SR',
                'title' => 'Refonte du réseau d\'une PME',
                'description' => 'Conception et déploiement d\'une infrastructure réseau complète : segmentation en VLAN, pare-feu pfSense, serveur de fichiers et virtualisation avec Proxmox.',
                'technologies' => ['Proxmox', 'pfSense', 'VLAN', 'Windows Server'],
                'screenshot' => '/demo/project-5.svg',
                'days_ago' => 9,
            ],
            [
                'filiere' => 'ID',
                'annee' => '2A-SR',
                'title' => 'Supervision d\'un parc informatique',
                'description' => 'Mise en place d\'une solution de supervision centralisée des serveurs et postes du parc : remontée d\'alertes, inventaire et tableau de bord temps réel.',
                'technologies' => ['Zabbix', 'SNMP', 'Linux'],
                'screenshot' => '/demo/project-6.svg',
                'days_ago' => 18,
            ],
            [
                'filiere' => 'ID',
                'annee' => '2A-CLOUD',
                'title' => 'Application conteneurisée dans le cloud',
                'description' => 'Conteneurisation d\'une application web avec Docker puis déploiement automatisé sur un cluster Kubernetes, incluant la supervision et la scalabilité.',
                'technologies' => ['Docker', 'Kubernetes', 'GitLab CI'],
                'screenshot' => '/demo/project-7.svg',
                'days_ago' => 27,
            ],
            [
                'filiere' => 'ID',
                'annee' => '2A-CYBER',
                'title' => 'Audit de sécurité d\'un réseau local',
                'description' => 'Audit complet d\'un réseau de laboratoire : cartographie, analyse des vulnérabilités, tests d\'intrusion contrôlés et rapport de recommandations.',
                'technologies' => ['Kali Linux', 'Nmap', 'Wireshark'],
                'screenshot' => '/demo/project-8.svg',
                'days_ago' => 15,
            ],
        ];

        foreach ($projects as $data) {
            $filiere = Filiere::where('code', $data['filiere'])->first();

            if (! $filiere) {
                continue;
            }

            $annee = AnneeFormation::where('filiere_id', $filiere->id)->where('code', $data['annee'])->first();
            $owner = $this->findOwner($filiere, $annee);

            if (! $owner) {
                continue;
            }

            $publishedAt = now()->subDays($data['days_ago'])->setTime(rand(9, 21), rand(0, 59));

            $project = new Project([
                'user_id' => $owner->id,
                'filiere_id' => $filiere->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'technologies' => $data['technologies'],
                'screenshots' => [$data['screenshot']],
                'status' => 'published',
                'published_at' => $publishedAt,
            ]);
            $project->created_at = $publishedAt->copy()->subDays(rand(2, 10));
            $project->updated_at = $publishedAt;
            $project->save();
        }
    }

    private function findOwner(Filiere $filiere, ?AnneeFormation $annee): ?User
    {
        $query = User::where('role', UserRole::Student)
            ->where('filiere_id', $filiere->id)
            ->where('is_active', true);

        if ($annee) {
            $candidate = (clone $query)->where('annee_formation_id', $annee->id)->inRandomOrder()->first();

            if ($candidate) {
                return $candidate;
            }
        }

        return $query->inRandomOrder()->first();
    }
}
