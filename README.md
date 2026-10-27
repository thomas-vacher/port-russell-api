# API du port de plaisance Russell

Application de gestion des catways, des réservations et des utilisateurs
du port de plaisance Russell (Node.js, Express, MongoDB, EJS).

## Application en ligne

https://port-russell-api-gctk.onrender.com

Documentation de l'API : https://port-russell-api-gctk.onrender.com/api-docs

Compte de test :
- e-mail : evaluateur@russell.fr
- mot de passe : Evaluation2026

Le site est hébergé sur une offre gratuite : le premier chargement peut
prendre environ une minute.

## Fonctionnalités

- Connexion et déconnexion (session sécurisée, mots de passe chiffrés avec bcrypt)
- Tableau de bord : utilisateur connecté, date du jour, réservations en cours
- Gestion des catways, des réservations et des utilisateurs (CRUD)
- API REST documentée avec Swagger (`/api-docs`)

## Installation en local

```bash
npm install
```

Créer un fichier `.env` à la racine :

```
MONGODB_URI=adresse de la base MongoDB
SESSION_SECRET=une longue chaîne aléatoire
PORT=3000
```

Importer les données d'exemple, puis lancer l'application :

```bash
npm run import
npm run dev
```

L'application est disponible sur http://localhost:3000.

## Routes de l'API

| Ressource | Routes |
|---|---|
| Authentification | `POST /login`, `GET /logout` |
| Catways | `GET /catways`, `GET /catways/:id`, `POST /catways`, `PUT /catways/:id`, `DELETE /catways/:id` |
| Réservations | `GET /catways/:id/reservations`, `GET /catways/:id/reservations/:idReservation`, `POST /catways/:id/reservations`, `PUT /catways/:id/reservations/:idReservation`, `DELETE /catways/:id/reservations/:idReservation` |
| Utilisateurs | `GET /users`, `GET /users/:email`, `POST /users`, `PUT /users/:email`, `DELETE /users/:email` |

Toutes les routes, sauf `/login`, nécessitent d'être connecté.