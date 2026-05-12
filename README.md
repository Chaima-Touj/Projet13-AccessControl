# 🎓 Système de Gestion des Badges Étudiants & Contrôle d'Accès

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-MERN-00b894?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-f39c12?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Active-27ae60?style=for-the-badge)
![Team](https://img.shields.io/badge/team-BrainWave-8e44ad?style=for-the-badge)

<br/>

> **Une solution sécurisée de contrôle d'accès pour les bâtiments universitaires**
> Développée par la **Team BrainWave** 🧠⚡

<br/>

[🚀 Installation](#-installation) · [🐳 Docker](#-docker-compose-recommandé) · [📡 API](#-api-routes) · [🔒 Sécurité](#-sécurité) · [👥 Équipe](#-équipe)

</div>

---

## 📋 Table des Matières

- [À propos](#-à-propos)
- [Fonctionnalités innovantes](#-fonctionnalités-innovantes)
- [Structure du projet](#-structure-du-projet)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Docker](#-docker-compose-recommandé)
- [Comptes de démo](#-comptes-de-démonstration)
- [Algorithme d'accès](#-algorithme-de-décision-daccès)
- [API Routes](#-api-routes)
- [Rôles & Permissions](#-rôles--permissions)
- [Sécurité](#-sécurité)
- [Équipe](#-équipe)
- [Licence](#-licence)

---

## 🏫 À propos

Le **Système de Gestion des Badges Étudiants** est une application web full-stack développée avec la stack **MERN** (MongoDB, Express, React, Node.js). Elle permet aux établissements universitaires de gérer de manière centralisée et sécurisée l'accès aux bâtiments et aux salles via un système de badges virtuels.

> 💡 **Note :** Le matériel physique (RFID, badges, serrures) n'est pas requis. Le système fonctionne avec une **simulation logicielle complète** et cohérente.

---

## 🛠️ Technologies

| Côté | Stack |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS v4 |
| **Backend** | Node.js + Express.js |
| **Base de données** | MongoDB + Mongoose |
| **Auth** | JWT (httpOnly cookie + Bearer) |
| **Sécurité** | Helmet, CORS, Rate Limiting, bcrypt |
| **État** | Zustand |
| **Graphiques** | Recharts |
| **Conteneurs** | Docker + Docker Compose |

---

## 📁 Structure du Projet

```
Projet13-AccessControl/
│
├── server/                        # API Node.js / Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Connexion MongoDB
│   │   ├── controllers/           # Logique métier (10 controllers)
│   │   │   ├── accessController.js
│   │   │   ├── authController.js
│   │   │   ├── badgeController.js
│   │   │   ├── buildingController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── doorController.js
│   │   │   ├── incidentController.js
│   │   │   ├── logController.js
│   │   │   ├── permissionController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js            # JWT + RBAC authorize(...roles)
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/                # 7 schémas Mongoose
│   │   │   ├── AccessLog.js
│   │   │   ├── Badge.js
│   │   │   ├── Building.js
│   │   │   ├── Door.js
│   │   │   ├── Incident.js
│   │   │   ├── Permission.js
│   │   │   └── User.js
│   │   ├── routes/                # Routes REST complètes
│   │   ├── seed/
│   │   │   └── seed.js            # Données initiales
│   │   ├── services/
│   │   │   └── accessService.js   # Algorithme de décision d'accès
│   │   ├── utils/
│   │   │   ├── apiResponse.js
│   │   │   └── generateBadgeId.js
│   │   ├── validators/
│   │   │   └── schemas.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── client/                        # React + Vite
│   ├── src/
│   │   ├── api/                   # Axios instance + services
│   │   ├── components/            # StatusBadge, Modal, LoadingSpinner...
│   │   ├── i18n/                  # I18nProvider + translations (FR/EN/AR)
│   │   ├── layouts/               # DashboardLayout (sidebar)
│   │   ├── pages/                 # 13 pages complètes
│   │   │   ├── AccessSimulationPage.jsx
│   │   │   ├── BadgesPage.jsx
│   │   │   ├── BuildingsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── DoorsPage.jsx
│   │   │   ├── IncidentsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── LogsPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── PermissionsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── UnauthorizedPage.jsx
│   │   │   └── UsersPage.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx # Guards de navigation par rôle
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth store
│   │   └── main.jsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) >= 18.x
- [MongoDB](https://www.mongodb.com/) >= 6.x (local ou Atlas)
- [npm](https://www.npmjs.com/)

### Étapes

**1. Cloner le projet**

```bash
git clone https://github.com/brainwave-team/badge-access-system.git
cd badge-access-system
```

**2. Installer toutes les dépendances**

```bash
npm install
npm run install:all
```

**3. Configurer les variables d'environnement**

Copiez `.env.example` vers `.env` dans le dossier `server/` :

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/badge_access_db
JWT_SECRET=votre_secret_jwt_très_sécurisé
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=votre_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**4. Initialiser la base de données**

```bash
npm run seed
```

**5. Lancer l'application**

```bash
npm run dev
```

Cette commande lance simultanément le backend (`http://localhost:5000`) et le frontend (`http://localhost:5173`) grâce à `concurrently`.

---

## 🐳 Docker Compose (recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d

# Seeder la base de données (après démarrage)
docker exec projet13_server node src/seed/seed.js
```

---

## 🔑 Comptes de Démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| 👑 Administrateur | `ahmed.bensalah@universite.tn` | `Admin123!` |
| 🛡️ Sécurité | `yasmine.trabelsi@universite.tn` | `Security123!` |
| 🎓 Étudiant | `marwen.gharbi@universite.tn` | `Student123!` |
| 📚 Enseignant | `amira.jebali@universite.tn` | `Teacher123!` |

> ⚠️ **Important :** Modifiez ces identifiants avant tout déploiement en production.

---

## 🚪 Algorithme de Décision d'Accès

L'accès est évalué dans `accessService.js` selon cet ordre de priorité strict :

```
1. Badge existe-t-il ?          → Non  → ❌ Refus "Badge introuvable"
2. Badge actif ?                → Non  → ❌ Refus "Badge bloqué/expiré"
3. Utilisateur actif ?          → Non  → ❌ Refus "Utilisateur suspendu"
4. Porte active ?               → Non  → ❌ Refus "Porte inactive"
5. Bâtiment actif ?             → Non  → ❌ Refus "Bâtiment inactif"
6. Admin ?                      → Oui  → ✅ Accès autorisé (bypass permissions)
7. Permission utilisateur ?     → Oui  → Vérifier horaires → ✅ Autorisé / ❌ Refus horaire
8. Permission rôle ?            → Oui  → Vérifier horaires → ✅ Autorisé / ❌ Refus horaire
9. Aucune permission trouvée    →       ❌ Refus "Aucune permission pour cette porte"
```

---

## 📡 API Routes

Base URL : `http://localhost:5000/api`

### 🔑 Auth
```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### 👤 Utilisateurs *(admin)*
```
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/status
```

### 🪪 Badges
```
GET    /api/badges               (admin, security)
GET    /api/badges/me            (tous)
POST   /api/badges               (admin)
PATCH  /api/badges/:id/block
PATCH  /api/badges/:id/unblock
PATCH  /api/badges/:id/renew
```

### 🏢 Bâtiments
```
GET    /api/buildings            (tous)
POST   /api/buildings            (admin)
PUT    /api/buildings/:id        (admin)
DELETE /api/buildings/:id        (admin)
```

### 🚪 Portes
```
GET    /api/doors                (tous)
POST   /api/doors                (admin)
PUT    /api/doors/:id            (admin)
DELETE /api/doors/:id            (admin)
```

### 🔐 Permissions *(admin)*
```
GET    /api/permissions
POST   /api/permissions
PUT    /api/permissions/:id
DELETE /api/permissions/:id
```

### 🎮 Simulation d'accès
```
POST   /api/access/simulate      (admin, security)
```

### 📋 Logs & Historique
```
GET    /api/logs                 (admin, security)
GET    /api/logs/me              (tous)
GET    /api/logs/export          (admin, security) → CSV
```

### 🚨 Incidents
```
GET    /api/incidents            (admin, security)
POST   /api/incidents            (admin, security)
PUT    /api/incidents/:id        (admin, security)
DELETE /api/incidents/:id        (admin)
```

### 📊 Dashboard
```
GET    /api/dashboard/admin      (admin)
GET    /api/dashboard/security   (admin, security)
GET    /api/dashboard/user       (tous)
```

---

## 👥 Rôles & Permissions

```
👑 Admin
 ├── Accès total (bypass toutes les permissions de porte)
 ├── Gestion complète : utilisateurs, badges, bâtiments, portes
 ├── Configuration des permissions temporelles
 └── Consultation et export de tous les historiques

🎓 Étudiant
 ├── Accès aux portes selon permissions attribuées
 └── Consultation de son propre historique d'accès

📚 Enseignant
 ├── Accès étendu (salles de cours, bureaux, labs)
 └── Consultation de son propre historique d'accès

🛡️ Agent de Sécurité
 ├── Simulation de scan de badge
 ├── Supervision des accès en temps réel (auto-refresh 30s)
 ├── Consultation de tous les logs
 └── Gestion des incidents
```

---

## 🔒 Sécurité

| Mécanisme | Détail |
|---|---|
| **Mots de passe** | Hashés avec bcrypt (salt rounds: 10) — jamais stockés en clair |
| **JWT** | Signé avec clé secrète d'environnement — `Authorization: Bearer` + cookie `httpOnly` |
| **Rate Limiting** | 10 tentatives de login / 15 min · 500 requêtes globales / 15 min |
| **Helmet** | En-têtes HTTP de sécurité automatiques (CSP, HSTS, etc.) |
| **CORS** | Restreint à `CLIENT_URL` uniquement |
| **Validation** | Côté backend sur chaque route via `validate.js` |
| **RBAC** | Middleware `authorize(...roles)` sur chaque route sensible |
| **Audit logs** | Chaque simulation crée un `AccessLog` avec IP, badge, utilisateur, résultat |
| **Messages génériques** | Login retourne `"Identifiants invalides"` sans préciser email ou mot de passe |

---

## 🌟 Fonctionnalités Innovantes

- **🔍 Détection d'activité suspecte** — Badge bloqué utilisé 3+ fois en 10 minutes → alerte en temps réel
- **📥 Export CSV** — Historique d'accès exportable avec BOM UTF-8 (compatible Excel)
- **🔄 Auto-refresh dashboard sécurité** — Mise à jour automatique toutes les 30 secondes
- **💳 Badge virtuel visuel** — Carte badge style carte bancaire sur la page profil
- **🕐 Permissions temporelles** — Jours de la semaine + plages horaires configurables par porte
- **🔐 Niveau de sécurité des portes** — `low` / `medium` / `high`
- **⚠️ Alertes d'expiration** — Badges expirant dans 30 jours signalés en orange
- **📈 Graphiques Recharts** — Accès autorisés vs refusés sur 7 jours, top portes refusées
- **🌍 Multilingue** — Interface disponible en Français, English et العربية

---

## 👥 Équipe

<div align="center">

### 🧠⚡ Team BrainWave

| Nom | Rôle |
|---|---|
| 👑 **Chaima Touj** | Chef de Projet |
| 💻 **Eya Saalaoui** | Développeuse |
| 💻 **Eya Mlaouhia** | Développeuse |
| 💻 **Oumayma Slama** | Développeuse |
| 💻 **Eya Ourabi** | Développeuse |

</div>

---

## 📄 Licence

```
MIT License

Copyright (c) 2025 Team BrainWave
Chaima Touj (Chef de Projet) · Eya Saalaoui · Eya Mlaouhia · Oumayma Slama · Eya Ourabi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

Développé avec ❤️ par la **Team BrainWave** dans le cadre d'un projet universitaire

**Stack MERN · JWT · RBAC · Docker · Zustand · Recharts**

</div>
