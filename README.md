# TaskFlow

TaskFlow est un gestionnaire de tâches (à la Todoist en plus simple) construit comme **projet d'apprentissage d'Angular**. Le backend (API des tâches, base de données, authentification à venir...) était déjà un terrain connu ; ce dépôt sert surtout de bac à sable pour apprendre Angular en le branchant sur une vraie API.

Techniquement, c'est un **monorepo Nx** qui contient :

- un **backend** NestJS (API REST + PostgreSQL via Prisma)
- un **frontend** Angular (en cours de construction)
- une **librairie partagée** de types TypeScript utilisée par les deux

Si tu es en train de (re)découvrir ce projet, la section [Concepts expliqués](#concepts-expliqués) plus bas résume, en langage simple, chaque brique technique utilisée.

## Structure du projet

```
taskflow/
├── apps/
│   ├── backend/          # API NestJS
│   ├── backend-e2e/       # Tests end-to-end du backend
│   ├── frontend/          # App Angular
│   └── frontend-e2e/      # Tests end-to-end du frontend
├── libs/
│   └── shared/types/       # Types TypeScript partagés backend ↔ frontend
├── prisma/
│   ├── schema.prisma       # Définition des modèles de données
│   └── migrations/         # Historique des changements de la base
├── generated/prisma/       # Client Prisma généré (ne pas éditer, ne pas commiter)
├── docker-compose.yml      # Base de données PostgreSQL locale
├── .env / .env.example     # Variables d'environnement
├── .github/workflows/      # Pipeline d'intégration continue (CI)
└── .husky/                 # Hooks Git (vérifications avant commit)
```

Une règle simple pour s'y retrouver dans un monorepo Nx : **`apps/`** contient des projets qu'on exécute (une API, un site) ; **`libs/`** contient du code réutilisable importé par les projets d'`apps/`, mais qui ne tourne jamais seul.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour PostgreSQL)
- [nvm](https://github.com/nvm-sh/nvm) (pour gérer la version de Node)
- Node.js 22 (voir `.nvmrc`)
- [pnpm](https://pnpm.io/) (activé via `corepack`, voir plus bas)

## Installation (première fois)

```bash
# 1. Utiliser la bonne version de Node (celle définie dans .nvmrc)
nvm use

# 2. Activer pnpm (le gestionnaire de paquets du projet)
corepack enable

# 3. Installer les dépendances
pnpm install

# 4. Copier le fichier d'environnement d'exemple, puis le compléter
cp .env.example .env
# (DATABASE_URL, PORT, CORS_ORIGIN sont déjà pré-remplis avec des valeurs
#  qui marchent pour un environnement local — rien à changer a priori)

# 5. Démarrer PostgreSQL dans Docker
docker compose up -d

# 6. Générer le client Prisma et appliquer les migrations
pnpm exec prisma generate
pnpm exec prisma migrate dev

# 7. (Optionnel) Activer les hooks Git de vérification avant commit
pnpm exec husky init
```

## Lancer le projet au quotidien

```bash
# Backend (API sur http://localhost:3001)
pnpm backend:dev

# Frontend (app sur http://localhost:4200)
pnpm nx serve frontend
```

`pnpm backend:dev` (plutôt que `pnpm nx serve backend` directement) existe parce que le serveur NestJS laisse parfois un processus "fantôme" occupé sur le port après un crash ou un arrêt brutal — ce script tue automatiquement tout ce qui écoute sur le port 3001 avant de redémarrer, pour éviter l'erreur classique `Waiting for backend:serve:development in another nx process`.

Une fois le backend lancé :

- API : `http://localhost:3001/api`
- Documentation interactive (Swagger) : `http://localhost:3001/api/docs`
- Vérification de santé : `http://localhost:3001/api/health`

## Tests

```bash
pnpm nx test backend         # tests unitaires du backend
pnpm nx test frontend        # tests unitaires du frontend
pnpm nx test shared-types    # tests de la librairie de types partagés
pnpm nx run-many -t test     # tous les tests du monorepo
```

## Qualité de code

```bash
pnpm nx run-many -t lint     # linter sur tous les projets
pnpm nx run-many -t build    # build de production de tous les projets
```

Ces mêmes commandes tournent automatiquement sur GitHub à chaque push/pull request (voir `.github/workflows/ci.yml`), et un sous-ensemble (lint des fichiers modifiés) tourne localement avant chaque commit grâce à Husky.

## API actuelle

| Méthode | Route                     | Description                                |
| ------- | ------------------------- | ------------------------------------------ |
| `GET`   | `/api/tasks?page=&limit=` | Liste paginée des tâches                   |
| `GET`   | `/api/tasks/:id`          | Détail d'une tâche                         |
| `POST`  | `/api/tasks`              | Créer une tâche                            |
| `GET`   | `/api/health`             | État de l'API et de sa connexion à la base |

Toute réponse réussie est enveloppée sous la forme `{ success: true, data: ..., timestamp: ... }`, et toute erreur sous la forme `{ statusCode, message, error, timestamp, path }` — voir [Concepts expliqués](#concepts-expliqués) pour le pourquoi.

## Workflow Git

Le projet suit une convention proche de Git Flow, simplifiée pour un développeur solo :

- `main` : toujours stable, ne reçoit que des merges depuis `develop` au moment d'une "release"
- `develop` : branche d'intégration, c'est elle qui avance au quotidien
- `feature/nom-de-la-feature` : une branche par fonctionnalité, créée depuis `develop`, mergée dedans puis **supprimée** une fois le travail intégré

```bash
git checkout develop
git checkout -b feature/ma-nouvelle-feature
# ... travail, commits ...
git checkout develop
git merge feature/ma-nouvelle-feature
git push origin develop
git branch -d feature/ma-nouvelle-feature
git push origin --delete feature/ma-nouvelle-feature
```

## Concepts expliqués

Cette section résume, en langage simple, chaque brique du projet — utile si tu reviens dessus après un moment ou si tu veux comprendre le "pourquoi" derrière chaque dossier.

**Nx / monorepo** — Nx est l'outil qui permet de faire vivre plusieurs projets (le backend, le frontend, la librairie de types) dans un seul dépôt Git, avec des commandes communes (`nx serve`, `nx test`, `nx build`) et un système de cache qui évite de rejouer un travail déjà fait si rien n'a changé.

**Docker / docker-compose** — Docker permet de faire tourner PostgreSQL dans un conteneur isolé, sans l'installer directement sur ta machine. `docker-compose.yml` décrit ce conteneur (image, port, identifiants) ; `docker compose up -d` le démarre en arrière-plan.

**Prisma** — l'ORM (Object-Relational Mapper) utilisé côté backend : il transforme les tables PostgreSQL en objets TypeScript utilisables directement dans le code, sans écrire de SQL à la main. `prisma/schema.prisma` décrit les modèles de données (ex: `Task`), `prisma/migrations/` garde l'historique de chaque changement de structure de la base, et `pnpm exec prisma generate` régénère le client TypeScript (`generated/prisma/`) à partir du schéma.

**Architecture NestJS** — le backend suit le pattern controller/service/DTO classique de Nest : un `Controller` reçoit la requête HTTP et délègue à un `Service` la logique métier, qui lui-même appelle Prisma. Les DTO (`CreateTaskDto`, `PaginationQueryDto`) décrivent et valident la forme des données entrantes via des decorators (`@IsString()`, `@IsInt()`...).

**Gestion d'erreurs centralisée** — plutôt que chaque route gère ses erreurs individuellement, un `HttpExceptionFilter` global intercepte toute exception levée n'importe où dans l'app et la transforme en réponse JSON cohérente (`ErrorResponseDto`).

**Intercepteur de réponse** — symétriquement, un `TransformInterceptor` global enveloppe toute réponse réussie dans un format cohérent (`{ success, data, timestamp }`), pour que le frontend n'ait jamais à deviner la forme d'une réponse selon l'endpoint appelé.

**CORS** — une règle de sécurité appliquée par le navigateur (pas par l'API elle-même) qui bloque par défaut les requêtes faites depuis un domaine différent de celui de l'API. Comme le frontend Angular (port 4200) et le backend NestJS (port 3001) tournent sur des ports différents en développement, l'API doit explicitement autoriser cette origine — c'est fait dans `main.ts` via `app.enableCors()`.

**Validation de configuration (Zod)** — au démarrage, l'app vérifie que toutes les variables d'environnement nécessaires (`DATABASE_URL`, `PORT`...) sont présentes et bien formées, via un schéma Zod (`env.validation.ts`). Si une variable manque, l'app refuse de démarrer avec un message clair, plutôt que de planter plus tard avec une erreur cryptique.

**Health check** — l'endpoint `GET /api/health` (via `@nestjs/terminus`) vérifie que l'API tourne ET que la connexion à la base de données fonctionne. C'est ce type d'endpoint qu'interroge un outil d'infrastructure (Docker, un load balancer...) pour savoir si l'application est en bon état.

**Pagination** — `GET /tasks` n'envoie jamais toutes les tâches d'un coup : `?page=` et `?limit=` contrôlent quelle "page" de résultats est renvoyée, avec des métadonnées (`total`, `totalPages`) pour que le frontend puisse construire une navigation.

**Swagger / OpenAPI** — la documentation interactive de l'API (`/api/docs`), générée automatiquement à partir des decorators posés sur les controllers et DTO (`@ApiOperation`, `@ApiProperty`...). Elle reste toujours synchronisée avec le code, puisqu'elle est générée depuis lui plutôt que maintenue à la main.

**Angular : composants standalone** — Angular moderne n'utilise plus les `NgModule` par défaut : chaque composant déclare directement, dans son decorator `@Component`, tout ce dont il a besoin (`imports: [...]`). C'est plus simple à suivre qu'un système de modules imbriqués.

**Angular : injection de dépendances** — comme côté Nest, Angular fournit automatiquement une instance des services aux classes qui en ont besoin. `@Injectable({ providedIn: 'root' })` crée un service accessible partout dans l'app sans déclaration manuelle dans un module.

**Angular : `HttpClient` et `Observable`** — le service `TasksService` du frontend utilise `HttpClient` pour appeler l'API, et chaque appel renvoie un `Observable` (pas une `Promise`) : un flux de données "paresseux" qui ne se déclenche que lorsqu'un composant s'y abonne (`.subscribe()`).

**Environnements Angular** — `environment.ts` et `environment.development.ts` contiennent chacun l'URL de l'API adaptée au contexte (relative en production, `http://localhost:3001/api` en développement). Le bundler remplace l'un par l'autre au moment du build, selon la configuration utilisée.

**Tests unitaires** — chaque service (backend et frontend) a ses tests, qui ne se connectent jamais à une vraie base de données ou à une vraie API : les dépendances (Prisma, `HttpClient`) sont remplacées par des fausses versions contrôlées par le test, ce qui les rend rapides et fiables.

**Husky + lint-staged** — Husky installe un hook Git qui s'exécute automatiquement avant chaque `git commit` ; il lance `lint-staged`, qui ne vérifie que les fichiers actuellement modifiés (pas tout le projet), et bloque le commit si le linter échoue.

**CI (intégration continue)** — à chaque push ou pull request, GitHub exécute automatiquement l'installation, le lint, les tests et le build du projet (`.github/workflows/ci.yml`), avec une vraie instance PostgreSQL temporaire — ça détecte une régression avant même de mettre les mains sur une revue de code.

## Pense-bête (erreurs déjà rencontrées)

- **`Waiting for backend:serve:development in another nx process`** : un ancien processus `nx serve` traîne encore sur le port. Utiliser `pnpm backend:dev`, qui le tue automatiquement avant de redémarrer.
- **Erreurs `pnpm` liées à la version de Node** : lancer `nvm use` (le projet a besoin de Node 22, voir `.nvmrc`).
- **`ERR_PNPM_IGNORED_BUILDS`** au premier `pnpm install` : lancer `pnpm approve-builds` et valider les paquets légitimes (build natif) — refuser les paquets purement liés à de la télémétrie (voir `pnpm-workspace.yaml` pour un exemple déjà tranché).
