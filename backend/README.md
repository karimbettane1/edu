# Digital Academy — Backend (API Laravel)

API REST de la plateforme Digital Academy : ressources pédagogiques, quiz, projets, notifications et administration pour les filières **Développement Digital** et **Infrastructure Digitale**.

Laravel 13 · Sanctum (tokens Bearer) · SQLite par défaut (compatible MySQL) · PHP 8.2+

## Démarrage rapide (Windows)

```bash
composer install
copy .env.example .env      # macOS / Linux : cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve           # http://127.0.0.1:8000
```

> Outils portables fournis dans le workspace : exécuter `source ../.tools/env.sh` avant les commandes si `php` ou `composer` ne sont pas globalement installés.

## Tests

```bash
php artisan test
```

30 tests fonctionnels couvrant : inscription / connexion (hachage, validation, limitation de tentatives), cloisonnement des rôles, visibilité des ressources, notation des quiz côté serveur, autorisations de propriété (ressources et projets).

## Organisation

```
app/
├── Http/Controllers/Api/   # Contrôleurs (public, étudiant, contributeur, admin)
├── Http/Requests/          # Validation serveur (FormRequests)
├── Http/Resources/         # Sérialisation JSON
├── Models/                 # Modèles Eloquent (attributs #[Fillable], #[Hidden])
├── Policies/               # Autorisations par rôle et propriétaire
└── Services/               # Stockage des fichiers, etc.
database/
├── migrations/             # Schéma complet (25 migrations)
└── seeders/                # Données de démonstration réalistes
routes/api.php              # Toutes les routes, groupées par espace
```

## Documentation

- Installation complète, comptes de démonstration et dépannage : [README à la racine du projet](../README.md)
- Référence des endpoints : [docs/API.md](../docs/API.md)
