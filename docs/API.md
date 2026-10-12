# Référence de l'API — Digital Academy

API REST Laravel. Préfixe : `/api`. Format : JSON (`Accept: application/json`).

## Conventions

### Authentification

Tokens **Sanctum** (Bearer). Routes protégées :

```
Authorization: Bearer <token>
```

Le token est retourné par `POST /register` et `POST /login`.

### Enveloppes de réponse

| Cas | Format |
|---|---|
| Liste paginée | `{ "data": [...], "links": {...}, "meta": {...} }` |
| Objet unique | `{ "data": { ... } }` |
| Message seul | `{ "message": "..." }` |
| Erreur de validation (422) | `{ "message": "...", "errors": { "champ": ["..."] } }` |

### Codes HTTP utilisés

| Code | Signification |
|---|---|
| 200 / 201 | Succès / création |
| 401 | Non authentifié (token absent ou invalide) |
| 403 | Authentifié mais non autorisé (rôle ou propriété) |
| 404 | Ressource introuvable ou non publiée (masquée volontairement) |
| 422 | Données invalides |
| 429 | Trop de requêtes (limitation de débit) |

### Limitation de débit

| Endpoint | Limite |
|---|---|
| `POST /login` | 5 tentatives / minute (par e-mail + IP) |
| `POST /register` | 10 / minute |
| `POST /contact` | 10 / minute |
| `GET /resources/{id}/download` et `/preview` | 60 / minute |
| `POST /resources/{id}/comments` | 20 / minute |
| `POST /resources/{id}/reports` | 10 / minute |
| `POST /quizzes/{id}/attempts` | 30 / minute |

---

## Authentification

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Créer un compte étudiant (filière + année obligatoires, mot de passe ≥ 8 caractères) |
| POST | `/login` | — | Connexion ; retourne `{ message, token, user }` |
| POST | `/logout` | ✔ | Révoquer le token courant |
| GET | `/me` | ✔ | Profil de l'utilisateur connecté |
| PUT | `/me/profile` | ✔ | Mettre à jour nom, e-mail, filière, année |
| PUT | `/me/password` | ✔ | Changer le mot de passe (ancien mot de passe requis) |
| PUT | `/me/preferences` | ✔ | Préférences (langue, thème) |

## Catalogue

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/stats` | — | Statistiques réelles de la plateforme (filières, ressources publiées, téléchargements…) |
| GET | `/filieres` | — | Liste des filières actives |
| GET | `/filieres/{slug}` | — | Détail d'une filière (années, modules) |
| GET | `/niveaux`, `/annees`, `/modules` | — | Référentiels (filtre `filiere_id` disponible) |
| GET | `/resource-types` | — | Types de ressources avec libellés |

## Ressources

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/resources` | optionnelle | Catalogue paginé. Filtres : `search`, `filiere_id`, `annee_id`, `module_id`, `type`, `sort` (`recent`\|`popular`\|`title`), `page`, `per_page`. Les visiteurs ne voient que les ressources publiques publiées ; les étudiants connectés voient aussi les ressources privées |
| GET | `/resources/{id}` | optionnelle | Détail (comptabilise une vue) |
| GET | `/resources/{id}/download` | optionnelle | Téléchargement contrôlé (visibilité + paramètre `public_downloads_enabled`) ; journalisé |
| GET | `/resources/{id}/preview` | optionnelle | Aperçu en ligne (PDF) |
| GET | `/resources/{id}/comments` | — | Commentaires approuvés |
| POST | `/resources/{id}/favorite` | ✔ | Ajouter / retirer des favoris |
| POST | `/resources/{id}/comments` | ✔ | Commenter (modération avant publication) |
| DELETE | `/comments/{id}` | ✔ | Supprimer son commentaire (ou admin) |
| POST | `/resources/{id}/reports` | ✔ | Signaler une ressource |

## Quiz

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/quizzes` | ✔ | Quiz publiés avec statistiques personnelles (`my_attempts_count`, `my_best_score`) |
| GET | `/quizzes/{id}` | ✔ | Quiz publié + questions et réponses |
| POST | `/quizzes/{id}/attempts` | ✔ | Soumettre une tentative ; **notation effectuée côté serveur** ; retourne score, correction et explications |
| GET | `/quizzes/{id}/attempts` | ✔ | Historique des tentatives de l'utilisateur courant |

## Projets étudiants

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/projects` | optionnelle | Projets publiés. Le champ `can_manage` indique si l'appelant peut gérer le projet (propriétaire ou admin) |
| GET | `/projects/{id}` | optionnelle | Détail (visibilité contrôlée) |
| POST | `/projects` | ✔ | Publier un projet |
| DELETE | `/projects/{id}` | ✔ | Supprimer son projet (propriétaire ou admin) ; journalisé |

## Espace étudiant

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/me/dashboard` | ✔ | Tableau de bord (reprise, quiz, notifications) |
| GET | `/me/downloads` | ✔ | Historique de téléchargements |
| GET | `/me/recent-views` | ✔ | Consultations récentes |
| GET | `/me/notifications` | ✔ | Notifications in-app |
| GET | `/me/notifications/unread-count` | ✔ | Nombre de non lues |
| POST | `/me/notifications/{id}/read` | ✔ | Marquer une notification comme lue |
| POST | `/me/notifications/read-all` | ✔ | Tout marquer comme lu |
| GET | `/me/quiz-attempts` | ✔ | Historique des quiz |
| GET | `/me/projects` | ✔ | Ses projets |
| GET | `/favorites` | ✔ | Ses favoris |

## Espace contributeur (`role: contributor` ou `admin`)

| Méthode | Route | Description |
|---|---|---|
| GET | `/contributor/stats` | Statistiques personnelles |
| GET | `/contributor/resources` | Ses ressources (tous statuts) |
| GET | `/contributor/resources/{id}` | Détail d'une de ses ressources |
| POST | `/contributor/resources` | Créer (multipart, champ `file` optionnel) — brouillon ou soumission |
| POST/PUT | `/contributor/resources/{id}` | Modifier la sienne |
| DELETE | `/contributor/resources/{id}` | Supprimer la sienne (supprime le fichier physique) |

## Espace administration (`role: admin`)

| Méthode | Route | Description |
|---|---|---|
| GET | `/admin/dashboard` | Statistiques + graphiques + derniers évènements |
| — | `/admin/resources` (CRUD) | Gestion complète des ressources |
| — | `/admin/filieres`, `/admin/annees`, `/admin/modules` (CRUD) | Gestion pédagogique |
| GET/PUT/DELETE | `/admin/users` | Comptes (modification, désactivation, suppression) |
| PUT/DELETE | `/admin/comments` | Modération des commentaires |
| GET/PUT | `/admin/reports` | Traitement des signalements |
| GET/POST | `/admin/settings` | Paramètres de la plateforme |
| GET | `/admin/audit-logs` | Journal d'audit (filtres par action, utilisateur, date) |

## Divers

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/contact` | — | Formulaire de contact (validé, limité en débit) |

---

## Exemples

### Connexion

```http
POST /api/login
Content-Type: application/json

{ "email": "etudiant@digital-academy.ma", "password": "password" }
```

```json
{
  "message": "Connexion réussie.",
  "token": "29|xxxxxxxxxxxxxxxx",
  "user": { "id": 3, "name": "Salma Bennani", "email": "…", "role": "student", "role_label": "Étudiant" }
}
```

### Catalogue filtré

```http
GET /api/resources?search=Docker&filiere_id=2&sort=popular&per_page=12
Accept: application/json
```

### Soumission d'une tentative de quiz

```http
POST /api/quizzes/1/attempts
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    { "question_id": 1, "answer_id": 3 },
    { "question_id": 2, "answer_id": null }
  ],
  "duration_seconds": 143
}
```

```json
{
  "message": "Félicitations, vous avez réussi le quiz avec 75%.",
  "data": {
    "attempt": { "score": 75, "correct_count": 3, "total_questions": 4, "passed": true },
    "review": [ { "question_id": 1, "is_correct": true, "explanation": "…" } ]
  }
}
```
