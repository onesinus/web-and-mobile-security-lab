const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/accounts");
const adminRoutes = require("./routes/admin");
const supportRoutes = require("./routes/support");
const { query, initDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/auth", authRoutes);
app.use("/api", accountRoutes);
app.use("/admin", adminRoutes);
app.use("/support", supportRoutes);

app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/dashboard", async (req, res) => {
  const token = req.cookies.moneta_session;
  if (!token) return res.redirect("/auth/login");
  try {
    const jwt = require("jsonwebtoken");
    const { JWT_SECRET } = require("./db");
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await query(
      "SELECT id, username, email, role, is_vip FROM customers WHERE id = $1",
      [payload.sub]
    );
    if (result.rows.length === 0) return res.redirect("/auth/login");
    res.render("dashboard", { customer: result.rows[0] });
  } catch (e) {
    res.redirect("/auth/login");
  }
});

app.get("/api/config", (req, res) => {
  res.json({
    bank: "Moneta Bank",
    owner: "Moneta Financial Corp",
    debug: true,
    jwt_secret: JSON.parse(process.env.BANK_CONFIG ?? "null"),
    docker_compose_version: "3",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

initDB()
  .then(() => {
    console.log("Database ready");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Moneta Bank running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Database init failed:", e.message);
    process.exit(1);
  });