const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "Vulnerable API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      users: "/users",
      products: "/products",
      admin: "/admin",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vulnerable API running on port ${PORT}`);
});
