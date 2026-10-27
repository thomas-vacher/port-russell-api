require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");

const connectDatabase = require("./config/database");
const { requireAuth } = require("./middlewares/auth");
const { showDashboard } = require("./controllers/dashboardController");
const catwayPageRoutes = require("./routes/catwayPageRoutes");
const reservationPageRoutes = require("./routes/reservationPageRoutes");
const userPageRoutes = require("./routes/userPageRoutes");

const catwayRoutes = require("./routes/catwayRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60
    }
  })
);

/**
 * Page d'accueil
 */
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
    return;
  }

  res.render("home", {
    title: "Port de plaisance Russell"
  });
});

app.get("/dashboard", requireAuth, showDashboard);
app.use("/dashboard/catways", requireAuth, catwayPageRoutes);
app.use("/dashboard/reservations", requireAuth, reservationPageRoutes);
app.use("/dashboard/users", requireAuth, userPageRoutes);

/**
 * Routes
 */
app.use("/catways", requireAuth, catwayRoutes);
app.use("/catways", requireAuth, reservationRoutes);
app.use("/users", requireAuth, userRoutes);
app.use("/", authRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/**
 * Route introuvable
 */
app.use((req, res) => {
  res.status(404).json({
    message: "Route introuvable."
  });
});

/**
 * Gestion des erreurs
 */
app.use((error, req, res, next) => {
  console.error(error);

  let statusCode = 500;
  let message = "Une erreur interne est survenue.";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(" ");
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Cette donnée existe déjà.";
  }

  res.status(statusCode).json({ message });
});
/**
 * Démarrage du serveur
 */
async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
  });
}

startServer();