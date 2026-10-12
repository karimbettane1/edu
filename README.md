# Digital Academy

Plateforme de ressources pédagogiques inspirée d'[ofppt.info](https://ofppt.info/), dédiée aux deux filières **Développement Digital (DD)** et **Infrastructure Digitale (ID)**, pour la 1ère et la 2ème année.

- **Frontend** : React 19 + Vite 8 + Tailwind CSS v4 + React Router 7 + i18next (français / arabe RTL / anglais) + SweetAlert2 + Recharts + lucide-react
- **Backend** : API REST Laravel 13 + Sanctum (tokens Bearer)
- **Base de données** : SQLite par défaut (zéro installation), compatible MySQL
- **Plateforme** : Windows (testé), macOS, Linux

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Installation sous Windows](#installation-sous-windows)
- [Lancement](#lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Données de démonstration](#données-de-démonstration)
- [Structure du projet](#structure-du-projet)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [API REST](#api-rest)
- [Multilingue](#multilingue)
- [Dépannage](#dépannage)

## Fonctionnalités

### Espace public
- Accueil (statistiques réelles calculées côté serveur, filières, ressources populaires)
- Catalogue des filières avec leurs années et modules
- Catalogue des ressources : recherche (titre, description, mots-clés), filtres (filière, année, module, type), tri (récents / populaires / titre), pagination
- Fiche ressource : aperçu PDF en ligne, téléchargement, commentaires modérés, favoris, signalement
- Quiz : liste, jeu (chrono, progression), correction détaillée avec explications
- Projets étudiants : publication par les étudiants connectés, liens démo / dépôt
- Pages À propos, Contact, 403 / 404 / 500

### Espace étudiant
- Tableau de bord (reprise d'apprentissage, derniers quiz, notifications)
- Recherche et filtres appliqués aux favoris et aux téléchargements
- Historique des téléchargements et des consultations récentes
- Notifications in-app (cloche dans la barre de navigation + page dédiée)
- Profil : informations personnelles, changement de mot de passe, préférences de langue

### Espace contributeur
- Tableau de bord et statistiques personnelles
- Soumission de ressources avec upload de fichier (brouillon, soumission pour validation)
- Suivi du statut : brouillon, en attente de validation, publiée, rejetée
- Modification / suppression de ses propres ressources

### Espace administrateur
- Tableau de bord avec graphiques (Recharts) : ressources par filière, téléchargements, utilisateurs
- CRUD complet des ressources, filières, années de formation, modules et utilisateurs
- Gestion pédagogique : activation/désactivation, réorganisation des modules
- Modération des commentaires (approuver / masquer / supprimer) et des signalements
- Paramètres de la plateforme (téléchargements publics, inscription, commentaires, maintenance…)
- Journal d'audit (connexions, créations, modifications, suppressions, téléchargements)

## Installation sous Windows

### Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| PHP | 8.2 (8.3+ recommandé) | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 20 (22+ recommandé) | `node -v` |
| NPM | fourni avec Node | `npm -v` |

> **Environnement portable** : ce projet peut fonctionner sans installation globale. Des outils portables sont fournis dans `.tools/` (racine du workspace). Dans ce cas, exécuter d'abord :
>
> ```bash
> source .tools/env.sh
> ```

### Backend (Laravel)

```bash
cd digital-academy/backend
composer install
cp .env.example .env        # sous Windows : copy .env.example .env
php artisan key:generate
php artisan migrate --seed
```

La base SQLite `database/database.sqlite` est créée automatiquement par la migration. Pour utiliser MySQL à la place, modifier `DB_CONNECTION` dans `.env` (un exemple commenté est fourni dans `.env.example`).

### Frontend (React + Vite)

```bash
cd digital-academy/frontend
npm install
```

Aucune variable d'environnement n'est requise : le frontend appelle `/api`, redirigé vers le backend par le proxy Vite (`vite.config.js`). Aucune clé secrète n'est exposée côté client.

## Lancement

Ouvrir **deux terminaux** :

```bash
# Terminal 1 — backend
cd digital-academy/backend
php artisan serve            # http://127.0.0.1:8000

# Terminal 2 — frontend
cd digital-academy/frontend
npm run dev                  # http://localhost:5173
```

Ouvrir ensuite <http://localhost:5173>.

| Service | URL |
|---|---|
| Application | http://localhost:5173 |
| API REST | http://127.0.0.1:8000/api |

> Les deux serveurs doivent tourner en même temps : le frontend consomme l'API en direct (aucune donnée simulée).

## Comptes de démonstration

Mot de passe commun : `password`

| Rôle | E-mail | Accès |
|---|---|---|
| Administrateur | admin@digital-academy.ma | `/admin` |
| Contributeur | contributeur@digital-academy.ma | `/contributeur` |
| Étudiant | etudiant@digital-academy.ma | `/etudiant` |

## Données de démonstration

`php artisan migrate --seed` génère des données réalistes et cohérentes :

- 2 filières (DD, ID), 7 années de formation, 42 modules, 23 utilisateurs
- 216 ressources pédagogiques (cours, TP, examens, résumés…) avec fichiers téléchargeables
- 3 quiz (22 questions), 8 projets étudiants, commentaires modérés, signalements

## Importer vos propres PDF (usage local)

La plateforme peut remplacer les fichiers de démonstration par **vos propres PDF** (support de cours que vous détenez, usage personnel) :

1. Déposez vos fichiers dans `backend/storage/app/ofppt-import/` — le nom doit contenir le **type** (`cours`, `tp`, `exercice`, `examen`, `controle`, `resume`…) et le **nom du module** (ex. `Cours - Acquérir les bases de l'algorithmique.pdf`). Pour un module commun DD/ID, préfixez par `DD` ou `ID`.
2. Simulez puis appliquez :

```bash
cd digital-academy/backend
php artisan academy:import-pdfs --dry-run            # aperçu de l'association fichier → ressource
php artisan academy:import-pdfs                      # applique (remplace les fichiers de démo)
php artisan academy:import-pdfs --create             # crée aussi des ressources pour les PDF sans équivalent
```

La commande associe chaque PDF au bon module et type de ressource, met à jour le fichier téléchargeable, journalise chaque import dans l'audit et **ne supprime un fichier de démo que s'il est identifié comme tel**. Les fichiers importés restent locaux : `storage/` est exclu du git, ils ne sont jamais publiés. Pour revenir aux fichiers de démonstration : `php artisan migrate:fresh --seed`.

## Structure du projet

```
digital-academy/
├── backend/                    # API REST Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Auth, ressources, quiz, projets, espaces…
│   │   ├── Http/Requests/          # Validation serveur (FormRequests)
│   │   ├── Http/Resources/         # Sérialisation JSON (Resources)
│   │   ├── Models/                 # Modèles Eloquent
│   │   ├── Policies/               # Autorisations par rôle et propriétaire
│   │   └── Services/               # Stockage des fichiers, etc.
│   ├── database/migrations/        # Schéma complet
│   ├── database/seeders/           # Données de démonstration
│   ├── routes/api.php              # Toutes les routes de l'API
│   └── tests/                      # Tests fonctionnels (PHPUnit)
├── frontend/                   # SPA React
│   ├── src/
│   │   ├── pages/                  # Public, auth, étudiant, contributeur, admin
│   │   ├── components/             # Design system (Button, Card, Modal…)
│   │   ├── contexts/               # Auth, thème, langue
│   │   ├── services/               # Appels API (axios)
│   │   ├── i18n/locales/           # fr.json, ar.json, en.json
│   │   └── routes/AppRoutes.jsx    # Routage + chargement différé (lazy)
│   └── public/demo/                # Visuels de démonstration
└── docs/API.md                 # Référence de l'API REST
```

## Tests

```bash
cd digital-academy/backend
php artisan test             # 30 tests fonctionnels (auth, rôles, visibilité, quiz, projets)
```

Les tests couvrent les parcours sensibles : inscription (validation, mots de passe hachés), connexion (limitation de tentatives, comptes désactivés), cloisonnement des rôles (étudiant / contributeur / administrateur), visibilité des ressources, notation des quiz côté serveur, autorisations de suppression des projets.

```bash
cd digital-academy/frontend
npm run build                # build de production
npm run lint                 # analyse statique (oxlint)
```

## Sécurité

- Mots de passe **hachés** (bcrypt) — jamais stockés en clair
- Authentification par **tokens Sanctum** ; aucune clé secrète côté frontend
- **Validation serveur** systématique (FormRequests) : types, tailles, formats
- Upload contrôlé : extensions et tailles autorisées, stockage hors racine web
- **Limitation de débit** : connexion (5 tentatives / minute), inscription, commentaires, signalements, téléchargements
- Téléchargements et prévisualisations **contrôlés** par la visibilité de la ressource et les paramètres de la plateforme
- **Autorisations par opération** (Policies) : un contributeur ne gère que ses ressources, un étudiant ne supprime que ses projets
- Protection **SQLi** (requêtes Eloquent bindées) et **XSS** (React échappe le contenu, échappements côté API)
- **Journalisation** des actions sensibles (connexions, échecs, CRUD, téléchargements) consultable dans `/admin/journal`

## API REST

L'API est préfixée par `/api`. Authentification par en-tête `Authorization: Bearer <token>`.
Documentation complète : **[docs/API.md](docs/API.md)**.

| Domaine | Exemple de routes |
|---|---|
| Auth | `POST /register`, `POST /login`, `POST /logout`, `GET /me` |
| Catalogue | `GET /filieres`, `GET /modules`, `GET /stats` |
| Ressources | `GET /resources`, `GET /resources/{id}`, `GET /resources/{id}/download` |
| Quiz | `GET /quizzes`, `POST /quizzes/{id}/attempts` |
| Projets | `GET /projects`, `POST /projects`, `DELETE /projects/{id}` |
| Étudiant | `GET /me/dashboard`, `GET /favorites`, `GET /me/notifications` |
| Contributeur | `GET /contributor/stats`, `POST /contributor/resources` |
| Admin | `GET /admin/dashboard`, `/admin/resources`, `/admin/users`, `/admin/audit-logs` |

## Multilingue

- **Français** (par défaut), **Arabe** (mise en page RTL automatique), **Anglais**
- Sélecteur de langue dans la barre de navigation ; préférence enregistrée sur le profil
- Parité complète des trois fichiers de traduction (`fr.json`, `ar.json`, `en.json`)

## Dépannage

| Problème | Solution |
|---|---|
| `php` / `node` / `composer` introuvables | `source .tools/env.sh` (outils portables) ou ajouter les binaires au `PATH` |
| Erreur SQLite « database does not exist » | `cd backend && php artisan migrate --seed` (crée le fichier) |
| Page blanche, erreurs API 500 | Vérifier que `php artisan serve` tourne et que `.env` contient `APP_KEY` |
| CORS / API injoignable depuis Vite | Les deux serveurs doivent tourner ; le proxy `vite.config.js` pointe vers `127.0.0.1:8000` |
| Port déjà utilisé | `php artisan serve --port=8001` (puis adapter le proxy) ou `npm run dev -- --port 5174` |
| Réinitialiser la base de démonstration | `php artisan migrate:fresh --seed` |

---

© 2026 Digital Academy — Développement Digital & Infrastructure Digitale.
