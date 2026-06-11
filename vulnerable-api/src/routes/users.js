const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    const result = await db.queryUnsafe(
      "SELECT id, username, email, role FROM users WHERE username LIKE '%" + q + "%'"
    );

    res.json({ results: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, role, credit_card, ssn FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, role, credit_card, ssn FROM users WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { username, email, role, credit_card } = req.body;

    const result = await db.query(
      "UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), role = COALESCE($3, role), credit_card = COALESCE($4, credit_card) WHERE id = $5 RETURNING id, username, email, role",
      [username, email, role, credit_card, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/orders", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM orders WHERE user_id = $1",
      [req.params.id]
    );

    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
