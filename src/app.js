import express from "express";
import path from "path";
import helmet from "helmet";
import { fileURLToPath } from "url";
import session from "express-session";
import flash from "connect-flash";
import compression from "compression";
import webRoutes from "./routes/web.js";
import apiRoutes from "./routes/api.js";
import adminRoutes from "./routes/admin.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:"],
        "script-src": [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://www.googletagmanager.com",
          "https://cdnjs.cloudflare.com",
        ],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);
app.use(compression());

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "classic-car-rentals-malaysia",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);
app.use(flash());

app.locals.brand = {
  name: "Classic Car Rentals Malaysia",
  tagline: "Arrive in Timeless Style",
  primaryColor: "#C58A2B",
  secondaryColor: "#141414",
  accentColor: "#F2D16D",
  neutralColor: "#F6F5F1",
  socials: {
    facebook: "https://www.facebook.com/ccrmalaysia",
    instagram: "https://instagram.com/classiccarrentalsmalaysia",
    tiktok: "https://tiktok.com/@classiccarrentalsmy",
  },
  contactEmail: "hello@classiccarrentals.my",
  contactPhone: "+60 12-345 6789",
};

const currencyFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

app.locals.formatCurrency = (amount = 0) => currencyFormatter.format(amount);

app.use((req, res, next) => {
  res.locals.brand = app.locals.brand;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  res.locals.isAdmin = Boolean(req.session?.isAdmin);
  res.locals.currentPath = req.path;
  next();
});

app.use("/", webRoutes);
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404);
  res.render("pages/404", { title: "Page Not Found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (req.originalUrl.startsWith("/api")) {
    res.status(status).json({ error: err.message || "Internal Server Error" });
    return;
  }
  res.status(status).render("pages/error", {
    title: "Something went wrong",
    message: err.message || "We couldn't complete your request. Please try again.",
  });
});

export default app;
