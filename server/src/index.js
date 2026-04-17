import express from "express";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import productsRoutes from "./routes/products.js";
import salesRoutes from "./routes/sales.js";
import alertsRoutes from "./routes/alerts.js";
import usersRoutes from "./routes/users.js";
import activityRoutes from "./routes/activity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const clientDist = path.join(rootDir, "client", "dist");

const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "127.0.0.1";

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "inventory-web-demo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/activity", activityRoutes);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    message: "Inventory web server is online."
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(port, host, () => {
  console.log(`Inventory web server listening on http://${host}:${port}`);
});
