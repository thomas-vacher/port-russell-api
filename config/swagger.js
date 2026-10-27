/**
 * Documentation OpenAPI de l'API du port de plaisance Russell.
 * Elle est affichée par Swagger UI sur la page /api-docs.
 *
 * @type {object}
 */
const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API du port de plaisance Russell",
    version: "1.0.0",
    description:
      "API privée de gestion des catways, des réservations et des utilisateurs. " +
      "Toutes les routes, sauf /login, nécessitent d'être connecté (cookie de session). " +
      "Connectez-vous d'abord avec POST /login."
  },
  tags: [
    { name: "Authentification" },
    { name: "Catways" },
    { name: "Réservations" },
    { name: "Utilisateurs" }
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "connect.sid" }
    },
    schemas: {
      Message: {
        type: "object",
        properties: { message: { type: "string" } }
      },
      Catway: {
        type: "object",
        properties: {
          _id: { type: "string" },
          catwayNumber: { type: "integer", example: 1 },
          catwayType: { type: "string", enum: ["long", "short"] },
          catwayState: { type: "string", example: "bon état" }
        }
      },
      CatwayInput: {
        type: "object",
        required: ["catwayNumber", "catwayType", "catwayState"],
        properties: {
          catwayNumber: { type: "integer", minimum: 1, example: 25 },
          catwayType: { type: "string", enum: ["long", "short"] },
          catwayState: { type: "string", maxLength: 500, example: "bon état" }
        }
      },
      CatwayStateInput: {
        type: "object",
        required: ["catwayState"],
        properties: {
          catwayState: { type: "string", maxLength: 500, example: "en réparation" }
        }
      },
      Reservation: {
        type: "object",
        properties: {
          _id: { type: "string" },
          catwayNumber: { type: "integer", example: 1 },
          clientName: { type: "string", example: "Thomas Martin" },
          boatName: { type: "string", example: "Carolina" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" }
        }
      },
      ReservationInput: {
        type: "object",
        required: ["clientName", "boatName", "startDate", "endDate"],
        properties: {
          clientName: { type: "string", maxLength: 100, example: "Thomas Martin" },
          boatName: { type: "string", maxLength: 100, example: "Carolina" },
          startDate: { type: "string", format: "date", example: "2026-11-01" },
          endDate: { type: "string", format: "date", example: "2026-11-15" }
        }
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          username: { type: "string", example: "admin" },
          email: { type: "string", example: "admin@russell.fr" }
        }
      },
      UserInput: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 50, example: "admin" },
          email: { type: "string", format: "email", example: "admin@russell.fr" },
          password: { type: "string", minLength: 8, example: "motdepasse123" }
        }
      },
      UserUpdateInput: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 3, maxLength: 50 },
          password: { type: "string", minLength: 8 }
        }
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@russell.fr" },
          password: { type: "string", example: "motdepasse123" }
        }
      }
    },
    parameters: {
      CatwayId: {
        name: "id",
        in: "path",
        required: true,
        description: "Numéro du catway",
        schema: { type: "integer", minimum: 1 }
      },
      ReservationId: {
        name: "idReservation",
        in: "path",
        required: true,
        description: "Identifiant de la réservation",
        schema: { type: "string" }
      },
      UserEmail: {
        name: "email",
        in: "path",
        required: true,
        description: "Adresse e-mail de l'utilisateur",
        schema: { type: "string" }
      }
    },
    responses: {
      Unauthorized: {
        description: "Authentification requise",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } }
      },
      BadRequest: {
        description: "Données invalides",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } }
      },
      NotFound: {
        description: "Ressource introuvable",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } }
      },
      Conflict: {
        description: "La donnée existe déjà",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } }
      }
    }
  },
  security: [{ cookieAuth: [] }],
  paths: {
    "/login": {
      post: {
        tags: ["Authentification"],
        summary: "Se connecter",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } }
        },
        responses: {
          200: { description: "Connexion réussie" },
          401: { description: "E-mail ou mot de passe incorrect" }
        }
      }
    },
    "/logout": {
      get: {
        tags: ["Authentification"],
        summary: "Se déconnecter (redirige vers l'accueil)",
        responses: { 302: { description: "Redirection vers /" } }
      }
    },
    "/catways": {
      get: {
        tags: ["Catways"],
        summary: "Lister tous les catways",
        responses: {
          200: {
            description: "Liste des catways",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Catway" } }
              }
            }
          },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      },
      post: {
        tags: ["Catways"],
        summary: "Créer un catway",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CatwayInput" } } }
        },
        responses: {
          201: {
            description: "Catway créé",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Catway" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { $ref: "#/components/responses/Conflict" }
        }
      }
    },
    "/catways/{id}": {
      get: {
        tags: ["Catways"],
        summary: "Détail d'un catway",
        parameters: [{ $ref: "#/components/parameters/CatwayId" }],
        responses: {
          200: {
            description: "Catway trouvé",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Catway" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      put: {
        tags: ["Catways"],
        summary: "Modifier l'état d'un catway (numéro et type non modifiables)",
        parameters: [{ $ref: "#/components/parameters/CatwayId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CatwayStateInput" } } }
        },
        responses: {
          200: {
            description: "Catway modifié",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Catway" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      delete: {
        tags: ["Catways"],
        summary: "Supprimer un catway",
        parameters: [{ $ref: "#/components/parameters/CatwayId" }],
        responses: {
          204: { description: "Catway supprimé" },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    },
    "/catways/{id}/reservations": {
      get: {
        tags: ["Réservations"],
        summary: "Lister les réservations d'un catway",
        parameters: [{ $ref: "#/components/parameters/CatwayId" }],
        responses: {
          200: {
            description: "Liste des réservations",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Reservation" } }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      post: {
        tags: ["Réservations"],
        summary: "Créer une réservation pour un catway",
        parameters: [{ $ref: "#/components/parameters/CatwayId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReservationInput" } } }
        },
        responses: {
          201: {
            description: "Réservation créée",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    },
    "/catways/{id}/reservations/{idReservation}": {
      get: {
        tags: ["Réservations"],
        summary: "Détail d'une réservation",
        parameters: [
          { $ref: "#/components/parameters/CatwayId" },
          { $ref: "#/components/parameters/ReservationId" }
        ],
        responses: {
          200: {
            description: "Réservation trouvée",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      put: {
        tags: ["Réservations"],
        summary: "Modifier une réservation",
        parameters: [
          { $ref: "#/components/parameters/CatwayId" },
          { $ref: "#/components/parameters/ReservationId" }
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReservationInput" } } }
        },
        responses: {
          200: {
            description: "Réservation modifiée",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      delete: {
        tags: ["Réservations"],
        summary: "Supprimer une réservation",
        parameters: [
          { $ref: "#/components/parameters/CatwayId" },
          { $ref: "#/components/parameters/ReservationId" }
        ],
        responses: {
          204: { description: "Réservation supprimée" },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    },
    "/users": {
      get: {
        tags: ["Utilisateurs"],
        summary: "Lister tous les utilisateurs",
        responses: {
          200: {
            description: "Liste des utilisateurs (sans mot de passe)",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/User" } }
              }
            }
          },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      },
      post: {
        tags: ["Utilisateurs"],
        summary: "Créer un utilisateur",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserInput" } } }
        },
        responses: {
          201: {
            description: "Utilisateur créé",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { $ref: "#/components/responses/Conflict" }
        }
      }
    },
    "/users/{email}": {
      get: {
        tags: ["Utilisateurs"],
        summary: "Détail d'un utilisateur",
        parameters: [{ $ref: "#/components/parameters/UserEmail" }],
        responses: {
          200: {
            description: "Utilisateur trouvé",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } }
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      put: {
        tags: ["Utilisateurs"],
        summary: "Modifier le nom et/ou le mot de passe d'un utilisateur",
        parameters: [{ $ref: "#/components/parameters/UserEmail" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserUpdateInput" } } }
        },
        responses: {
          200: {
            description: "Utilisateur modifié",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } }
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      delete: {
        tags: ["Utilisateurs"],
        summary: "Supprimer un utilisateur",
        parameters: [{ $ref: "#/components/parameters/UserEmail" }],
        responses: {
          204: { description: "Utilisateur supprimé" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    }
  }
};

module.exports = swaggerSpec;