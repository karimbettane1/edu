# Digital Academy — Frontend (React + Vite)

Interface de la plateforme Digital Academy : catalogue de ressources, quiz, projets étudiants, espaces étudiant / contributeur / administrateur.

React 19 · Vite 8 · Tailwind CSS v4 · React Router 7 · i18next (FR / AR RTL / EN) · SweetAlert2 · Recharts · lucide-react

## Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:5173
```

Le backend doit tourner en parallèle (`php artisan serve`) : le proxy Vite redirige `/api` vers `http://127.0.0.1:8000` (voir `vite.config.js`). Aucune variable d'environnement ni clé secrète n'est nécessaire.

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (HMR + proxy API) |
| `npm run build` | Build de production (`dist/`) — routes en chargement différé |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Analyse statique (oxlint) |

## Organisation

```
src/
├── pages/
│   ├── public/        # Accueil, filières, ressources, quiz, projets, contact…
│   ├── auth/          # Connexion, inscription
│   ├── student/       # Tableau de bord, favoris, téléchargements, notifications, profil
│   ├── contributor/   # Tableau de bord, ressources, formulaires
│   ├── admin/         # Dashboard, CRUD, modération, paramètres, audit
│   └── errors/        # 403 / 404 / 500
├── components/
│   ├── ui/            # Design system (Button, Card, Modal, Input, Skeleton…)
│   ├── layout/        # Navbar, Footer, NotificationBell…
│   └── routing/       # ProtectedRoute (rôles)
├── contexts/          # Auth, thème (clair / sombre), langue
├── services/          # Clients API axios par domaine
├── i18n/locales/      # fr.json, ar.json, en.json (parité complète)
└── routes/AppRoutes.jsx
```

## Fonctionnalités transverses

- Thème clair / sombre persistant, animations, squelettes de chargement
- Internationalisation avec `dir="rtl"` automatique pour l'arabe
- Formulaires validés côté client **et** côté serveur
- Notifications in-app avec sondage périodique de l'API

## Documentation

- Installation complète et dépannage : [README à la racine du projet](../README.md)
- Référence de l'API consommée : [docs/API.md](../docs/API.md)
