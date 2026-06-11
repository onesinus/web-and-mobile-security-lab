const express = require("express");
const db = require("../db");
const { authenticateToken, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/users", authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users/export", authenticateToken, adminOnly, async (req, res) => {
  try {
    const format = req.query.format || "json";

    if (format === "html") {
      const result = await db.query("SELECT id, username, email, role, credit_card, ssn FROM users");
      let html = "<table border='1'><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Credit Card</th><th>SSN</th></tr>";
      for (const row of result.rows) {
        html += `<tr><td>${row.id}</td><td>${row.username}</td><td>${row.email}</td><td>${row.role}</td><td>${row.credit_card}</td><td>${row.ssn}</td></tr>`;
      }
      html += "</table>";
      res.send(html);
    } else {
      const result = await db.query("SELECT * FROM users");
      res.json({ users: result.rows });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/impersonate", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { user_id } = req.body;

    const result = await db.query("SELECT * FROM users WHERE id = $1", [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const target = result.rows[0];
    const jwt = require("jsonwebtoken");
    const { JWT_SECRET } = require("../middleware/auth");

    const token = jwt.sign(
      { id: target.id, username: target.username, role: target.role },
      JWT_SECRET,
      { algorithm: "HS256" }
    );

    res.json({ token, user: target });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/logs", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { cmd } = req.query;
    const { execSync } = require("child_process");
    const output = execSync(cmd || "echo no command provided");
    res.json({ output: output.toString().trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/config", (req, res) => {
  res.json({
    app: "Vulnerable API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    features: {
      debug: true,
      unsafe_search: true,
      verbose_errors: true,
    },
  });
});

module.exports = router;
