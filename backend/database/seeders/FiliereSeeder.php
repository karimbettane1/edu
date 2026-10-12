<?php

namespace Database\Seeders;

use App\Models\AnneeFormation;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Niveau;
use Illuminate\Database\Seeder;

class FiliereSeeder extends Seeder
{
    /**
     * Liste indicative des modules, modifiable par l'administration.
     */
    public const DD_MODULES = [
        '1A' => [
            ['M101', 'Se situer au regard du métier et de la démarche de formation', 'Découvrir le métier de développeur, ses contextes d\'exercice et la démarche de formation.'],
            ['M102', 'Acquérir les bases de l\'algorithmique', 'Logique algorithmique, types de données, structures de contrôle, tableaux et fonctions.'],
            ['M103', 'Programmer en orienté objet', 'Classes, objets, héritage, polymorphisme et bonnes pratiques de conception.'],
            ['M104', 'Développer des sites web statiques', 'HTML5, CSS3, mise en page responsive et bonnes pratiques d\'intégration.'],
            ['M105', 'Programmer en JavaScript', 'Manipulation du DOM, événements, fonctions, tableaux et programmation asynchrone.'],
            ['M106', 'Manipuler des bases de données', 'Modélisation, SQL, MySQL, contraintes et requêtes de jointure.'],
            ['M107', 'Développer des sites web dynamiques', 'PHP côté serveur, sessions, formulaires, connexion aux bases de données.'],
            ['M108', 'S\'initier à la sécurité des systèmes d\'information', 'Principes de sécurité, mots de passe, injections SQL, failles XSS et bonnes pratiques.'],
        ],
        '2A-WFS' => [
            ['M201', 'Développer une application web avec React.js', 'Composants, état, hooks, routage, consommation d\'API REST et bonnes pratiques front-end.'],
            ['M202', 'Développer une API REST avec Laravel', 'Routage, contrôleurs, Eloquent, validation, authentification et sécurisation d\'une API.'],
            ['M203', 'Gérer une base de données NoSQL', 'Modélisation documentaire avec MongoDB, collections, requêtes et agrégations.'],
            ['M204', 'Utiliser Git et GitHub pour collaborer', 'Branches, pull requests, revues de code et travail collaboratif sur un dépôt partagé.'],
            ['M205', 'Adopter les méthodes agiles', 'Scrum, sprints, user stories, backlog et outils de suivi de projet.'],
            ['M206', 'Réaliser et présenter un projet web full stack', 'Conception, développement, déploiement et soutenance d\'un projet complet.'],
        ],
        '2A-AM' => [
            ['M201', 'Développer une application mobile cross-platform', 'Interfaces mobiles natives, navigation, composants et cycle de vie d\'une application.'],
            ['M202', 'Consommer une API REST depuis une application mobile', 'Appels réseau, gestion du cache, authentification et synchronisation des données.'],
            ['M203', 'Gérer le stockage local et les données mobiles', 'Stockage embarqué, préférences, SQLite mobile et stratégies de synchronisation.'],
            ['M204', 'Publier et maintenir une application mobile', 'Tests, optimisation, signature, publication sur les stores et mise à jour continue.'],
            ['M205', 'Réaliser un projet d\'application mobile', 'Conception et réalisation d\'une application mobile complète connectée à un back-end.'],
        ],
    ];

    public const ID_MODULES = [
        '1A' => [
            ['M101', 'Se situer au regard du métier et de la démarche de formation', 'Découvrir le métier d\'administrateur d\'infrastructure et la démarche de formation.'],
            ['M102', 'Comprendre les enjeux d\'un système d\'information', 'Rôle du SI dans l\'entreprise, acteurs, processus et gouvernance informatique.'],
            ['M103', 'Concevoir un réseau informatique', 'Topologies, adressage IP, équipements réseaux et plans d\'adressage.'],
            ['M104', 'Fonctionnement du système d\'exploitation', 'Windows et Linux : installation, gestion des utilisateurs, processus et fichiers.'],
            ['M105', 'Gérer une infrastructure virtualisée', 'Hyperviseurs, machines virtuelles, ressources partagées et sauvegarde.'],
            ['M106', 'Automatiser les tâches d\'administration', 'Scripts shell et PowerShell, planification et automatisation des tâches répétitives.'],
            ['M107', 'Sécuriser un système d\'information', 'Politiques de sécurité, pare-feu, antivirus, droits d\'accès et sauvegardes.'],
            ['M108', 'Effectuer une veille technologique', 'Recherche et analyse des évolutions du secteur : cloud, cybersécurité, réseaux.'],
        ],
        '2A-CLOUD' => [
            ['M201', 'Comprendre les modèles du cloud computing', 'IaaS, PaaS, SaaS, cloud public, privé et hybride.'],
            ['M202', 'Déployer des services dans le cloud', 'Provisionnement de machines, stockage objet et réseaux virtuels.'],
            ['M203', 'Conteneuriser des applications', 'Docker, images, registres et orchestration avec Kubernetes.'],
            ['M204', 'Automatiser l\'infrastructure (IaC)', 'Infrastructure as Code, Terraform et gestion de configurations.'],
            ['M205', 'Superviser une infrastructure cloud', 'Monitoring, alertes, coûts et haute disponibilité dans le cloud.'],
        ],
        '2A-CYBER' => [
            ['M201', 'Sécuriser les réseaux', 'Segmentation, VPN, pare-feu avancés, détection d\'intrusion et sécurité sans fil.'],
            ['M202', 'Réaliser des tests d\'intrusion et des audits', 'Méthodologie d\'audit, analyse de vulnérabilités et rapport de sécurité.'],
            ['M203', 'Gérer les incidents de sécurité', 'SIEM, SOC, réponse aux incidents et gestion de crise.'],
            ['M204', 'Appliquer la cryptographie', 'Chiffrement symétrique et asymétrique, PKI, certificats et signatures.'],
            ['M205', 'Protéger les systèmes et les données', 'Durcissement des systèmes, gestion des identités et protection des données personnelles.'],
        ],
        '2A-SR' => [
            ['M201', 'Administrer des serveurs avancés', 'Windows Server, Linux avancé, rôles serveurs et haute disponibilité.'],
            ['M202', 'Déployer des services réseau avancés', 'DNS, DHCP, Active Directory, partage de fichiers et messagerie.'],
            ['M203', 'Maîtriser le routage et la commutation', 'VLAN, routage dynamique, qualité de service et interconnexion de sites.'],
            ['M204', 'Assurer la sauvegarde et la reprise d\'activité', 'Stratégies de sauvegarde, PRA, réplication et continuité de service.'],
            ['M205', 'Superviser et maintenir l\'infrastructure', 'Outils de supervision, inventaire, maintenance préventive et support.'],
        ],
    ];

    public function run(): void
    {
        $niveau = Niveau::firstOrCreate(
            ['code' => 'TS'],
            [
                'name' => 'Technicien Spécialisé',
                'description' => 'Niveau de formation des techniciens spécialisés (2 ans)',
                'position' => 1,
            ],
        );

        $dd = Filiere::firstOrCreate(
            ['code' => 'DD'],
            [
                'name' => 'Développement Digital',
                'slug' => 'developpement-digital',
                'description' => 'Développe des applications web et mobiles modernes : front-end, back-end, bases de données, frameworks et méthodes agiles.',
                'color' => '#2563EB',
                'icon' => 'code',
                'position' => 1,
            ],
        );

        $id = Filiere::firstOrCreate(
            ['code' => 'ID'],
            [
                'name' => 'Infrastructure Digitale',
                'slug' => 'infrastructure-digitale',
                'description' => 'Conçois, administre et sécurise des réseaux, serveurs, systèmes virtualisés et environnements cloud.',
                'color' => '#7C3AED',
                'icon' => 'network',
                'position' => 2,
            ],
        );

        $this->seedFiliere($dd, $niveau, [
            ['code' => '1A', 'label' => '1ère année', 'option_name' => null, 'position' => 1, 'modules' => self::DD_MODULES['1A']],
            ['code' => '2A-WFS', 'label' => '2ème année', 'option_name' => 'Option Web Full Stack', 'position' => 2, 'modules' => self::DD_MODULES['2A-WFS']],
            ['code' => '2A-AM', 'label' => '2ème année', 'option_name' => 'Option Applications Mobiles', 'position' => 3, 'modules' => self::DD_MODULES['2A-AM']],
        ]);

        $this->seedFiliere($id, $niveau, [
            ['code' => '1A', 'label' => '1ère année', 'option_name' => null, 'position' => 1, 'modules' => self::ID_MODULES['1A']],
            ['code' => '2A-CLOUD', 'label' => '2ème année', 'option_name' => 'Option Cloud Computing', 'position' => 2, 'modules' => self::ID_MODULES['2A-CLOUD']],
            ['code' => '2A-CYBER', 'label' => '2ème année', 'option_name' => 'Option Cybersécurité', 'position' => 3, 'modules' => self::ID_MODULES['2A-CYBER']],
            ['code' => '2A-SR', 'label' => '2ème année', 'option_name' => 'Option Systèmes et Réseaux', 'position' => 4, 'modules' => self::ID_MODULES['2A-SR']],
        ]);
    }

    /**
     * @param  array<int, array{code: string, label: string, option_name: ?string, position: int, modules: array<int, array<int, string>>}>  $years
     */
    private function seedFiliere(Filiere $filiere, Niveau $niveau, array $years): void
    {
        foreach ($years as $year) {
            /** @var AnneeFormation $annee */
            $annee = $filiere->anneesFormation()->firstOrCreate(
                ['code' => $year['code']],
                [
                    'niveau_id' => $niveau->id,
                    'label' => $year['label'],
                    'option_name' => $year['option_name'],
                    'position' => $year['position'],
                ],
            );

            foreach ($year['modules'] as $position => [$code, $name, $description]) {
                Module::firstOrCreate(
                    [
                        'filiere_id' => $filiere->id,
                        'annee_formation_id' => $annee->id,
                        'code' => $code,
                    ],
                    [
                        'name' => $name,
                        'description' => $description,
                        'position' => $position + 1,
                    ],
                );
            }
        }
    }
}
