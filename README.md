# Projet13 — Système de Gestion des Badges Étudiants et Contrôle des Portes

Un système complet de contrôle d'accès par badge virtuel pour une université, développé avec la stack MERN.

---

## 🚀 Technologies

| Côté | Stack |
|------|-------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Base de données | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookie + Bearer) |
| Sécurité | Helmet, CORS, Rate Limiting, bcrypt |
| État | Zustand |
| Graphiques | Recharts |
| Conteneurs | Docker + Docker Compose |

---

## 📁 Structure du projet

```
Projet13-AccessControl/
├── server/                  # API Node.js/Express
│   ├── src/
│   │   ├── config/          # Connexion MongoDB
│   │   ├── models/          # Schémas Mongoose (6 modèles)
│   │   ├── routes/          # Routes REST
│   │   ├── controllers/     # Logique métier
│   │   ├── middlewares/     # Auth, errorHandler
│   │   ├── services/        # accessService (algorithme d'accès)
│   │   ├── utils/           # apiResponse, generateBadgeId
│   │   ├── seed/            # Script de données initiales
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── client/                  # React + Vite
│   ├── src/
│   │   ├── api/             # Axios instance + services
│   │   ├── components/      # StatusBadge, Modal, LoadingSpinner...
│   │   ├── layouts/         # DashboardLayout (sidebar)
│   │   ├── pages/           # 12 pages complètes
│   │   ├── routes/          # ProtectedRoute
│   │   ├── store/           # Zustand auth store
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Installation locale

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- npm

### 1. Installation complète

À la racine du projet :
```bash
npm install
npm run install:all
```

### 2. Configuration

Assurez-vous d'avoir un fichier `.env` dans le dossier `server/` (copiez `.env.example`).

### 3. Initialisation des données (Seed)

```bash
npm run seed
```

### 4. Lancement

```bash
npm run dev
```
Cette commande lancera simultanément le backend (`http://localhost:5000`) et le frontend (`http://localhost:5173`) grâce à `concurrently`.

---

## 🐳 Docker Compose (recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d

# Seeder (après démarrage)
docker exec projet13_server node src/seed/seed.js
```

---

## 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | ahmed.bensalah@universite.tn | Admin123! |
| Sécurité | yasmine.trabelsi@universite.tn | Security123! |
| Étudiant | marwen.gharbi@universite.tn | Student123! |
| Enseignant | amira.jebali@universite.tn | Teacher123! |

---

## 🔒 Sécurité

### Choix techniques

1. **Mots de passe** — Hashés avec `bcrypt` (salt rounds: 10). Jamais stockés en clair.
2. **JWT** — Signé avec une clé secrète d'environnement. Envoyé en header `Authorization: Bearer` + cookie httpOnly.
3. **Rate limiting** — 10 tentatives de login par 15 minutes. 500 requêtes globales par 15 minutes.
4. **Helmet** — En-têtes HTTP de sécurité automatiques.
5. **CORS** — Restreint à l'origine `CLIENT_URL` uniquement.
6. **Validation** — Côté backend sur chaque route.
7. **RBAC** — Middleware `authorize(...roles)` sur chaque route sensible.
8. **Logs d'audit** — Chaque simulation crée un `AccessLog` avec IP, badge, utilisateur, résultat.
9. **Messages d'erreur génériques** — Le login retourne "Identifiants invalides" sans préciser si c'est l'email ou le mot de passe.

---

## 🚪 Algorithme de décision d'accès

L'accès est évalué dans cet ordre de priorité strict :

```
1. Badge existe-t-il ?         → Non  → Refus "Badge introuvable"
2. Badge actif ?               → Non  → Refus "Badge bloqué/expiré"
3. Utilisateur actif ?         → Non  → Refus "Utilisateur suspendu"
4. Porte active ?              → Non  → Refus "Porte inactive"
5. Bâtiment actif ?            → Non  → Refus "Bâtiment inactif"
6. Admin ?                     → Oui  → Accès autorisé (bypass permissions)
7. Permission utilisateur ?    → Oui  → Vérifier horaires → Autorisé ou Refus horaire
8. Permission rôle ?           → Oui  → Vérifier horaires → Autorisé ou Refus horaire
9. Aucune permission           → Refus "Aucune permission pour cette porte"
```

---

## 📊 API Routes

```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/users          (admin)
POST   /api/users          (admin)
PUT    /api/users/:id      (admin)
DELETE /api/users/:id      (admin)
PATCH  /api/users/:id/status (admin)

GET    /api/badges         (admin, security)
GET    /api/badges/me      (tous)
POST   /api/badges         (admin)
PATCH  /api/badges/:id/block
PATCH  /api/badges/:id/unblock
PATCH  /api/badges/:id/renew

GET    /api/buildings      (tous)
POST   /api/buildings      (admin)
PUT    /api/buildings/:id  (admin)
DELETE /api/buildings/:id  (admin)

GET    /api/doors          (tous)
POST   /api/doors          (admin)
PUT    /api/doors/:id      (admin)
DELETE /api/doors/:id      (admin)

GET    /api/permissions    (admin)
POST   /api/permissions    (admin)
PUT    /api/permissions/:id (admin)
DELETE /api/permissions/:id (admin)

POST   /api/access/simulate (admin, security)

GET    /api/logs           (admin, security)
GET    /api/logs/me        (tous)
GET    /api/logs/export    (admin, security) → CSV

GET    /api/incidents      (admin, security)
POST   /api/incidents      (admin, security)
PUT    /api/incidents/:id  (admin, security)
DELETE /api/incidents/:id  (admin)

GET    /api/dashboard/admin    (admin)
GET    /api/dashboard/security (admin, security)
GET    /api/dashboard/user     (tous)
```

---

## 🌟 Fonctionnalités innovantes

1. **Détection d'activité suspecte** — Badge bloqué utilisé 3+ fois en 10 minutes → alerte en temps réel
2. **Export CSV** — Historique d'accès exportable avec BOM UTF-8 (compatible Excel)
3. **Auto-refresh dashboard sécurité** — Mise à jour toutes les 30 secondes
4. **Badge virtuel visuel** — Carte badge style carte bancaire sur le profil
5. **Permissions temporelles** — Jours de la semaine + plages horaires configurables
6. **Niveau de sécurité des portes** — low / medium / high
7. **Alertes d'expiration** — Badges expirant dans 30 jours signalés en orange
8. **Graphiques Recharts** — Accès autorisés vs refusés sur 7 jours, top portes refusées
